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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { login } from "@/app/actions/auth-actions";
import { withLoading } from "../ui/modal/modal";
import ConditionalRender from "../ui/ConditionalRender";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(
    searchParams.get("expired") ? "Tu sesión expiró. Inicia sesión de nuevo." : "",
  );
  const methods = useZodForm(loginSchema, {
    defaultValues: defaultLoginSchema,
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setError("");
    const res = await withLoading(
      login({ email: data.login, password: data.password }),
      "Iniciando sesión...",
    );

    if (!res.success) {
      setError(res.message);
      return false;
    }

    router.replace("/app");
    router.refresh();
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit} guardUnsaved={false}>
      <ConditionalRender cond={!!error}>
        <div role="alert" className="alert alert-error alert-soft text-sm">
          {error}
        </div>
      </ConditionalRender>
      <FormGroup>
        <FieldText<LoginSchemaType>
          name="login"
          type="email"
          label="Correo"
          autoComplete="username"
        />
        <FieldText<LoginSchemaType>
          name="password"
          type="password"
          label="Contraseña"
          autoComplete="current-password"
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
