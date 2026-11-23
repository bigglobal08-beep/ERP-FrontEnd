"use client";

import { KeyRound, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteUser,
  resetUserPassword,
  updateUser,
} from "@/app/actions/users-actions";
import PermissionsPicker from "@/components/permissions/PermissionsPicker";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldBoolean from "@/components/ui/form/FieldBoolean";
import FieldText from "@/components/ui/form/FieldText";
import FormGroup from "@/components/ui/form/FormGroup";
import FormLayout from "@/components/ui/form/FormLayout";
import {
  modalConfirm,
  modalPrompt,
  modalSuccess,
  withLoading,
} from "@/components/ui/modal/modal";
import PageTitle from "@/components/ui/PageTitle";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import { can, type IAdmin } from "@/lib/auth/interface";
import type { IPermissionSegment } from "@/lib/permissions/interface";
import { updateUserSchema, type UpdateUserSchemaType } from "@/schemas/user.schema";

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

export default function UserInfoOne({
  user,
  currentAdmin,
  catalog,
}: {
  user: IAdmin;
  currentAdmin: IAdmin;
  catalog: IPermissionSegment[];
}) {
  const router = useRouter();
  const isSelf = user.id === currentAdmin.id;
  const canUpdate = can(currentAdmin, "admins.update");
  const canDelete = can(currentAdmin, "admins.delete") && !isSelf;
  const canEditPermissions = canUpdate && can(currentAdmin, "admins.permissions") && !isSelf;

  const methods = useZodForm(updateUserSchema, {
    defaultValues: { name: user.name, active: user.active, permissions: user.permissions },
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: UpdateUserSchemaType) => {
    // Solo lo que cambió: el backend protege al administrador principal por campo
    const changes = {
      ...(values.name !== user.name && { name: values.name }),
      ...(!isSelf && values.active !== user.active && { active: values.active }),
      ...(canEditPermissions &&
        !sameList(values.permissions, user.permissions) && { permissions: values.permissions }),
    };
    if (!Object.keys(changes).length) return;

    if (!(await modalConfirm("¿Seguro que quieres guardar los cambios?"))) return false;

    const res = await withLoading(updateUser(user.id, changes), "Guardando usuario...");
    if (!res.success) {
      await showError(res);
      return false;
    }
    await modalSuccess(res.message);
    router.refresh();
  };

  const handleResetPassword = async () => {
    const password = await modalPrompt(`Escribe la nueva contraseña de ${user.name}.`, {
      title: "Cambiar contraseña",
      label: "Nueva contraseña",
      inputType: "password",
      minLength: 12,
      maxLength: 128,
      confirmText: "Guardar",
    });
    if (password === null) return;

    const res = await withLoading(resetUserPassword(user.id, password), "Guardando contraseña...");
    if (!res.success) {
      await showError(res);
      return;
    }
    await modalSuccess(res.message);
  };

  const handleDelete = async () => {
    const reason = await modalPrompt(
      `Se dará de baja a "${user.name}" y su correo no se podrá reutilizar.`,
      {
        title: "¿Seguro que quieres eliminar al usuario?",
        label: "Motivo",
        minLength: 3,
        maxLength: 250,
        confirmText: "Eliminar",
        danger: true,
      },
    );
    if (reason === null) return;

    const res = await withLoading(deleteUser(user.id, reason), "Eliminando usuario...");
    if (!res.success) {
      await showError(res);
      return;
    }
    await modalSuccess(res.message);
    router.push("/app/users");
  };

  return (
    <>
      <div className="breadcrumbs mb-2 text-sm">
        <ul>
          <li><Link href="/app/users">Usuarios</Link></li>
          <li>{user.name}</li>
        </ul>
      </div>
      <PageTitle title={user.name}>
        <ConditionalRender cond={canUpdate}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleResetPassword}>
            <KeyRound className="size-4" /> Contraseña
          </button>
        </ConditionalRender>
        <ConditionalRender cond={canDelete}>
          <button type="button" className="btn btn-error btn-outline btn-sm" onClick={handleDelete}>
            <Trash2 className="size-4" /> Eliminar
          </button>
        </ConditionalRender>
      </PageTitle>

      <FormLayout key={user.updatedAt} methods={methods} onSubmit={onSubmit}>
        <fieldset disabled={!canUpdate} className="min-w-0">
          <FormGroup md={3}>
            <FieldText<UpdateUserSchemaType> name="name" label="Nombre *" />
            <fieldset className="fieldset min-w-0">
              <div className="fieldset-legend">Correo</div>
              <input className="input w-full" value={user.email} readOnly aria-label="Correo" />
            </fieldset>
            <ConditionalRender cond={!isSelf}>
              <FieldBoolean<UpdateUserSchemaType> name="active" label="Usuario activo" variant="toggle" />
            </ConditionalRender>
          </FormGroup>
          <h2 className="mt-3 mb-2 font-semibold">Permisos</h2>
          <PermissionsPicker
            catalog={catalog}
            ownPermissions={currentAdmin.permissions}
            disabled={!canEditPermissions}
          />
        </fieldset>
        <ConditionalRender cond={canUpdate}>
          <div className="mt-4 flex justify-center">
            <button type="submit" className="btn btn-neutral btn-sm w-full max-w-xs">
              Guardar
            </button>
          </div>
        </ConditionalRender>
      </FormLayout>
    </>
  );
}
