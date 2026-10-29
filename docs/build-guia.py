"""Genera docs/guia-componentes.pdf: arma la guía en HTML y la imprime a PDF con Edge o Chrome headless.

Uso (desde la raíz del proyecto):  python docs/build-guia.py
Opcional: --html  también deja docs/guia-componentes.html para revisarlo en el navegador.

Al cambiar las props de un componente, actualiza su sección en este archivo y vuelve a generar el PDF.
"""
import html
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DOCS = Path(__file__).resolve().parent
PDF = DOCS / "guia-componentes.pdf"
KEEP_HTML = "--html" in sys.argv

BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "msedge",
    "google-chrome",
    "chromium",
]

# ---------------------------------------------------------------- helpers

KEYWORDS = r"\b(import|from|export|default|const|let|await|async|return|if|else|new|function|type|true|false|null|undefined)\b"


def hl(code: str) -> str:
    """Resaltado mínimo: escapa y colorea comentarios, strings y palabras clave."""
    code = code.strip("\n")
    out = []
    for line in code.split("\n"):
        esc = html.escape(line)
        # comentarios de línea
        m = re.search(r"(//.*)$", esc)
        comment = ""
        if m and not re.search(r"https?:$", esc[: m.start()]):
            comment = f'<span class="c">{m.group(1)}</span>'
            esc = esc[: m.start()]
        # strings
        esc = re.sub(r"(&quot;.*?&quot;|`[^`]*`)", r'<span class="s">\1</span>', esc)
        # palabras clave (fuera de spans ya marcados: aproximación suficiente)
        parts = re.split(r"(<span.*?</span>)", esc)
        parts = [p if p.startswith("<span") else re.sub(KEYWORDS, r'<span class="k">\1</span>', p) for p in parts]
        esc = "".join(parts)
        # componentes JSX
        esc = re.sub(r"(&lt;/?)([A-Z]\w*)", r'\1<span class="t">\2</span>', esc)
        out.append(esc + comment)
    return "<pre><code>" + "\n".join(out) + "</code></pre>"


def props(rows):
    body = "".join(
        f"<tr><td><code>{html.escape(n)}</code></td><td><code>{html.escape(t)}</code></td><td>{d}</td></tr>"
        for n, t, d in rows
    )
    return f'<table class="props"><thead><tr><th>Prop</th><th>Tipo</th><th>Descripción</th></tr></thead><tbody>{body}</tbody></table>'


def example(n, title, desc, code):
    return f'<div class="example"><div class="ex-head"><span class="ex-num">Ejemplo {n}</span> {title}</div><p>{desc}</p>{hl(code)}</div>'


def section(id_, title, intro, prop_rows, examples, extra=""):
    exs = "".join(example(i + 1, *e) for i, e in enumerate(examples))
    p = props(prop_rows) if prop_rows else ""
    return f'<section id="{id_}"><h2>{title}</h2><p class="lead">{intro}</p>{p}{extra}{exs}</section>'


def note(text, kind="info"):
    return f'<div class="note {kind}">{text}</div>'


COMMON = [
    ("name", "FieldPath<T>", "Nombre del campo en el form (obligatorio). Con el genérico <code>&lt;FormInput&gt;</code> TypeScript lo autocompleta."),
    ("label", "string", "Etiqueta del campo."),
    ("hint", "string", "Texto de ayuda bajo el control. Con <code>errorMode=\"inline\"</code> se reemplaza por el error cuando lo hay."),
    ("direction", '"col" | "row"', "<code>col</code> (defecto): label arriba. <code>row</code>: label a la izquierda si el campo mide ≥ 24rem."),
    ("onChange", "(value, form) => void", "Se ejecuta cuando el <b>usuario</b> cambia el valor (como <code>@api.onchange</code>). Ver la sección «Onchange»."),
    ("disabled", "boolean", "Deshabilita el campo."),
    ("rules", "RegisterOptions", "Reglas de RHF. Solo para forms sin esquema Zod."),
]

# ---------------------------------------------------------------- contenido

sections = []

sections.append(section(
    "form", "useZodForm + FormLayout",
    "Todo formulario se arma con <b>useZodForm</b> (useForm + validación Zod) y <b>FormLayout</b>, que provee el contexto a los Fields, "
    "maneja el envío y avisa si el usuario intenta salir con cambios sin guardar (estilo Odoo).",
    [
        ("methods", "UseFormReturn", "Resultado de <code>useZodForm(schema, opciones)</code>."),
        ("onSubmit", "(values) => void | Promise", "Recibe los valores ya validados y transformados por el esquema. Si lanza error, el form sigue “con cambios”."),
        ("onInvalid", "(errors) => void", "Opcional. Se llama cuando la validación falla."),
        ("guardUnsaved", "boolean", "Aviso de cambios sin guardar al salir. <b>true</b> por defecto."),
        ("errorMode", '"toast" | "inline"', "<code>toast</code> (defecto): los errores de validación se muestran en toasts y el campo solo queda en rojo. "
         "<code>inline</code>: el mensaje va debajo de cada campo."),
        ("className / …", "props de <form>", "Cualquier prop nativa del form. Por defecto <code>flex flex-col gap-2</code>."),
    ],
    [
        ("Alta de cliente", "Esquema Zod, tipos inferidos y envío con carga y mensaje de éxito.", """
"use client";
import { z } from "zod";
import useZodForm from "@/hooks/useZodForm";
import FormLayout from "@/components/ui/form/FormLayout";
import FieldText from "@/components/ui/form/FieldText";
import { withLoading, modalSuccess, modalError } from "@/components/ui/modal/modal";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.email("Ingresa un correo válido"),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export default function ClienteForm() {
  const methods = useZodForm(schema, { defaultValues: { name: "", email: "" } });

  const onSubmit = async (values: FormValues) => {
    try {
      await withLoading(api.createCliente(values), "Guardando cliente…");
      await modalSuccess("Cliente creado.");
    } catch (error) {
      modalError(error);
      throw error; // el form sigue marcado con cambios sin guardar
    }
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <FieldText<FormInput> name="name" label="Nombre" />
      <FieldText<FormInput> name="email" type="email" label="Correo" />
      <button type="submit" className="btn btn-primary">Guardar</button>
    </FormLayout>
  );
}
"""),
        ("Edición con datos de la API", "Los <code>defaultValues</code> son el punto “sin cambios”. Aquí se desactiva el aviso de salida y los errores se muestran bajo cada campo.", """
export default function EditarCliente({ cliente }: { cliente: Cliente }) {
  const methods = useZodForm(schema, {
    defaultValues: { name: cliente.name, email: cliente.email },
  });

  return (
    <FormLayout
      methods={methods}
      onSubmit={(values) => api.updateCliente(cliente.id, values)}
      guardUnsaved={false}   // p. ej. en un filtro de búsqueda
      errorMode="inline"     // mensajes bajo cada campo en lugar de toasts
      className="grid grid-cols-2 gap-4"
    >
      <FieldText<FormInput> name="name" label="Nombre" direction="row" />
      <FieldText<FormInput> name="email" label="Correo" direction="row" />
      <button type="submit" className="btn btn-primary col-span-2">Actualizar</button>
    </FormLayout>
  );
}
"""),
    ],
    extra=note("<b>Errores de validación:</b> por defecto se muestran en toasts (react-hot-toast). Al salir de un campo inválido aparece un toast solo para ese campo, que se cierra al corregirlo; al enviar con errores aparece un único toast con el resumen. El <code>&lt;AppToaster /&gt;</code> ya está montado en el layout raíz; puedes lanzar tus propios toasts con <code>import toast from \"react-hot-toast\"</code>.") + note("<b>Al guardar con éxito</b> el formulario vuelve a quedar “sin cambios”. El diálogo de salida ofrece "
               "<i>Seguir editando</i>, <i>Descartar cambios</i> y <i>Guardar y salir</i>. Cubre enlaces, botón atrás/adelante, "
               "recarga y cierre de pestaña; no bloquea <code>router.push()</code> llamado desde código."),
))

sections.append(section(
    "group", "FormGroup y FormCol — acomodar Fields en columnas",
    "<b>FormGroup</b> es un contenedor en grid para los Fields (como <code>&lt;group&gt;</code> de Odoo). Las columnas se "
    "definen por tamaño de pantalla; cada Field ocupa una columna y <b>FormCol</b> hace que ocupe varias (como "
    "<code>colspan</code>). Los dos se importan de <code>@/components/ui/form/FormGroup</code>.",
    [
        ("xs", "1–12", "Columnas base (móvil en adelante). <b>1</b> por defecto."),
        ("sm / md / lg / xl", "1–12", "Columnas desde 640 / 768 / 1024 / 1280 px."),
        ("title / description", "string", "Solo FormGroup. Encabezado opcional con línea divisoria."),
        ("className", "string", "Clases extra del contenedor."),
        ("FormCol xs…xl", "1–12", "Columnas que ocupa su contenido en cada tamaño."),
    ],
    [
        ("Datos de un cliente en 4 columnas", "1 columna en móvil, 2 en tablet y 4 en escritorio; la dirección ocupa todo el ancho.", """
import FormGroup, { FormCol } from "@/components/ui/form/FormGroup";

<FormLayout methods={methods} onSubmit={onSubmit}>
  <FormGroup title="Datos generales" description="Información fiscal del cliente" xs={1} sm={2} lg={4}>
    <FieldText<FormInput> name="name" label="Nombre" />
    <FieldText<FormInput> name="rfc" label="RFC" />
    <FieldText<FormInput> name="email" label="Correo" />
    <FieldText<FormInput> name="phone" label="Teléfono" />
    <FormCol sm={2} lg={4}>
      <FieldText<FormInput> name="address" label="Dirección" />
    </FormCol>
  </FormGroup>
</FormLayout>
"""),
        ("Varios grupos en un formulario", "Cada grupo define sus columnas; un FormCol puede ocupar distinto ancho según el tamaño.", """
<FormLayout methods={methods} onSubmit={onSubmit} className="flex flex-col gap-6">
  <FormGroup title="Crédito" xs={1} md={3}>
    <FieldNumber<FormInput> name="limit" label="Límite" widget="monetary" />
    <FieldNumber<FormInput> name="days" label="Días de crédito" widget="integer" />
    <FieldSelect<FormInput> name="priceListId" label="Lista de precios" options={listas} />
    <FormCol md={3}>
      <FieldTextarea<FormInput> name="notes" label="Notas" />
    </FormCol>
  </FormGroup>

  <FormGroup title="Entrega" xs={2} lg={6}>
    <FormCol xs={2} lg={4}>
      <FieldText<FormInput> name="street" label="Calle y número" />
    </FormCol>
    <FieldText<FormInput> name="zip" label="C.P." />
    <FieldText<FormInput> name="city" label="Ciudad" />
  </FormGroup>
</FormLayout>
"""),
    ],
    extra=note("Las columnas responden al <b>ancho de la pantalla</b> (breakpoints de Tailwind). Dentro de un modal o panel "
               "angosto usa menos columnas en <code>lg</code>/<code>xl</code>, o deja solo <code>xs</code>."),
))

sections.append(section(
    "comunes","Props comunes de todos los Fields",
    "Todos los Fields comparten estas props, además de las propias de cada uno. El valor, el error y el estado los toman del "
    "<code>FormLayout</code>, así que no se pasa <code>value</code>; <code>onChange</code> es opcional y solo sirve para "
    "reaccionar al cambio (el valor se guarda solo).",
    COMMON,
    [
        ("Layout vertical (por defecto)", "Label arriba, error o hint abajo.", """
<FieldText<FormInput> name="phone" label="Teléfono" hint="10 dígitos, sin espacios" />
"""),
        ("Layout horizontal", "Label a la izquierda (10rem) y control a la derecha. En contenedores angostos vuelve a vertical solo.", """
<FieldText<FormInput>   name="rfc"   label="RFC"    direction="row" />
<FieldNumber<FormInput> name="limit" label="Límite" direction="row" widget="monetary" />
<FieldBoolean<FormInput> name="active" label="Activo" direction="row" variant="toggle" />
"""),
    ],
))

sections.append(section(
    "text", "FieldText",
    "Input de texto de daisyUI. Acepta cualquier prop nativa de <code>&lt;input&gt;</code> (<code>type</code>, <code>placeholder</code>, <code>maxLength</code>…).",
    [("type", "string", "<code>text</code> por defecto; también <code>email</code>, <code>password</code>, <code>tel</code>, etc.")],
    [
        ("Correo y contraseña", "", """
// esquema: email: z.email("Correo inválido"), password: z.string().min(8, "Mínimo 8 caracteres")
<FieldText<FormInput> name="email" type="email" label="Correo" autoComplete="email" />
<FieldText<FormInput> name="password" type="password" label="Contraseña" />
"""),
        ("RFC en mayúsculas", "La transformación vive en el esquema; el campo solo captura.", """
// esquema:
rfc: z.string().trim().toUpperCase().regex(/^[A-ZÑ&]{3,4}\\d{6}[A-Z\\d]{3}$/, "RFC inválido"),

<FieldText<FormInput> name="rfc" label="RFC" maxLength={13} placeholder="XAXX010101000" />
"""),
    ],
))

sections.append(section(
    "textarea", "FieldTextarea",
    "Textarea simple o, con <code>widget=\"html\"</code>, un editor enriquecido (Tiptap) con títulos, listas, tablas, alertas de daisyUI, "
    "imágenes y atajos tipo Markdown (<code>##</code>, <code>**negrita**</code>, <code>-</code>, <code>&gt;</code>). El editor solo se descarga donde se usa.",
    [
        ("widget", '"text" | "html"', "Tipo de editor. <code>text</code> por defecto."),
        ("rows", "number", "Solo text. 3 por defecto."),
        ("maxLength", "number", "Solo text. Muestra el contador <code>120/500</code>."),
        ("onUploadImage", "(file) => Promise<string>", "Solo html. Sube la imagen y devuelve su URL; sin esto se inserta en base64."),
    ],
    [
        ("Notas con límite", "", """
// esquema: notes: z.string().max(500, "Máximo 500 caracteres"),
<FieldTextarea<FormInput> name="notes" label="Notas" rows={4} maxLength={500} />
"""),
        ("Descripción en HTML con subida de imágenes", "El valor es un string HTML (vacío = <code>\"\"</code>).", """
// esquema: description: z.string().min(1, "Escribe la descripción"),
<FieldTextarea<FormInput>
  name="description"
  label="Descripción del producto"
  widget="html"
  onUploadImage={async (file) => {
    const res = await fetch("/api/uploads", { method: "POST", body: toFormData({ file }) });
    return (await res.json()).url;
  }}
/>
"""),
    ],
    extra=note("Al <b>mostrar</b> ese HTML en otra pantalla, límpialo antes (DOMPurify o en el backend) y usa la clase "
               "<code>rich-text prose</code> para que se vea igual que en el editor.", "warn"),
))

sections.append(section(
    "number", "FieldNumber",
    "Guarda siempre un <code>number</code> (nunca string). Al escribir muestra el número sin formato; al salir lo formatea "
    "(<code>$1,000.00</code>). Limita decimales <b>sin redondear</b>, alinea a la derecha y arranca en 0.",
    [
        ("widget", '"float" | "integer" | "monetary"', "<code>float</code> por defecto."),
        ("decimals", "number", "Obligatorio con <code>float</code>. No se permite con los otros widgets."),
        ("currency", "string", "Solo monetary. <code>MXN</code> por defecto."),
        ("locale", "string", "<code>es-MX</code> por defecto."),
    ],
    [
        ("Precio y cantidad", "", """
// esquema:
price: z.number().positive("El precio debe ser mayor a 0"),
qty: z.number().int().min(1, "Mínimo 1 pieza"),

<FieldNumber<FormInput> name="price" label="Precio" widget="monetary" />
<FieldNumber<FormInput> name="qty"   label="Cantidad" widget="integer" />
"""),
        ("Peso con 3 decimales y moneda extranjera", "", """
<FieldNumber<FormInput> name="weight" label="Peso (kg)" decimals={3} />          // 1,234.500
<FieldNumber<FormInput> name="costUsd" label="Costo" widget="monetary" currency="USD" />
"""),
    ],
))

sections.append(section(
    "select", "FieldSelect",
    "Select nativo de daisyUI. Guarda el valor original de la opción (respeta <code>number</code>) o <code>null</code> sin selección. "
    "El tipo <code>SelectOption</code> se comparte con FieldRadio y FieldChoice.",
    [
        ("options", "SelectOption[]", "<code>{ value: string | number; label: string; disabled?: boolean }</code>"),
        ("placeholder", "string", "“Selecciona una opción” por defecto."),
    ],
    [
        ("Opciones fijas", "", """
// esquema: unit: z.enum(["pz", "kg", "lt"], { error: "Selecciona la unidad" }),
<FieldSelect<FormInput>
  name="unit"
  label="Unidad"
  options={[
    { value: "pz", label: "Pieza" },
    { value: "kg", label: "Kilogramo" },
    { value: "lt", label: "Litro" },
  ]}
/>
"""),
        ("Catálogo desde la API", "Se mapean los registros al formato de opciones.", """
// esquema: warehouseId: z.number({ error: "Selecciona un almacén" }),
const options: SelectOption[] = almacenes.map((a) => ({
  value: a.id,
  label: a.nombre,
  disabled: !a.activo,
}));

<FieldSelect<FormInput> name="warehouseId" label="Almacén" options={options} />
"""),
    ],
))

sections.append(section(
    "boolean", "FieldBoolean",
    "Checkbox o toggle que guarda <code>true</code>/<code>false</code>.",
    [("variant", '"checkbox" | "toggle"', "<code>checkbox</code> por defecto."), ("label", "string", "Obligatorio. En <code>row</code> va en la columna del label.")],
    [
        ("Aceptar términos", "", """
// esquema: terms: z.literal(true, { error: "Debes aceptar los términos" }),
<FieldBoolean<FormInput> name="terms" label="Acepto los términos y condiciones" />
"""),
        ("Toggle en layout horizontal", "", """
<FieldBoolean<FormInput> name="active" label="Activo" variant="toggle" direction="row" />
"""),
    ],
))

sections.append(section(
    "radio", "FieldRadio",
    "Una opción de varias. Variante de círculos clásicos o grupo de botones (segmented).",
    [
        ("options", "SelectOption[]", "Mismas opciones que FieldSelect."),
        ("variant", '"radio" | "buttons"', "<code>radio</code> por defecto."),
        ("orientation", '"vertical" | "horizontal"', "Acomodo de las opciones. <code>vertical</code> por defecto."),
    ],
    [
        ("Tipo de pago", "", """
// esquema: paymentType: z.enum(["cash", "credit"], { error: "Selecciona el tipo de pago" }),
<FieldRadio<FormInput>
  name="paymentType"
  label="Tipo de pago"
  orientation="horizontal"
  options={[{ value: "cash", label: "Contado" }, { value: "credit", label: "Crédito" }]}
/>
"""),
        ("Prioridad como botones", "", """
// esquema: priority: z.number({ error: "Selecciona la prioridad" }),
<FieldRadio<FormInput>
  name="priority"
  label="Prioridad"
  variant="buttons"
  orientation="horizontal"
  options={[{ value: 1, label: "Baja" }, { value: 2, label: "Media" }, { value: 3, label: "Alta" }]}
/>
"""),
    ],
))

sections.append(section(
    "choice", "FieldChoice",
    "Varias opciones a la vez. Guarda un arreglo con los valores en el orden de la lista (no en el de los clics). Arranca en <code>[]</code>.",
    [
        ("options", "SelectOption[]", "Mismas opciones que FieldSelect."),
        ("variant", '"checkbox" | "buttons"', "<code>checkbox</code> por defecto."),
        ("orientation", '"vertical" | "horizontal"', "<code>vertical</code> por defecto."),
    ],
    [
        ("Módulos con acceso", "", """
// esquema: modules: z.array(z.string()).min(1, "Selecciona al menos un módulo"),
<FieldChoice<FormInput>
  name="modules"
  label="Módulos"
  options={[
    { value: "sales", label: "Ventas" },
    { value: "purchases", label: "Compras" },
    { value: "inventory", label: "Inventario" },
  ]}
/>
"""),
        ("Días de entrega como botones", "", """
// esquema: days: z.array(z.number()).min(1, "Selecciona al menos un día"),
<FieldChoice<FormInput>
  name="days"
  label="Días de entrega"
  variant="buttons"
  orientation="horizontal"
  options={["Lun", "Mar", "Mié", "Jue", "Vie"].map((d, i) => ({ value: i + 1, label: d }))}
/>
"""),
    ],
))

sections.append(section(
    "date", "FieldDate",
    "Calendario de daisyUI (react-day-picker) en español. Guarda strings ISO, no objetos <code>Date</code>, para evitar desfases de zona horaria.",
    [
        ("mode", '"single" | "range"', "<code>single</code> → <code>\"2026-10-27\"</code>. <code>range</code> → <code>{ from, to }</code>."),
        ("withTime", "boolean", "Solo single. Agrega hora → <code>\"2026-10-27T14:30\"</code>."),
        ("min / max", '"YYYY-MM-DD"', "Deshabilita los días fuera del rango."),
        ("numberOfMonths", "number", "Meses visibles. 1 por defecto."),
        ("placeholder", "string", "Texto cuando está vacío."),
    ],
    [
        ("Vencimiento y entrega con hora", "", """
// esquema:
dueDate: z.iso.date({ error: "La fecha es obligatoria" }),
deliveredAt: z.iso.datetime({ local: true }).nullable(),

<FieldDate<FormInput> name="dueDate" label="Vencimiento" min="2026-01-01" />
<FieldDate<FormInput> name="deliveredAt" label="Entregado" withTime />
"""),
        ("Periodo de un reporte", "Primer clic = inicio, segundo = fin; si van al revés se ordenan solos.", """
// esquema:
period: z.object(
  { from: z.iso.date(), to: z.iso.date({ error: "Selecciona la fecha final" }) },
  { error: "Selecciona un periodo" },
),

<FieldDate<FormInput> name="period" label="Periodo" mode="range" numberOfMonths={2} />
"""),
    ],
))

sections.append(section(
    "image", "FieldImage",
    "Recuadro para elegir o arrastrar una imagen, con vista previa y botón para quitarla. Guarda un <code>File</code> nuevo, "
    "un <code>string</code> (URL actual al editar) o <code>null</code>.",
    [
        ("shape", '"square" | "circle"', "<code>square</code> por defecto."),
        ("size", "string", "Clases de tamaño. <code>size-40</code> por defecto."),
        ("accept", "string", "<code>png, jpeg, webp</code> por defecto."),
    ],
    [
        ("Foto de perfil", "", """
// esquema:
avatar: z.union([
  z.file().max(2 * 1024 * 1024, "Máximo 2 MB")
    .mime(["image/png", "image/jpeg", "image/webp"], "Solo PNG, JPG o WEBP"),
  z.string(),
]).nullable(),

<FieldImage<FormInput> name="avatar" label="Foto" shape="circle" />
"""),
        ("Editar la imagen de un producto", "Se pasa la URL actual como default; si no la cambian, se envía la misma URL.", """
const methods = useZodForm(schema, { defaultValues: { photo: producto.photoUrl } });

<FieldImage<FormInput> name="photo" label="Imagen" size="size-56" />
"""),
    ],
))

sections.append(section(
    "file", "FieldFile",
    "Zona para elegir o arrastrar un archivo. Muestra una tarjeta con ícono, nombre y tamaño; los PDF e imágenes se pueden "
    "ver en un modal (visor del navegador), los demás se descargan.",
    [("accept", "string", "PDF, imágenes, <code>.xlsx</code>, <code>.xls</code> y <code>.csv</code> por defecto.")],
    [
        ("Contrato en PDF obligatorio", "", """
// esquema:
contract: z.union([
  z.file().max(10 * 1024 * 1024, "Máximo 10 MB").mime(["application/pdf"], "Solo PDF"),
  z.string(),
]).nullable().refine((v) => v !== null, "Adjunta el contrato"),

<FieldFile<FormInput> name="contract" label="Contrato" accept="application/pdf" />
"""),
        ("Importar un Excel", "", """
<FieldFile<FormInput>
  name="layout"
  label="Layout de precios"
  accept=".xlsx,.xls,.csv"
  hint="Descarga la plantilla desde Configuración > Precios"
/>
"""),
    ],
))

sections.append(section(
    "formdata", "toFormData — enviar archivos",
    "Convierte los valores del form a <code>FormData</code> (multipart). Archivos tal cual; arreglos simples como una entrada por "
    "elemento; objetos como JSON; <code>null</code> se omite. No pongas <code>Content-Type</code>: el navegador agrega el boundary.",
    [],
    [
        ("Crear con imagen y contrato", "", """
import { toFormData } from "@/lib/toFormData";

const onSubmit = async (values: FormValues) => {
  await fetch("/api/clientes", { method: "POST", body: toFormData(values) });
};
"""),
        ("Editar con campos extra", "", """
await fetch(`/api/clientes/${id}`, {
  method: "PUT",
  body: toFormData({ ...values, updatedBy: user.id }),
});
// period={"from":"2026-10-12","to":"2026-10-16"}  → el backend lo lee como JSON
"""),
    ],
))

sections.append(section(
    "modals", "Modales globales",
    "Funciones globales que se pueden llamar desde cualquier parte, incluso fuera de React (helpers de fetch, interceptores). "
    "<code>&lt;ModalProvider /&gt;</code> ya está montado en el layout raíz. Si se piden varios a la vez, se muestran en cola. "
    "También existe <code>useModal()</code>, que devuelve las mismas funciones.",
    [
        ("modalAlert / modalWarning", "(message, options?) => Promise<void>", "Aviso informativo o de advertencia."),
        ("modalSuccess", "(message, options?) => Promise<void>", "Éxito con palomita animada y título “¡Listo!”."),
        ("modalError", "(error, options?) => Promise<void>", "Acepta string, <code>Error</code> o lo capturado en un catch."),
        ("modalConfirm", "(message, options?) => Promise<boolean>", "<code>true</code> si confirma; <code>false</code> si cancela o pulsa Escape."),
        ("alertLoading", "(message?) => () => void", "Pantalla de carga con puntos; devuelve la función para cerrarla."),
        ("withLoading", "(promise, message?) => Promise<T>", "Muestra la carga mientras corre la promesa y la cierra siempre."),
        ("options", "{ title, confirmText, cancelText, danger }", "<code>danger</code> pone el botón principal en rojo (confirm)."),
    ],
    [
        ("Avisos y errores", "", """
import { modalAlert, modalSuccess, modalError } from "@/components/ui/modal/modal";

modalAlert("Tu sesión expira en 5 minutos.");
await modalSuccess("Pedido enviado al almacén.", { title: "¡Enviado!" });

try {
  await api.timbrarFactura(id);
} catch (error) {
  modalError(error, { title: "No se pudo timbrar" });   // muestra error.message
}
"""),
        ("Confirmar, cargar y avisar", "Flujo típico de una acción destructiva.", """
import { modalConfirm, withLoading, modalSuccess, alertLoading } from "@/components/ui/modal/modal";

const ok = await modalConfirm("¿Eliminar la factura F-0012? Esta acción no se puede deshacer.", {
  title: "Eliminar factura",
  confirmText: "Eliminar",
  danger: true,
});
if (!ok) return;

await withLoading(api.deleteFactura(id), "Eliminando…");
await modalSuccess("Factura eliminada.");

// Forma manual de la carga:
const close = alertLoading("Guardando nueva contraseña");
try { await api.changePassword(data); } finally { close(); }
"""),
    ],
))

sections.append(section(
    "onchange", "Onchange — reaccionar a cambios",
    "El equivalente a <code>@api.onchange</code> de Odoo. Hay dos formas y ambas se disparan <b>solo cuando el usuario cambia "
    "el valor</b>: los cambios hechos con <code>form.setValue()</code> (incluidos los del propio onchange) no las vuelven a "
    "disparar, así que un onchange puede actualizar otros campos sin entrar en bucle.",
    [
        ("onChange (prop)", "(value, form) => void", "En cualquier Field. <code>value</code> trae el tipo del campo (number, boolean, File…); "
         "<code>form</code> es el form completo (<code>setValue</code>, <code>getValues</code>, <code>resetField</code>…). Para reacciones de un solo campo."),
        ("useOnChange", "(methods, campos[], handler) => void", "Hook a nivel form: <code>handler(values, { name, form })</code> se ejecuta cuando cambia "
         "cualquiera de los campos indicados, con todos los valores actuales. Ideal para campos calculados que dependen de varios."),
    ],
    [
        ("onChange en un Field: cargar condiciones del cliente", "Al elegir el cliente se consultan sus datos y se llenan otros campos. "
         "Puede ser <code>async</code>; combínalo con <code>withLoading</code> si la consulta tarda.", """
<FieldSelect<FormInput>
  name="customerId"
  label="Cliente"
  options={clientes}
  onChange={async (customerId, form) => {
    if (customerId == null) return;
    const cliente = await withLoading(api.getCliente(customerId), "Cargando cliente…");
    form.setValue("paymentTermDays", cliente.diasCredito, { shouldDirty: true });
    form.setValue("priceListId", cliente.listaPrecios, { shouldDirty: true });
  }}
/>

// Otro uso común: limpiar un campo dependiente
<FieldBoolean<FormInput>
  name="requiresInvoice"
  label="Requiere factura"
  onChange={(checked, form) => { if (!checked) form.setValue("rfc", ""); }}
/>
"""),
        ("useOnChange: subtotal, IVA y total", "Como <code>@api.onchange('qty', 'price', 'discount')</code>. Los campos calculados se "
         "pueden mostrar con <code>disabled</code> para que el usuario no los edite.", """
import useOnChange from "@/hooks/useOnChange";

const methods = useZodForm(schema, { defaultValues });

useOnChange(methods, ["qty", "price", "discount"], (values, { form }) => {
  // FieldNumber vale null mientras el usuario borra el campo
  const { qty = 0, price = 0, discount = 0 } = values;
  const subtotal = (qty ?? 0) * (price ?? 0) * (1 - (discount ?? 0) / 100);
  form.setValue("subtotal", subtotal);
  form.setValue("tax", subtotal * 0.16);
  form.setValue("total", subtotal * 1.16);
});

<FieldNumber<FormInput> name="qty"      label="Cantidad"  widget="integer" />
<FieldNumber<FormInput> name="price"    label="Precio"    widget="monetary" />
<FieldNumber<FormInput> name="discount" label="Desc. %"   decimals={2} />
<FieldNumber<FormInput> name="total"    label="Total"     widget="monetary" disabled />
"""),
    ],
    extra=note("En campos de texto y números el onchange se dispara <b>con cada tecla</b>. Si llama a una API "
               "(p. ej. buscar un RFC), espera a que el usuario termine: usa un debounce o haz la consulta en el "
               "<code>onBlur</code>. Para cálculos locales no hace falta.", "warn"),
))

# ---------------------------------------------------------------- documento

# Numera las secciones en el orden en que aparecen (así se pueden insertar sin renumerar a mano)
sections = [
    s.replace("<h2>", f"<h2>{i}. ", 1) for i, s in enumerate(sections, start=1)
]

toc = "".join(
    f'<li><a href="#{m.group(1)}">{m.group(2)}</a></li>'
    for m in (re.search(r'<section id="(\w+)"><h2>(.*?)</h2>', s) for s in sections)
)

CSS = """
@page { size: Letter; margin: 18mm 16mm 18mm 16mm;
  @bottom-center { content: "Guía de componentes · ERP GI  —  " counter(page); font: 8pt 'Segoe UI', sans-serif; color: #8a8f98; } }
@page :first { @bottom-center { content: none; } }
* { box-sizing: border-box; }
body { font: 10pt/1.5 'Segoe UI', system-ui, sans-serif; color: #1f2430; margin: 0; }
h1 { font-size: 30pt; margin: 0; letter-spacing: -0.5px; }
h2 { font-size: 16pt; margin: 0 0 6px; color: #0b5cad; border-bottom: 2px solid #e3e8ef; padding-bottom: 4px; }
p { margin: 4px 0 8px; }
.lead { color: #3b4250; }
a { color: #0b5cad; text-decoration: none; }
code { font: 8.6pt Consolas, 'Cascadia Mono', monospace; background: #f1f4f8; padding: 0 3px; border-radius: 3px; }
pre { background: #1e2430; color: #e6e9ef; border-radius: 6px; padding: 9px 11px; margin: 6px 0 0; white-space: pre-wrap; word-break: break-word; }
pre code { background: none; padding: 0; color: inherit; font-size: 8.2pt; line-height: 1.45; }
.k { color: #c792ea; } .s { color: #c3e88d; } .c { color: #7f8aa0; font-style: italic; } .t { color: #82aaff; }
section { break-before: page; }
.example { margin-top: 12px; }
.ex-head, .example > p { break-after: avoid; }
pre { orphans: 4; widows: 4; }
.ex-head { font-weight: 600; font-size: 10.5pt; }
.ex-num { display: inline-block; background: #0b5cad; color: #fff; font-size: 7.5pt; padding: 1px 7px; border-radius: 9px; margin-right: 6px; vertical-align: 1px; }
table.props { width: 100%; border-collapse: collapse; margin: 8px 0 4px; font-size: 8.8pt; break-inside: avoid; }
table.props th { text-align: left; background: #eef2f7; padding: 4px 6px; font-weight: 600; }
table.props td { border-top: 1px solid #e3e8ef; padding: 4px 6px; vertical-align: top; }
table.props td:first-child { white-space: nowrap; }
table.props td code { background: none; padding: 0; }
.note { border-left: 3px solid #0b5cad; background: #eef5fd; padding: 6px 10px; border-radius: 4px; margin: 10px 0 0; font-size: 9pt; break-inside: avoid; }
.note.warn { border-color: #d98b00; background: #fff6e5; }
.cover { height: 235mm; display: flex; flex-direction: column; justify-content: space-between; }
.cover .band { background: linear-gradient(135deg, #0b5cad, #3c8ce0); color: #fff; border-radius: 10px; padding: 34px 32px; }
.cover .band p { color: #dbe9fb; font-size: 12pt; margin-top: 8px; }
.meta { color: #6a7180; font-size: 9pt; }
.toc { columns: 2; list-style: none; padding-left: 0; margin: 6px 0 0; }
.toc li { margin: 3px 0; }
.files code { font-size: 8.4pt; }
"""

cover = f"""
<div class="cover">
  <div>
    <div class="band">
      <h1>Guía de componentes</h1>
      <p>Formularios, campos y modales del ERP GI — Next.js · react-hook-form · Zod · Tailwind · daisyUI</p>
    </div>
    <h3 style="margin:26px 0 4px">Contenido</h3>
    <ul class="toc">{toc}</ul>
  </div>
  <div>
    {note("<b>Cómo leer esta guía.</b> Cada componente trae una tabla con sus props y dos ejemplos. En los ejemplos, "
          "<code>FormInput</code> y <code>FormValues</code> son <code>z.input</code> y <code>z.output</code> del esquema del formulario.")}
    <p class="files meta" style="margin-top:14px">
      Archivos: <code>src/components/ui/form/</code> (FormLayout y Fields) · <code>src/components/ui/modal/</code> ·
      <code>src/hooks/useZodForm.ts</code> · <code>src/lib/toFormData.ts</code><br>
      Versión del 29 de octubre de 2026
    </p>
  </div>
</div>
"""

doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Guía de componentes · ERP GI</title>
<style>{CSS}</style></head><body>{cover}{''.join(sections)}</body></html>"""



def find_browser():
    for candidate in BROWSERS:
        if Path(candidate).exists():
            return candidate
        found = shutil.which(candidate)
        if found:
            return found
    sys.exit("No se encontró Edge ni Chrome para imprimir el PDF.")


with tempfile.TemporaryDirectory() as tmp:
    html_path = DOCS / "guia-componentes.html" if KEEP_HTML else Path(tmp) / "guia.html"
    html_path.write_text(doc, encoding="utf-8")

    subprocess.run(
        [
            find_browser(),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--user-data-dir={Path(tmp) / 'profile'}",
            f"--print-to-pdf={PDF}",
            html_path.as_uri(),
        ],
        check=True,
        capture_output=True,
    )

print(f"PDF generado: {PDF}")
if KEEP_HTML:
    print(f"HTML: {html_path}")
