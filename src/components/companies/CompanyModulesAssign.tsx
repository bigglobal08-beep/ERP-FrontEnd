"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignCompanyModules } from "@/app/actions/companies-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import StateMessage from "@/components/ui/StateMessage";
import useActionError from "@/hooks/useActionError";
import type {
  ICompanyModule,
  ICompanyModuleAssigned,
} from "@/lib/companyModules/interface";

// clave del módulo -> ids de submenús marcados
type Selection = Record<string, string[]>;

const toSelection = (assigned: ICompanyModuleAssigned[]): Selection =>
  Object.fromEntries(
    assigned.map((module) => [module.key, module.children.map((child) => child.id)]),
  );

export default function CompanyModulesAssign({
  companyId,
  catalog,
  assigned,
  canEdit,
}: {
  companyId: string;
  catalog: ICompanyModule[];
  assigned: ICompanyModuleAssigned[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const showError = useActionError();
  const [selection, setSelection] = useState<Selection>(() => toSelection(assigned));

  // Solo se ofrece lo activo, pero lo que ya tiene la empresa siempre se muestra
  const assignedChildIds = new Set(assigned.flatMap((m) => m.children.map((c) => c.id)));
  const assignedKeys = new Set(assigned.map((m) => m.key));
  const modules = catalog
    .filter((module) => module.active || assignedKeys.has(module.key))
    .map((module) => ({
      ...module,
      children: module.children.filter(
        (child) => child.active || assignedChildIds.has(child.id),
      ),
    }));

  const toggleModule = (module: (typeof modules)[number], checked: boolean) => {
    setSelection((current) => {
      const next = { ...current };
      if (checked) next[module.key] = module.children.filter((c) => c.active).map((c) => c.id);
      else delete next[module.key];
      return next;
    });
  };

  const toggleChild = (key: string, childId: string, checked: boolean) => {
    setSelection((current) => {
      const children = current[key] ?? [];
      return {
        ...current,
        [key]: checked ? [...children, childId] : children.filter((id) => id !== childId),
      };
    });
  };

  const save = async () => {
    if (!(await modalConfirm("¿Seguro que quieres guardar los módulos de esta empresa?"))) return;

    // children siempre va: omitirlo le daría todos los submenús del módulo
    const payload = Object.entries(selection).map(([key, children]) => ({ key, children }));
    const res = await withLoading(assignCompanyModules(companyId, payload), "Guardando módulos...");
    if (!res.success) {
      await showError(res);
      return;
    }
    await modalSuccess(res.message);
    router.refresh();
  };

  if (!modules.length) {
    return <StateMessage message="Todavía no hay módulos en el catálogo." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <fieldset disabled={!canEdit} className="grid min-w-0 gap-3 md:grid-cols-2">
        {modules.map((module) => {
          const isChecked = module.key in selection;
          return (
            <div key={module.id} className="border-base-300 rounded-box border p-3">
              <label className="flex cursor-pointer items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={isChecked}
                  onChange={(e) => toggleModule(module, e.target.checked)}
                />
                <span className="min-w-0 break-words">{module.span}</span>
              </label>
              <ConditionalRender cond={module.children.length > 0}>
                <ul className="mt-2 ml-6 flex flex-col gap-1">
                  {module.children.map((child) => (
                    <li key={child.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs"
                          disabled={!isChecked}
                          checked={selection[module.key]?.includes(child.id) ?? false}
                          onChange={(e) => toggleChild(module.key, child.id, e.target.checked)}
                        />
                        <span className="min-w-0 break-words">{child.span}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </ConditionalRender>
            </div>
          );
        })}
      </fieldset>
      <ConditionalRender cond={canEdit}>
        <div className="flex justify-center">
          <button type="button" className="btn btn-neutral btn-sm w-full max-w-xs" onClick={save}>
            Guardar módulos
          </button>
        </div>
      </ConditionalRender>
    </div>
  );
}
