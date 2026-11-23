"use client";

import { useRouter } from "next/navigation";
import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from "react-hook-form";
import { modalError } from "@/components/ui/modal/modal";
import type { ActionResponse } from "@/lib/definitions";

/**
 * Maneja una respuesta fallida según su status:
 * 400 marca los campos, 403 avisa y refresca permisos, los demás muestran el mensaje.
 */
export default function useActionError<TFieldValues extends FieldValues = FieldValues>(
  setError?: UseFormSetError<TFieldValues>,
  mapField: (field: string) => string = (field) => field,
) {
  const router = useRouter();

  return async <T,>(response: ActionResponse<T>) => {
    if (response.status === 400 && response.fieldErrors?.length && setError) {
      for (const { field, message } of response.fieldErrors) {
        setError(mapField(field) as FieldPath<TFieldValues>, {
          type: "server",
          message,
        });
      }
      return;
    }

    await modalError(response.message);
    if (response.status === 403) router.refresh();
  };
}
