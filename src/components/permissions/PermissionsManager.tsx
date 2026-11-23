"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createPermission,
  createSegment,
  deletePermission,
  deleteSegment,
  updatePermission,
  updateSegment,
} from "@/app/actions/permissions-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldNumber from "@/components/ui/form/FieldNumber";
import FieldSelect from "@/components/ui/form/FieldSelect";
import FieldText from "@/components/ui/form/FieldText";
import FormLayout from "@/components/ui/form/FormLayout";
import FormDialog from "@/components/ui/modal/FormDialog";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import type { IPermission, IPermissionSegment } from "@/lib/permissions/interface";
import {
  permissionSchema,
  segmentSchema,
  type PermissionSchemaType,
  type SegmentSchemaType,
} from "@/schemas/permission.schema";

const NO_SEGMENT = "sin-segmento";

function SegmentDialog({
  segment,
  onClose,
}: {
  segment: IPermissionSegment | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const methods = useZodForm(segmentSchema, {
    defaultValues: {
      key: segment?.key ?? "",
      name: segment?.name ?? "",
      description: segment?.description ?? "",
      order: segment?.order ?? 0,
    },
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: SegmentSchemaType) => {
    const question = segment
      ? "¿Seguro que quieres guardar los cambios del segmento?"
      : "¿Seguro que quieres crear este segmento?";
    if (!(await modalConfirm(question))) return false;

    const res = await withLoading(
      segment ? updateSegment(segment.id, values) : createSegment(values),
      "Guardando segmento...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }
    onClose();
    await modalSuccess(res.message);
    router.refresh();
  };

  return (
    <FormDialog title={segment ? "Editar segmento" : "Nuevo segmento"} onClose={onClose}>
      <FormLayout methods={methods} onSubmit={onSubmit} errorMode="inline" guardUnsaved={false}>
        <FieldText<SegmentSchemaType>
          name="key"
          label="Clave *"
          readOnly={!!segment}
          hint="Ej. recursos-humanos. No se puede cambiar después."
        />
        <FieldText<SegmentSchemaType> name="name" label="Nombre *" />
        <FieldText<SegmentSchemaType> name="description" label="Descripción" />
        <FieldNumber<SegmentSchemaType> name="order" label="Orden" widget="integer" />
        <button type="submit" className="btn btn-neutral btn-sm mt-2">Guardar</button>
      </FormLayout>
    </FormDialog>
  );
}

function PermissionDialog({
  permission,
  defaultSegment,
  segments,
  onClose,
}: {
  permission: IPermission | null;
  defaultSegment: string;
  segments: IPermissionSegment[];
  onClose: () => void;
}) {
  const router = useRouter();
  const methods = useZodForm(permissionSchema, {
    defaultValues: {
      key: permission?.key ?? "",
      description: permission?.description ?? "",
      segment: permission?.segment ?? defaultSegment,
      order: permission?.order ?? 0,
    },
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: PermissionSchemaType) => {
    const question = permission
      ? "¿Seguro que quieres guardar los cambios del permiso?"
      : "¿Seguro que quieres crear este permiso?";
    if (!(await modalConfirm(question))) return false;

    const res = await withLoading(
      permission ? updatePermission(permission.id, values) : createPermission(values),
      "Guardando permiso...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }
    onClose();
    await modalSuccess(res.message);
    // Al crear un permiso el backend se lo asigna a quien lo creó
    router.refresh();
  };

  return (
    <FormDialog title={permission ? "Editar permiso" : "Nuevo permiso"} onClose={onClose}>
      <FormLayout methods={methods} onSubmit={onSubmit} errorMode="inline" guardUnsaved={false}>
        <FieldText<PermissionSchemaType>
          name="key"
          label="Clave *"
          readOnly={!!permission}
          hint="Ej. ventas.cancelar. No se puede cambiar después."
        />
        <FieldText<PermissionSchemaType> name="description" label="Descripción *" />
        <FieldSelect<PermissionSchemaType>
          name="segment"
          label="Segmento *"
          options={segments
            .filter((segment) => segment.id)
            .map((segment) => ({ value: segment.key, label: segment.name }))}
        />
        <FieldNumber<PermissionSchemaType> name="order" label="Orden" widget="integer" />
        <button type="submit" className="btn btn-neutral btn-sm mt-2">Guardar</button>
      </FormLayout>
    </FormDialog>
  );
}

type DialogState =
  | { type: "segment"; segment: IPermissionSegment | null }
  | { type: "permission"; permission: IPermission | null; segment: string }
  | null;

export default function PermissionsManager({
  catalog,
  canManage,
}: {
  catalog: IPermissionSegment[];
  canManage: boolean;
}) {
  const router = useRouter();
  const showError = useActionError();
  const [dialog, setDialog] = useState<DialogState>(null);

  const removeSegment = async (segment: IPermissionSegment) => {
    if (!(await modalConfirm(`¿Seguro que quieres eliminar el segmento "${segment.name}"?`, { danger: true, confirmText: "Eliminar" }))) return;
    const res = await withLoading(deleteSegment(segment.id), "Eliminando segmento...");
    if (!res.success) return showError(res);
    await modalSuccess(res.message);
    router.refresh();
  };

  const removePermission = async (permission: IPermission) => {
    const confirmed = await modalConfirm(
      `Se le quitará "${permission.key}" a todos los usuarios que lo tengan. ¿Quieres continuar?`,
      { title: "Eliminar permiso", danger: true, confirmText: "Eliminar" },
    );
    if (!confirmed) return;
    const res = await withLoading(deletePermission(permission.id), "Eliminando permiso...");
    if (!res.success) return showError(res);
    await modalSuccess(`${res.message}. Se quitó a ${res.data?.removedFromUsers ?? 0} usuario(s).`);
    router.refresh();
  };

  return (
    <>
      <PageTitle title="Permisos">
        <ConditionalRender cond={canManage}>
          <button
            type="button"
            className="btn btn-neutral btn-sm"
            onClick={() => setDialog({ type: "segment", segment: null })}
          >
            <Plus className="size-4" /> Segmento
          </button>
        </ConditionalRender>
      </PageTitle>

      {!catalog.length && <StateMessage message="Todavía no hay permisos en el catálogo." />}

      <div className="grid gap-4 lg:grid-cols-2">
        {catalog.map((segment) => {
          // El grupo automático se muestra, pero no se edita ni se borra
          const isEditable = canManage && !!segment.id && segment.key !== NO_SEGMENT;
          return (
            <section key={segment.key} className="card card-border bg-base-100">
              <div className="card-body min-w-0 gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold break-words">{segment.name}</h2>
                    <p className="text-base-content/60 text-xs break-all">{segment.key}</p>
                  </div>
                  <ConditionalRender cond={isEditable}>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" aria-label={`Agregar permiso a ${segment.name}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "permission", permission: null, segment: segment.key })}>
                        <Plus className="size-4" />
                      </button>
                      <button type="button" aria-label={`Editar ${segment.name}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "segment", segment })}>
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" aria-label={`Eliminar ${segment.name}`} className="btn btn-ghost btn-xs btn-square text-error" onClick={() => removeSegment(segment)}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </ConditionalRender>
                </div>
                <ul className="divide-base-200 divide-y">
                  {segment.permissions.map((permission) => (
                    <li key={permission.key} className="flex items-center justify-between gap-2 py-1.5">
                      <div className="min-w-0 text-sm">
                        <p className="break-words">{permission.description}</p>
                        <p className="text-base-content/60 text-xs break-all">{permission.key}</p>
                      </div>
                      <ConditionalRender cond={canManage}>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" aria-label={`Editar ${permission.key}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "permission", permission, segment: permission.segment })}>
                            <Pencil className="size-3.5" />
                          </button>
                          <ConditionalRender cond={!permission.system}>
                            <button type="button" aria-label={`Eliminar ${permission.key}`} className="btn btn-ghost btn-xs btn-square text-error" onClick={() => removePermission(permission)}>
                              <Trash2 className="size-3.5" />
                            </button>
                          </ConditionalRender>
                        </div>
                      </ConditionalRender>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {dialog?.type === "segment" && (
        <SegmentDialog segment={dialog.segment} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "permission" && (
        <PermissionDialog
          permission={dialog.permission}
          defaultSegment={dialog.segment}
          segments={catalog}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
