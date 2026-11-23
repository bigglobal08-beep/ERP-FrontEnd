"use client";

import useZodForm from "@/hooks/useZodForm";
import FormLayout from "../ui/form/FormLayout";
import {
  defaultLoginSchema,
  loginSchema,
  LoginSchemaType,
} from "@/schemas/login.schema";
import FormGroup from "../ui/form/FormGroup";
import FieldText from "../ui/form/FieldText";
import Link from "next/link";

export default function LoginForm() {
  const methods = useZodForm(loginSchema, {
    defaultValues: defaultLoginSchema,
  });

  const onSubmit = (data: LoginSchemaType) => {
    console.log(data);
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <FormGroup>
        <FieldText<LoginSchemaType> name="login" label="Correo" />
        <FieldText<LoginSchemaType>
          name="password"
          type="password"
          label="Contraseña"
          className="mb-3"
        />
        <button
          className="btn btn-neutral btn-sm mb-5 font-thin text-sm"
          type="submit"
        >
          Iniciar sesión
        </button>

        <Link href="/" className="text-xs underline">
          Olvidé mi contraseña
        </Link>
      </FormGroup>
    </FormLayout>
  );
}
