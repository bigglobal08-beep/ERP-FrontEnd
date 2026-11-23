"use client";

import { useRouter } from "next/navigation";
import { createUser } from "@/app/actions/users-actions";
import PermissionsPicker from "@/components/permissions/PermissionsPicker";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldText from "@/components/ui/form/FieldText";
import FormGroup from "@/components/ui/form/FormGroup";
import FormLayout from "@/components/ui/form/FormLayout";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import type { IPermissionSegment } from "@/lib/permissions/interface";
import {
  createUserSchema,
  defaultCreateUser,
  type CreateUserSchemaType,
} from "@/schemas/user.schema";

export default function CreateUser({
  catalog,
  ownPermissions,
  canAssignPermissions,
}: {
  catalog: IPermissionSegment[];
  ownPermissions: string[];
  canAssignPermissions: boolean;
}) {
  const router = useRouter();
  const methods = useZodForm(createUserSchema, { defaultValues: defaultCreateUser });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: CreateUserSchemaType) => {
    if (!(await modalConfirm("¿Seguro que quieres crear este usuario?"))) return false;

    const res = await withLoading(
      createUser({
        email: values.email,
        name: values.name,
        password: values.password,
        // Sin admins.permissions el backend rechaza el campo
        ...(canAssignPermissions && { permissions: values.permissions }),
      }),
      "Guardando usuario...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }

    await modalSuccess(res.message);
    router.push(
      res.data?.id ? `/app/users?view_type=form&id=${encodeURIComponent(res.data.id)}` : "/app/users",
    );
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <FormGroup md={3}>
        <FieldText<CreateUserSchemaType> name="name" label="Nombre *" />
        <FieldText<CreateUserSchemaType> name="email" type="email" label="Correo *" />
        <FieldText<CreateUserSchemaType>
          name="password"
          type="password"
          label="Contraseña *"
          hint="De 12 a 128 caracteres"
          autoComplete="new-password"
        />
      </FormGroup>
      <ConditionalRender cond={canAssignPermissions}>
        <h2 className="mt-2 font-semibold">Permisos</h2>
        <PermissionsPicker catalog={catalog} ownPermissions={ownPermissions} />
      </ConditionalRender>
      <div className="mt-4 flex justify-center">
        <button type="submit" className="btn btn-neutral btn-sm w-full max-w-xs">
          Guardar
        </button>
      </div>
    </FormLayout>
  );
}
