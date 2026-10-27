"use client";

import { TriangleAlert } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  FormProvider,
  useFormState,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import useUnsavedChangesGuard from "@/hooks/useUnsavedChangesGuard";

type FormLayoutProps<
  TFieldValues extends FieldValues,
  TTransformedValues,
> = Omit<ComponentProps<"form">, "onSubmit" | "children"> & {
  methods: UseFormReturn<TFieldValues, unknown, TTransformedValues>;
  // Con resolver recibe los valores ya validados/transformados por el esquema.
  // Si lanza un error, el form sigue marcado con cambios sin guardar
  onSubmit: SubmitHandler<TTransformedValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
  // Avisa antes de salir de la página si hay cambios sin guardar (activo por defecto)
  guardUnsaved?: boolean;
  children: ReactNode;
};

export default function FormLayout<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  methods,
  onSubmit,
  onInvalid,
  guardUnsaved = true,
  children,
  className = "flex flex-col gap-2",
  ...props
}: FormLayoutProps<TFieldValues, TTransformedValues>) {
  // RHF muta `dirtyFields` en lugar de crear un objeto nuevo; el React Compiler memoiza
  // por referencia y no recalcularía `hasChanges`. Se excluye este componente del compilador
  "use no memo";

  const { dirtyFields, isSubmitting } = useFormState({
    control: methods.control,
  });
  // Se usa dirtyFields (comparación campo por campo) y no isDirty: isDirty compara el objeto
  // completo y marca "con cambios" si el form no define defaultValues para todos los campos
  const hasChanges = Object.keys(dirtyFields).length > 0;
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Navegación pendiente mientras el usuario decide en el diálogo
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);

  useUnsavedChangesGuard(guardUnsaved && hasChanges, (proceed) =>
    setPendingLeave(() => proceed),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (pendingLeave && !dialog?.open) dialog?.showModal();
    if (!pendingLeave && dialog?.open) dialog.close();
  }, [pendingLeave]);

  // Tras guardar con éxito, los valores actuales pasan a ser el nuevo punto "sin cambios"
  const submit = (afterSave?: () => void) =>
    methods.handleSubmit(
      async (values) => {
        await onSubmit(values);
        methods.reset(methods.getValues());
        afterSave?.();
      },
      (errors) => {
        // Si al guardar desde el diálogo hay errores, se cierra para que el usuario los vea
        setPendingLeave(null);
        onInvalid?.(errors);
      },
    );

  const leave = () => {
    const proceed = pendingLeave;
    setPendingLeave(null);
    proceed?.();
  };

  return (
    <FormProvider {...methods}>
      <form noValidate className={className} onSubmit={submit()} {...props}>
        {children}
      </form>

      {/* Fuera del <form> para no anidar elementos de formulario */}
      <dialog
        ref={dialogRef}
        className="modal"
        // Escape cierra el diálogo: equivale a "Seguir editando"
        onClose={() => setPendingLeave(null)}
      >
        <div className="modal-box max-w-md">
          <div className="flex items-start gap-3">
            <div className="bg-warning/15 text-warning rounded-full p-2">
              <TriangleAlert className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cambios sin guardar</h3>
              <p className="text-base-content/70 mt-1 text-sm">
                Este formulario tiene cambios que no se han guardado. ¿Qué
                quieres hacer antes de salir?
              </p>
            </div>
          </div>
          <div className="modal-action flex-wrap">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPendingLeave(null)}
            >
              Seguir editando
            </button>
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm"
              onClick={() => {
                methods.reset();
                leave();
              }}
            >
              Descartar cambios
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
              onClick={() => submit(leave)()}
            >
              {isSubmitting && <span className="loading loading-spinner loading-xs" />}
              Guardar y salir
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setPendingLeave(null)} />
      </dialog>
    </FormProvider>
  );
}
