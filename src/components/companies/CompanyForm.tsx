"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { createCompany, updateCompany } from "@/app/actions/companies-actions";
import ConditionalRender from "@/components/ui/ConditionalRender";
import FieldBoolean from "@/components/ui/form/FieldBoolean";
import FieldSelect from "@/components/ui/form/FieldSelect";
import FieldText from "@/components/ui/form/FieldText";
import FormGroup from "@/components/ui/form/FormGroup";
import FormLayout from "@/components/ui/form/FormLayout";
import { modalConfirm, modalSuccess, withLoading } from "@/components/ui/modal/modal";
import useActionError from "@/hooks/useActionError";
import useZodForm from "@/hooks/useZodForm";
import {
  CFDI_USES,
  TAX_REGIMES,
  toSubdomain,
  type ICompany,
} from "@/lib/companies/interface";
import {
  companySchema,
  FISCAL_NONE,
  toCompanyValues,
  toCreateCompanyInput,
  toUpdateCompanyInput,
  type CompanySchemaType,
} from "@/schemas/company.schema";

type Values = CompanySchemaType;

const MAX_CONTACTS = 20;
const taxOptions = [{ value: FISCAL_NONE, label: "Sin definir" }, ...TAX_REGIMES];
const cfdiOptions = [{ value: FISCAL_NONE, label: "Sin definir" }, ...CFDI_USES];

// Los errores de teléfono llegan por subcampo; en pantalla es un solo input
const mapField = (field: string) => field.replace(/^(contacts\.\d+\.phone)\..+$/, "$1");

export default function CompanyForm({
  company,
  baseDomain,
  canEdit = true,
}: {
  company?: ICompany;
  baseDomain: string;
  canEdit?: boolean;
}) {
  const isCreate = !company;
  const router = useRouter();
  const [tab, setTab] = useState("general");
  const methods = useZodForm(companySchema(isCreate), {
    defaultValues: toCompanyValues(company),
  });
  const showError = useActionError(methods.setError, mapField);
  const contacts = useFieldArray({ control: methods.control, name: "contacts" });
  const tenant = useWatch({ control: methods.control, name: "tenant" });
  const preview = toSubdomain(tenant ?? "");

  const tabs = [
    { id: "general", label: "Información general" },
    { id: "billing", label: "Datos fiscales" },
    { id: "contacts", label: "Contactos" },
    ...(isCreate ? [{ id: "owner", label: "Usuario administrador" }] : []),
  ];

  const onSubmit = async (values: Values) => {
    if (!(await modalConfirm("¿Seguro que quieres guardar la empresa?"))) return false;

    const res = await withLoading(
      company
        ? updateCompany(company.id, toUpdateCompanyInput(values))
        : createCompany(toCreateCompanyInput(values)),
      "Guardando empresa...",
    );
    if (!res.success) {
      await showError(res);
      return false;
    }

    await modalSuccess(res.message);
    if (isCreate) {
      router.push(
        res.data?.id
          ? `/app/companies?view_type=form&id=${encodeURIComponent(res.data.id)}`
          : "/app/companies",
      );
    } else {
      router.refresh();
    }
  };

  return (
    <FormLayout methods={methods} onSubmit={onSubmit}>
      <div role="tablist" className="tabs tabs-border mb-3 overflow-x-auto flex-nowrap">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab whitespace-nowrap ${tab === id ? "tab-active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <fieldset disabled={!canEdit} className="min-w-0">
        {/* Las pestañas se ocultan sin desmontar: sus campos siguen en la validación */}
        <div className={tab === "general" ? "flex flex-col gap-4" : "hidden"}>
          <FormGroup md={2}>
            <FieldText<Values> name="nameCompany" label="Nombre *" />
            <FieldText<Values>
              name="tenant"
              label="Subdominio *"
              readOnly={!isCreate}
              hint={preview ? `https://${preview}.${baseDomain}` : "Se usa en la dirección de la empresa"}
            />
            <ConditionalRender cond={!isCreate}>
              <FieldBoolean<Values> name="active" label="Empresa activa" variant="toggle" />
            </ConditionalRender>
          </FormGroup>
          <FormGroup title="Domicilio" md={2} lg={3}>
            <FieldText<Values> name="address.street" label="Calle *" />
            <FieldText<Values> name="address.exteriorNumber" label="Número exterior *" />
            <FieldText<Values> name="address.interiorNumber" label="Número interior" />
            <FieldText<Values> name="address.neighborhood" label="Colonia *" />
            <FieldText<Values> name="address.city" label="Ciudad *" />
            <FieldText<Values> name="address.state" label="Estado *" />
            <FieldText<Values> name="address.zipCode" label="Código postal *" inputMode="numeric" maxLength={5} />
            <FieldText<Values> name="address.country" label="País *" />
          </FormGroup>
        </div>

        <div className={tab === "billing" ? "" : "hidden"}>
          <FormGroup md={2}>
            <FieldText<Values> name="billing.rfc" label="RFC" maxLength={13} />
            <FieldText<Values> name="billing.businessName" label="Razón social" />
            <FieldSelect<Values> name="billing.taxRegime" label="Régimen fiscal" options={taxOptions} />
            <FieldSelect<Values> name="billing.cfdiUse" label="Uso de CFDI" options={cfdiOptions} />
            <FieldText<Values> name="billing.zipCode" label="Código postal fiscal" inputMode="numeric" maxLength={5} />
            <FieldText<Values> name="billing.email" type="email" label="Correo de facturación" />
          </FormGroup>
        </div>

        <div className={tab === "contacts" ? "flex flex-col gap-4" : "hidden"}>
          {!contacts.fields.length && (
            <p className="text-base-content/60 py-4 text-center text-sm">Sin contactos registrados.</p>
          )}
          {contacts.fields.map((field, index) => (
            <div key={field.id} className="border-base-300 rounded-box border p-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Contacto {index + 1}</h3>
                <ConditionalRender cond={canEdit}>
                  <button
                    type="button"
                    aria-label={`Quitar contacto ${index + 1}`}
                    className="btn btn-ghost btn-sm btn-square text-error"
                    onClick={() => contacts.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </ConditionalRender>
              </div>
              <FormGroup md={2}>
                <FieldText<Values> name={`contacts.${index}.name`} label="Nombre *" />
                <FieldText<Values> name={`contacts.${index}.position`} label="Puesto" />
                <FieldText<Values> name={`contacts.${index}.email`} type="email" label="Correo" />
                <FieldText<Values>
                  name={`contacts.${index}.phone`}
                  type="tel"
                  label="Teléfono"
                  hint="10 dígitos (México)"
                />
              </FormGroup>
            </div>
          ))}
          <ConditionalRender cond={canEdit && contacts.fields.length < MAX_CONTACTS}>
            <button
              type="button"
              className="btn btn-outline btn-sm self-start"
              onClick={() =>
                contacts.append({ name: "", position: "", email: "", phone: "", original: null })
              }
            >
              <Plus className="size-4" /> Agregar contacto
            </button>
          </ConditionalRender>
        </div>

        <ConditionalRender cond={isCreate}>
          <div className={tab === "owner" ? "" : "hidden"}>
            <FormGroup md={2} description="Será el primer usuario de la empresa.">
              <FieldText<Values> name="owner.name" label="Nombre *" />
              <FieldText<Values> name="owner.email" type="email" label="Correo *" />
              <FieldText<Values>
                name="owner.password"
                type="password"
                label="Contraseña *"
                hint="De 12 a 128 caracteres"
                autoComplete="new-password"
              />
            </FormGroup>
          </div>
        </ConditionalRender>
      </fieldset>

      <ConditionalRender cond={canEdit}>
        <div className="mt-4 flex justify-center">
          <button type="submit" className="btn btn-neutral btn-sm w-full max-w-xs">
            Guardar
          </button>
        </div>
      </ConditionalRender>
    </FormLayout>
  );
}
