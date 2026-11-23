"use client";

import { useController } from "react-hook-form";
import type { IPermissionSegment } from "@/lib/permissions/interface";

type PickerValues = { permissions: string[] };

export default function PermissionsPicker({
  catalog,
  ownPermissions,
  disabled = false,
}: {
  catalog: IPermissionSegment[];
  // No se puede otorgar lo que el usuario actual no tiene
  ownPermissions: string[];
  disabled?: boolean;
}) {
  const { field } = useController<PickerValues, "permissions">({ name: "permissions" });
  const selected = field.value ?? [];
  const canGrant = (key: string) => !disabled && ownPermissions.includes(key);

  const toggleMany = (keys: string[], checked: boolean) => {
    const next = new Set(selected);
    keys.forEach((key) => (checked ? next.add(key) : next.delete(key)));
    field.onChange([...next]);
  };

  if (!catalog.length) {
    return <p className="text-base-content/60 text-sm">No hay permisos en el catálogo.</p>;
  }

  return (
    <div className="grid min-w-0 gap-3 lg:grid-cols-2">
      {catalog.map((segment) => {
        const grantable = segment.permissions.map((p) => p.key).filter(canGrant);
        const checkedCount = grantable.filter((key) => selected.includes(key)).length;
        const allChecked = grantable.length > 0 && checkedCount === grantable.length;

        return (
          <section key={segment.key} className="border-base-300 rounded-box border p-3">
            <label className="flex cursor-pointer items-center gap-2 font-semibold">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                disabled={!grantable.length}
                checked={allChecked}
                ref={(element) => {
                  if (element) element.indeterminate = checkedCount > 0 && !allChecked;
                }}
                onChange={(e) => toggleMany(grantable, e.target.checked)}
              />
              <span className="min-w-0 break-words">{segment.name}</span>
            </label>
            <ul className="mt-2 ml-6 flex flex-col gap-1">
              {segment.permissions.map((permission) => (
                <li key={permission.key}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs mt-0.5"
                      disabled={!canGrant(permission.key)}
                      checked={selected.includes(permission.key)}
                      onChange={(e) => toggleMany([permission.key], e.target.checked)}
                    />
                    <span className="min-w-0 break-words">{permission.description}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
