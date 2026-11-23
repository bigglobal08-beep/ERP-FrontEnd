"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type UseFormProps } from "react-hook-form";
import type { z } from "zod";

// useForm con el resolver de Zod: los tipos del form salen del esquema
// (TInput = lo que manejan los campos, TOutput = lo que recibe onSubmit)
export default function useZodForm<TInput extends FieldValues, TOutput>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, "resolver">,
) {
  return useForm<TInput, unknown, TOutput>({
    mode: "onTouched",
    ...options,
    resolver: zodResolver(schema),
  });
}
