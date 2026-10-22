"use client";

import Form from "../form/Form";
import { SubmitEvent } from "react";
import FormGrid from "../form/FormGrid";
import FieldText from "../form/FieldText";
import Button from "../form/Button";
import Link from "next/link";

export default function FormLogin() {
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log(formData.get("email"));
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="w-full rounded-xl bg-white p-6 shadow-xl"
    >
      <FormGrid>
        <FieldText
          name="email"
          type="email"
          label="Correo"
          placeholder="Coloca tu correo para iniciar sesión..."
        />

        <FieldText
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Escribe tu contraseña..."
        />

        <Button size="md" type="submit">
          Iniciar sesión
        </Button>

        <Link
          href="/"
          className="text-sm text-slate-600 underline transition-colors duration-200 hover:text-red-500"
        >
          Olvidé mi contraseña
        </Link>
      </FormGrid>
    </Form>
  );
}
