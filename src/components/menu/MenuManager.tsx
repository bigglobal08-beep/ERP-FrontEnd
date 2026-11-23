"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addMenuChild,
  addMenuItem,
  createAdminMenu,
  updateMenuChild,
  updateMenuItem,
} from "@/app/actions/menu-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldSelect from "@/components/ui/form/FieldSelect";
import FieldText from "@/components/ui/form/FieldText";
import FormLayout from "@/components/ui/form/FormLayout";
import FormDialog from "@/components/ui/modal/FormDialog";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import type { IMenu, IMenuItem } from "@/lib/menu/interface";
import type { IPermissionSegment } from "@/lib/permissions/interface";
import {
  menuItemSchema,
  PERMISSION_ALL,
  toMenuItemInput,
  toMenuItemValues,
  type MenuItemSchemaType,
} from "@/schemas/menu.schema";

type DialogState =
  | { mode: "add-root" }
  | { mode: "add-child"; parent: IMenuItem }
  // rootId: id del elemento principal; null cuando se edita el principal mismo
  | { mode: "edit"; item: IMenuItem; rootId: string | null };

function MenuItemDialog({
  menuId,
  state,
  catalog,
  ownPermissions,
  onClose,
}: {
  menuId: string;
  state: NonNullable<DialogState>;
  catalog: IPermissionSegment[];
  ownPermissions: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const editing = state.mode === "edit" ? state.item : null;
  const methods = useZodForm(menuItemSchema, { defaultValues: toMenuItemValues(editing) });
  const showError = useActionError(methods.setError);

  const options = [
    { value: PERMISSION_ALL, label: "Lo ven todos" },
    ...catalog.flatMap((segment) =>
      segment.permissions.map((permission) => ({
        value: permission.key,
        label: `${segment.name} · ${permission.description}`,
      })),
    ),
  ];

  const save = (values: MenuItemSchemaType) => {
    const input = toMenuItemInput(values);
    if (state.mode === "add-root") return addMenuItem(menuId, input);
    if (state.mode === "add-child") return addMenuChild(menuId, state.parent.id!, input);
    return state.rootId
      ? updateMenuChild(menuId, state.rootId, state.item.id!, input)
      : updateMenuItem(menuId, state.item.id!, input);
  };

  const onSubmit = async (values: MenuItemSchemaType) => {
    const { permission } = values;
    const lacksPermission = permission !== PERMISSION_ALL && !ownPermissions.includes(permission);
    // Una sola confirmación: si falta el permiso, la advertencia va en el mismo aviso
    const confirmed = await modalConfirm(
      lacksPermission
        ? "Advertencia: no tienes este permiso. El elemento dejará de aparecer en tu menú y no podrás editarlo desde aquí."
        : editing
          ? "¿Seguro que quieres guardar los cambios del menú?"
          : "¿Seguro que quieres agregar este elemento al menú?",
      lacksPermission ? { title: "¿Seguro que quieres guardar el elemento?" } : undefined,
    );
    if (!confirmed) return false;

    const res = await withLoading(save(values), "Guardando menú...");
    if (!res.success) {
      await showError(res);
      return false;
    }
    onClose();
    await modalSuccess(res.message);
    // Se vuelve a pedir GET /admin/menu: la respuesta del POST/PATCH viene sin filtrar
    router.refresh();
  };

  const title =
    state.mode === "edit"
      ? `Editar "${state.item.span}"`
      : state.mode === "add-child"
        ? `Submenú de "${state.parent.span}"`
        : "Nuevo elemento";

  return (
    <FormDialog title={title} onClose={onClose}>
      <FormLayout methods={methods} onSubmit={onSubmit} errorMode="inline" guardUnsaved={false}>
        <FieldText<MenuItemSchemaType> name="span" label="Texto *" />
        <FieldText<MenuItemSchemaType> name="href" label="Ruta" hint="Ej. /app/companies. Vacío si solo agrupa submenús." />
        <FieldText<MenuItemSchemaType> name="className" label="Clase del ícono" />
        <FieldSelect<MenuItemSchemaType> name="permission" label="Permiso" options={options} />
        <FieldText<MenuItemSchemaType> name="defaultActiveKey" label="defaultActiveKey" />
        <FieldText<MenuItemSchemaType> name="eventKey" label="eventKey" />
        <button type="submit" className="btn btn-neutral btn-sm mt-2">Guardar</button>
      </FormLayout>
    </FormDialog>
  );
}

function MenuNode({
  item,
  rootId,
  canUpdate,
  onDialog,
}: {
  item: IMenuItem;
  rootId: string | null;
  canUpdate: boolean;
  onDialog: (state: NonNullable<DialogState>) => void;
}) {
  // Un elemento antiguo sin id no se puede editar; tampoco sus hijos si el principal no tiene id
  const isEditable = canUpdate && !!item.id;
  const isRootMissing = rootId === "";

  return (
    <li className="min-w-0">
      <div className="hover:bg-base-200 rounded-field flex items-center justify-between gap-2 px-2 py-1.5">
        <div className="min-w-0">
          <p className="font-medium break-words">{item.span}</p>
          <p className="text-base-content/60 text-xs break-all">
            {item.href || "Sin ruta"} · {item.permission ?? "Lo ven todos"}
          </p>
        </div>
        <ConditionalRender cond={isEditable && !isRootMissing}>
          <div className="flex shrink-0 gap-1">
            <button type="button" aria-label={`Agregar submenú a ${item.span}`} className="btn btn-ghost btn-xs btn-square" onClick={() => onDialog({ mode: "add-child", parent: item })}>
              <Plus className="size-4" />
            </button>
            <button type="button" aria-label={`Editar ${item.span}`} className="btn btn-ghost btn-xs btn-square" onClick={() => onDialog({ mode: "edit", item, rootId })}>
              <Pencil className="size-3.5" />
            </button>
          </div>
        </ConditionalRender>
      </div>
      <ConditionalRender cond={item.children?.length > 0}>
        <ul className="border-base-300 ml-3 border-l pl-2">
          {item.children?.map((child, index) => (
            <MenuNode
              key={child.id ?? `${child.span}-${index}`}
              item={child}
              rootId={rootId ?? item.id ?? ""}
              canUpdate={canUpdate}
              onDialog={onDialog}
            />
          ))}
        </ul>
      </ConditionalRender>
    </li>
  );
}

export default function MenuManager({
  menu,
  catalog,
  ownPermissions,
  canCreate,
  canUpdate,
}: {
  menu: IMenu | null;
  catalog: IPermissionSegment[];
  ownPermissions: string[];
  canCreate: boolean;
  canUpdate: boolean;
}) {
  const router = useRouter();
  const showError = useActionError();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const handleCreate = async () => {
    if (!(await modalConfirm("¿Seguro que quieres crear el menú del panel?"))) return;
    const res = await withLoading(createAdminMenu(), "Creando menú...");
    if (!res.success) return showError(res);
    await modalSuccess(res.message);
    router.refresh();
  };

  if (!menu) {
    return (
      <>
        <PageTitle title="Menú lateral" />
        <StateMessage message="Todavía no se crea el menú del panel.">
          <ConditionalRender cond={canCreate}>
            <button type="button" className="btn btn-neutral btn-sm" onClick={handleCreate}>
              Crear menú
            </button>
          </ConditionalRender>
        </StateMessage>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Menú lateral">
        <ConditionalRender cond={canUpdate}>
          <button type="button" className="btn btn-neutral btn-sm" onClick={() => setDialog({ mode: "add-root" })}>
            <Plus className="size-4" /> Elemento
          </button>
        </ConditionalRender>
      </PageTitle>

      {!menu.menu.length ? (
        <StateMessage message="El menú no tiene elementos visibles para tu usuario." />
      ) : (
        <ul className="flex max-w-3xl flex-col gap-1">
          {menu.menu.map((item, index) => (
            <MenuNode
              key={item.id ?? `${item.span}-${index}`}
              item={item}
              rootId={null}
              canUpdate={canUpdate}
              onDialog={setDialog}
            />
          ))}
        </ul>
      )}

      {dialog && (
        <MenuItemDialog
          menuId={menu.id}
          state={dialog}
          catalog={catalog}
          ownPermissions={ownPermissions}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
