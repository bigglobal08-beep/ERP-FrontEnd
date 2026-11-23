"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addCompanyModuleChild,
  createCompanyModule,
  deleteCompanyModule,
  updateCompanyModule,
  updateCompanyModuleChild,
} from "@/app/actions/companyModules-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldBoolean from "@/components/ui/form/FieldBoolean";
import FieldNumber from "@/components/ui/form/FieldNumber";
import FieldText from "@/components/ui/form/FieldText";
import FormLayout from "@/components/ui/form/FormLayout";
import FormDialog from "@/components/ui/modal/FormDialog";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import PageTitle from "@/components/ui/PageTitle";
import StateMessage from "@/components/ui/StateMessage";
import StatusBadge from "@/components/ui/StatusBadge";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import type {
  ICompanyModule,
  ICompanyModuleChild,
} from "@/lib/companyModules/interface";
import {
  companyModuleChildSchema,
  companyModuleSchema,
  type CompanyModuleChildSchemaType,
  type CompanyModuleSchemaType,
} from "@/schemas/companyModule.schema";

// Editar copia el cambio a las empresas: el backend dice a cuántas
const successMessage = (message: string, extra?: Record<string, unknown>) =>
  typeof extra?.companiesUpdated === "number"
    ? `${message}. Empresas actualizadas: ${extra.companiesUpdated}.`
    : message;

function ModuleDialog({
  module,
  onClose,
}: {
  module: ICompanyModule | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const methods = useZodForm(companyModuleSchema, {
    defaultValues: {
      key: module?.key ?? "",
      span: module?.span ?? "",
      className: module?.className ?? "",
      href: module?.href ?? "",
      defaultActiveKey: module?.defaultActiveKey ?? "",
      eventKey: module?.eventKey ?? "",
      order: module?.order ?? 0,
      active: module?.active ?? true,
    },
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: CompanyModuleSchemaType) => {
    const confirmed = module
      ? await modalConfirm("Advertencia: los cambios se copiarán a las empresas que tienen este módulo.", {
          title: "¿Seguro que quieres guardar el módulo?",
        })
      : await modalConfirm("¿Seguro que quieres crear este módulo?");
    if (!confirmed) return false;

    const res = await withLoading(
      module ? updateCompanyModule(module.id, values) : createCompanyModule(values),
      "Guardando módulo...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }
    onClose();
    await modalSuccess(successMessage(res.message, res.dataExtra));
    router.refresh();
  };

  return (
    <FormDialog title={module ? "Editar módulo" : "Nuevo módulo"} onClose={onClose}>
      <FormLayout methods={methods} onSubmit={onSubmit} errorMode="inline" guardUnsaved={false}>
        <FieldText<CompanyModuleSchemaType>
          name="key"
          label="Clave *"
          readOnly={!!module}
          hint="Ej. recursos-humanos. No se puede cambiar después."
        />
        <FieldText<CompanyModuleSchemaType> name="span" label="Texto *" />
        <FieldText<CompanyModuleSchemaType> name="href" label="Ruta" />
        <FieldText<CompanyModuleSchemaType> name="className" label="Clase del ícono" />
        <FieldNumber<CompanyModuleSchemaType> name="order" label="Orden" widget="integer" />
        <FieldText<CompanyModuleSchemaType> name="defaultActiveKey" label="defaultActiveKey" />
        <FieldText<CompanyModuleSchemaType> name="eventKey" label="eventKey" />
        <FieldBoolean<CompanyModuleSchemaType> name="active" label="Módulo activo" variant="toggle" />
        <button type="submit" className="btn btn-neutral btn-sm mt-2">Guardar</button>
      </FormLayout>
    </FormDialog>
  );
}

function ChildDialog({
  moduleId,
  child,
  onClose,
}: {
  moduleId: string;
  child: ICompanyModuleChild | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const methods = useZodForm(companyModuleChildSchema, {
    defaultValues: {
      span: child?.span ?? "",
      className: child?.className ?? "",
      href: child?.href ?? "",
      defaultActiveKey: child?.defaultActiveKey ?? "",
      eventKey: child?.eventKey ?? "",
      active: child?.active ?? true,
    },
  });
  const showError = useActionError(methods.setError);

  const onSubmit = async (values: CompanyModuleChildSchemaType) => {
    const confirmed = child
      ? await modalConfirm("Advertencia: los cambios se copiarán a las empresas que tienen este submenú.", {
          title: "¿Seguro que quieres guardar el submenú?",
        })
      : await modalConfirm("Advertencia: no se asignará solo a las empresas que ya tienen el módulo.", {
          title: "¿Seguro que quieres crear este submenú?",
        });
    if (!confirmed) return false;

    const res = await withLoading(
      child
        ? updateCompanyModuleChild(moduleId, child.id, values)
        : addCompanyModuleChild(moduleId, values),
      "Guardando submenú...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }
    onClose();
    await modalSuccess(successMessage(res.message, res.dataExtra));
    router.refresh();
  };

  return (
    <FormDialog title={child ? "Editar submenú" : "Nuevo submenú"} onClose={onClose}>
      <FormLayout methods={methods} onSubmit={onSubmit} errorMode="inline" guardUnsaved={false}>
        <FieldText<CompanyModuleChildSchemaType> name="span" label="Texto *" />
        <FieldText<CompanyModuleChildSchemaType> name="href" label="Ruta" />
        <FieldText<CompanyModuleChildSchemaType> name="className" label="Clase del ícono" />
        <FieldText<CompanyModuleChildSchemaType> name="defaultActiveKey" label="defaultActiveKey" />
        <FieldText<CompanyModuleChildSchemaType> name="eventKey" label="eventKey" />
        <FieldBoolean<CompanyModuleChildSchemaType>
          name="active"
          label="Submenú activo"
          variant="toggle"
          hint={child ? undefined : "No se asigna solo a las empresas que ya tienen el módulo."}
        />
        <button type="submit" className="btn btn-neutral btn-sm mt-2">Guardar</button>
      </FormLayout>
    </FormDialog>
  );
}

type DialogState =
  | { type: "module"; module: ICompanyModule | null }
  | { type: "child"; moduleId: string; child: ICompanyModuleChild | null }
  | null;

export default function CompanyModulesManager({
  modules,
  canCreate,
  canUpdate,
  canDelete,
}: {
  modules: ICompanyModule[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const showError = useActionError();
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = async (module: ICompanyModule) => {
    const confirmed = await modalConfirm(`¿Seguro que quieres eliminar el módulo "${module.span}"?`, {
      danger: true,
      confirmText: "Eliminar",
    });
    if (!confirmed) return;
    const res = await withLoading(deleteCompanyModule(module.id), "Eliminando módulo...");
    if (!res.success) return showError(res);
    await modalSuccess(res.message);
    router.refresh();
  };

  return (
    <>
      <PageTitle title="Módulos de empresas">
        <ConditionalRender cond={canCreate}>
          <button
            type="button"
            className="btn btn-neutral btn-sm"
            onClick={() => setDialog({ type: "module", module: null })}
          >
            <Plus className="size-4" /> Nuevo
          </button>
        </ConditionalRender>
      </PageTitle>

      {!modules.length && <StateMessage message="Todavía no hay módulos en el catálogo." />}

      <div className="grid gap-4 lg:grid-cols-2">
        {modules.map((module) => (
          <section key={module.id} className="card card-border bg-base-100">
            <div className="card-body min-w-0 gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold break-words">{module.span}</h2>
                    <StatusBadge active={module.active} />
                  </div>
                  <p className="text-base-content/60 text-xs break-all">
                    {module.key} · orden {module.order}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <ConditionalRender cond={canUpdate}>
                    <button type="button" aria-label={`Agregar submenú a ${module.span}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "child", moduleId: module.id, child: null })}>
                      <Plus className="size-4" />
                    </button>
                    <button type="button" aria-label={`Editar ${module.span}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "module", module })}>
                      <Pencil className="size-3.5" />
                    </button>
                  </ConditionalRender>
                  <ConditionalRender cond={canDelete}>
                    <button type="button" aria-label={`Eliminar ${module.span}`} className="btn btn-ghost btn-xs btn-square text-error" onClick={() => remove(module)}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </ConditionalRender>
                </div>
              </div>
              <ConditionalRender cond={module.children.length > 0}>
                <ul className="divide-base-200 divide-y">
                  {module.children.map((child) => (
                    <li key={child.id} className="flex items-center justify-between gap-2 py-1.5">
                      <div className="min-w-0 text-sm">
                        <p className="break-words">{child.span}</p>
                        <p className="text-base-content/60 text-xs break-all">{child.href || "Sin ruta"}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <StatusBadge active={child.active} />
                        <ConditionalRender cond={canUpdate}>
                          <button type="button" aria-label={`Editar ${child.span}`} className="btn btn-ghost btn-xs btn-square" onClick={() => setDialog({ type: "child", moduleId: module.id, child })}>
                            <Pencil className="size-3.5" />
                          </button>
                        </ConditionalRender>
                      </div>
                    </li>
                  ))}
                </ul>
              </ConditionalRender>
            </div>
          </section>
        ))}
      </div>

      {dialog?.type === "module" && (
        <ModuleDialog module={dialog.module} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "child" && (
        <ChildDialog moduleId={dialog.moduleId} child={dialog.child} onClose={() => setDialog(null)} />
      )}
    </>
  );
}
