# CLAUDE.md — ERP GI Administración (front)

Front del ERP multiempresa. Tiene dos partes:

- **Administrador principal:** crea y configura las empresas (tenants), sus módulos, usuarios y permisos.
- **Aplicación de cada empresa:** lo que usa cada tenant, en su propio subdominio.

El backend es una API REST aparte (repositorio `ERP-Backend`). Este repo solo es el front.

La forma de programar sigue la del proyecto `front-checador-next`, en especial el código de Tabatha, para que quien viene de ese proyecto reconozca todo. Cuando el stack es distinto, se conserva la lógica y cambia la herramienta (sección 4).

---

## 1. Reglas de trabajo (obligatorias)

- **Responde siempre en español**, claro y sin tecnicismos de más.
- **No hagas commits ni push.** El desarrollador los hace. Al terminar, di qué archivos cambiaste.
- **No toques servidores, DNS, túnel ni bases de datos.** Es un proyecto real en producción con servidor compartido. Si algo se necesita ahí, entrégalo como lista.
- **Revisión permitida:** `npm run typecheck` y `npx eslint <archivos cambiados>`.
- **No escribas credenciales** en archivos, código ni entregables. No leas ni muestres `.env`.
- **Solo lectura contra staging**, salvo autorización del desarrollador.
- **No inventes campos del backend.** Revisa `ERP-Backend` (rutas, validadores e interfaces). Si un dato no existe, usa un valor por defecto seguro y dilo.
- **Respeta lo que ya existe.** No cambies diseño, textos, flujos ni nombres que no te pidieron.
- **Sigue el Figma** cuando exista captura de la pantalla. Si choca con esta guía, pregunta.
- **Avisa las decisiones** que el pedido no mencionaba.
- **Comentarios en español**, cortos, que expliquen el porqué.
- **Ortografía:** todo texto visible va en español correcto, con acentos.
- **Next.js 16 cambia respecto al checador.** Antes de usar una API de Next, consulta `node_modules/next/dist/docs/`.

---

## 2. Stack

| Pieza | Versión / nota |
|---|---|
| Next.js | 16.4 (App Router, server actions, `output: "standalone"`, Cache Components, React Compiler) |
| React | 19.3 |
| UI | Tailwind 4 + daisyUI 5 (tema `corporate`) |
| Íconos | lucide-react |
| Formularios | react-hook-form + Zod 4 (`useZodForm`) |
| Editor | Tiptap |
| Avisos | Modales propios (`modal.ts`) y react-hot-toast |

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`.

---

## 3. Estructura

Misma organización por módulo que el checador, dentro de `src/`:

```
src/
  app/
    (auth)/app/<modulo>/page.tsx      Página server. Monta la vista en <Suspense>
    (auth)/app/<modulo>/create/page.tsx
    (auth)/app/<modulo>/views/*.tsx   Vistas server: piden datos y pasan props al cliente
    actions/<modulo>-actions.ts       Server actions: única capa que llama a la API
    api/                              Route handlers propios (health, etc.)
    auth/                             Login
  components/
    <modulo>/                         Cliente: <Modulo>TableList, Create<Modulo>, Update<Modulo>, <Modulo>InfoOne
    ui/                               Componentes compartidos
    ui/form/                          FormLayout, FormGroup y Field*
    ui/modal/                         Modales globales
    ui/navigation/                    Menú y barra superior
  hooks/                              useZodForm, useOnChange, useUnsavedChangesGuard
  lib/
    definitions.ts                    Tipos base (ActionResponse, ApiResponse, User…)
    <modulo>/interface.ts             Modelos del módulo
  schemas/<modulo>.schema.ts          Esquema Zod, tipos y valores por defecto
```

Nombres:

- Carpetas de módulo en camelCase e inglés: `employeePermissions`, `companyModules`.
- Componentes en PascalCase. Interfaces con prefijo `I` cuando son modelos: `ICompany`.
- Acciones con verbo: `fetchCompanies`, `findCompanyById`, `createCompany`, `updateCompany`.

Las listas y formularios se controlan con `searchParams`: `view_type=list|form`, `id`, `page`, `limit`, `search`. Al filtrar se hace `router.push` y la vista server vuelve a pedir los datos.

---

## 4. Del checador a este proyecto

| Checador | Aquí |
|---|---|
| react-bootstrap, Bootswatch | Tailwind + daisyUI |
| bootstrap-icons | lucide-react |
| `useForm` directo | `useZodForm` con esquema en `src/schemas` |
| `Form` + `FieldGroup` | `FormLayout` + `FormGroup` |
| `Entry`, `FieldSelect`, `BooleanField` | `FieldText`, `FieldSelect`, `FieldBoolean`, etc. |
| `useModals()` y callback | `await modalConfirm(...)` importado de `modal.ts` |
| `Loading` con estado local | `withLoading(promesa, "Mensaje...")` |
| `middleware.ts` | `src/proxy.ts` |
| `export const dynamic = "force-dynamic"` | **No usar.** Con Cache Components, los datos sin caché ya corren en cada petición |
| `await searchParams` directo en la página | Leerlo dentro de un componente envuelto en `<Suspense>` |

---

## 5. Patrón de un módulo

**Página:**

```tsx
export default function Page({ searchParams }: PageProps<"/app/companies">) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ListAllCompanies searchParams={searchParams} />
    </Suspense>
  );
}
```

**Vista server:** resuelve `searchParams`, normaliza `page` y `limit` (máximo 100). Si hay `id`, muestra `<Modulo>InfoOne`. Si no, muestra la tabla.

**Server action:**

```ts
"use server";

export async function createCompany(
  data: CompanySchemaType,
): Promise<ActionResponse<ICompany>> {
  try {
    // Llamada a la API con el token de la sesión, solo desde el servidor
    revalidatePath("/app/companies");
    return { success: true, message: "Empresa creada correctamente" };
  } catch (error) {
    return { success: false, message: getApiErrorMessage(error) };
  }
}
```

**Formulario cliente:**

```tsx
const methods = useZodForm(companySchema, { defaultValues: defaultCompany });

const onSubmit = async (data: CompanySchemaType) => {
  if (!(await modalConfirm("¿Seguro que quieres guardar la empresa?"))) return false;

  const res = await withLoading(createCompany(data), "Guardando empresa...");
  if (!res.success) {
    await showError(res); // useActionError: 400 marca campos, 403 refresca permisos
    // Regresar false conserva los cambios sin guardar en FormLayout
    return false;
  }

  await modalSuccess(res.message);
  router.push("/app/companies");
};
```

Reglas del flujo:

- **Toda llamada a la API va en una server action.** El navegador no llama directo a la API.
- La URL es siempre `NEXT_PUBLIC_API_URL`. No usar una URL interna.
- Una acción nunca lanza su error al componente: regresa `{ success: false, message }` con el mensaje del backend si existe.
- Después de mutar: `revalidatePath` en la acción.
- Confirma antes de guardar, eliminar o descargar.
- Errores de validación: los maneja `FormLayout` (toast por defecto). Errores del servidor: `modalError`.
- Booleanos hacia la API: siempre `true`/`false` reales.
- Archivos: `toFormData` de `src/lib/toFormData.ts`.
- Campos nuevos del back: opcionales (`campo?: tipo | null`) con valor por defecto seguro.

---

## 6. Multiempresa (tenants)

Dominios, ya definidos y sin cambiar:

| Entorno | Dominios |
|---|---|
| Producción | `admin.`, `app.` y `<slug>.giadministracion.com` |
| Staging | `admin.`, `app.` y `<slug>.globalbig.com.mx` |
| Local | Según `BASE_DOMAIN=localhost` |

Nunca usar `<x>.staging.dominio` ni el prefijo `stg-`.

Reglas de seguridad:

- **El tenant sale del host de la petición**, resuelto en el servidor. Nunca de un campo, parámetro o valor mandado por el cliente.
- **Una sesión solo vale en su contexto.** Un token de admin no entra a un tenant, ni uno de una empresa a otra.
- **Nunca guardes en caché datos de una empresa o usuario** sin que el tenant forme parte de la llave. Ante la duda, no uses `"use cache"`.
- El front solo oculta o deshabilita según permisos. **El back valida siempre.**
- Cada server action valida la sesión. El proxy no es la única protección.
- El token de la API no se expone a componentes cliente.

---

## 7. Lo que NO se copia del checador

- `console.log` de respuestas de la API, porque pueden contener datos personales.
- `err.response.data.message` sin `?.`: truena cuando no hay respuesta, como en un error de red.
- Listas que devuelven `[]` al fallar: el usuario cree que no hay registros. Usa `ActionResponse` y muestra el error.
- Una petición por cada fila de una tabla. Si falta un dato, se pide al back en la lista.
- `apiToken` dentro de la sesión visible para el cliente.
- Sesiones de 10 años.

---

## 8. Convenciones de UI

- Usa clases y variables de daisyUI (`base-100`, `base-content`, `primary`, `error`…). No uses colores fijos.
- Sin scroll horizontal en la página. Debe funcionar en pantallas chicas.
- Usa los componentes de `src/components/ui` antes de crear uno nuevo.
- **Render condicional:** usa `<ConditionalRender cond={...}>` de `src/components/ui/ConditionalRender.tsx`, igual que en el checador.
- **Componentes del checador:** antes de crear uno, revisa si ya existe en `front-checador-next` y conserva su nombre, props y comportamiento. Solo cambia los estilos a Tailwind y daisyUI.
- Estatus con `badge`: verde aprobado o activo, amarillo pendiente, rojo rechazado, gris cancelado o inactivo.
- Toda tabla tiene estado vacío con ícono y mensaje.

---

## 9. Pendientes por definir

- [ ] Cómo se separan en rutas el administrador y la app de empresa, y para qué se usa `app.`.
- [ ] Login de usuarios de empresa. El backend revisado solo expone `/admin/auth/*`.
- [ ] Plantillas genéricas de tabla y formulario, equivalentes a `TableTemplate`, `ListView` y `FormView`.
- [ ] Sistema de diseño según el Figma.

Sesión y HTTP del panel: cookie `httpOnly` con `src/lib/session.ts` y `fetch` con `src/lib/api.ts`, sin librerías extra.

---

## 10. Checklist antes de entregar

1. Sigue el patrón de módulo de la sección 5.
2. Ninguna llamada a la API sale del navegador.
3. Los datos quedan aislados por tenant.
4. Los textos están en español correcto.
5. Se ve bien en pantallas chicas.
6. Pasan `npm run typecheck` y `npx eslint <archivos>`.
7. La respuesta indica archivos cambiados, decisiones tomadas y lo que no se pudo probar.
8. Sin commits.
