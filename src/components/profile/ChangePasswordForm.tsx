"use client";

import { changeOwnPassword } from "@/app/actions/auth-actions";
import FieldText from "@/components/ui/form/FieldText";
import FormGroup from "@/components/ui/form/FormGroup";
import FormLayout from "@/components/ui/form/FormLayout";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import {
  changePasswordSchema,
  defaultChangePassword,
  type ChangePasswordSchemaType,
} from "@/schemas/password.schema";

export default function ChangePasswordForm() {
  const methods = useZodForm(changePasswordSchema, {
    defaultValues: defaultChangePassword,
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: ChangePasswordSchemaType) => {
    if (!(await modalConfirm("¿Seguro que quieres cambiar tu contraseña?"))) return false;

    const res = await withLoading(
      changeOwnPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
      "Guardando nueva contraseña...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }

    methods.reset(defaultChangePassword);
    await modalSuccess(res.message);
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <FormGroup title="Cambiar contraseña" md={3}>
        <FieldText<ChangePasswordSchemaType>
          name="currentPassword"
          type="password"
          label="Contraseña actual"
          autoComplete="current-password"
        />
        <FieldText<ChangePasswordSchemaType>
          name="newPassword"
          type="password"
          label="Nueva contraseña"
          hint="De 12 a 128 caracteres"
          autoComplete="new-password"
        />
        <FieldText<ChangePasswordSchemaType>
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          autoComplete="new-password"
        />
      </FormGroup>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-neutral btn-sm">
          Guardar
        </button>
      </div>
    </FormLayout>
  );
}
