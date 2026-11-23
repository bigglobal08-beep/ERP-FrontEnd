import { z } from "zod";
import {
  RESERVED_SUBDOMAINS,
  toSubdomain,
  type CreateCompanyInput,
  type ICompany,
  type ICompanyContact,
  type IPhone,
  type UpdateCompanyInput,
} from "@/lib/companies/interface";

// El select nativo no maneja "" como opción elegible: este valor significa "sin definir"
export const FISCAL_NONE = "__none__";

const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
const onlyDigits = (value: string) => value.replace(/\D/g, "");

const required = (label: string, max: number) =>
  z.string().trim().min(1, `${label}: campo obligatorio`).max(max, `${label}: máximo ${max} caracteres`);

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.email().safeParse(v).success, "Ingresa un correo válido");

const contactSchema = z
  .object({
    name: required("Nombre del contacto", 160),
    position: z.string().trim().max(120, "Puesto: máximo 120 caracteres"),
    email: optionalEmail,
    phone: z.string().trim(),
    // Se conserva el teléfono original para no alterar números de otros países
    original: z.custom<IPhone | null>(),
  })
  .superRefine((contact, ctx) => {
    const digits = onlyDigits(contact.phone);
    const originalDigits = onlyDigits(
      contact.original?.nationalNumber || contact.original?.number || "",
    );
    if (digits && digits !== originalDigits && digits.length !== 10) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "El teléfono debe tener 10 dígitos",
      });
    }
  });

export const companySchema = (isCreate: boolean) =>
  z
    .object({
      tenant: z.string(),
      nameCompany: required("Nombre", 160),
      active: z.boolean(),
      address: z.object({
        street: required("Calle", 160),
        exteriorNumber: required("Número exterior", 20),
        interiorNumber: z.string().trim().max(20, "Número interior: máximo 20 caracteres"),
        neighborhood: required("Colonia", 120),
        city: required("Ciudad", 120),
        state: required("Estado", 120),
        zipCode: z.string().trim().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),
        country: required("País", 80),
      }),
      billing: z.object({
        rfc: z
          .string()
          .trim()
          .refine((v) => v === "" || RFC_PATTERN.test(v.toUpperCase()), "El RFC no tiene un formato válido"),
        businessName: z.string().trim().max(254, "Razón social: máximo 254 caracteres"),
        taxRegime: z.string(),
        zipCode: z
          .string()
          .trim()
          .refine((v) => v === "" || /^\d{5}$/.test(v), "El código postal fiscal debe tener 5 dígitos"),
        cfdiUse: z.string(),
        email: optionalEmail,
      }),
      contacts: z.array(contactSchema).max(20, "Máximo 20 contactos"),
      owner: z.object({ email: z.string().trim(), name: z.string().trim(), password: z.string() }),
    })
    .superRefine((values, ctx) => {
      // El subdominio y el dueño solo se capturan en el alta
      if (!isCreate) return;

      const issue = (path: (string | number)[], message: string) =>
        ctx.addIssue({ code: "custom", path, message });

      const tenant = toSubdomain(values.tenant);
      if (tenant.length < 3) issue(["tenant"], "El subdominio debe tener al menos 3 letras o números");
      else if (tenant.length > 40) issue(["tenant"], "El subdominio admite máximo 40 caracteres");
      else if (RESERVED_SUBDOMAINS.includes(tenant)) issue(["tenant"], "Ese subdominio está reservado");

      if (!z.email().safeParse(values.owner.email).success) {
        issue(["owner", "email"], "Ingresa el correo del usuario administrador");
      }
      if (!values.owner.name) issue(["owner", "name"], "Escribe el nombre del usuario administrador");
      if (values.owner.password.length < 12 || values.owner.password.length > 128) {
        issue(["owner", "password"], "La contraseña debe tener de 12 a 128 caracteres");
      }
    });

export type CompanySchemaType = z.infer<ReturnType<typeof companySchema>>;

export const toCompanyValues = (company?: ICompany | null): CompanySchemaType => ({
  tenant: company?.tenant ?? "",
  nameCompany: company?.nameCompany ?? "",
  active: company?.active ?? true,
  address: {
    street: company?.address?.street ?? "",
    exteriorNumber: company?.address?.exteriorNumber ?? "",
    interiorNumber: company?.address?.interiorNumber ?? "",
    neighborhood: company?.address?.neighborhood ?? "",
    city: company?.address?.city ?? "",
    state: company?.address?.state ?? "",
    zipCode: company?.address?.zipCode ?? "",
    country: company?.address?.country ?? "México",
  },
  billing: {
    rfc: company?.billing?.rfc ?? "",
    businessName: company?.billing?.businessName ?? "",
    taxRegime: company?.billing?.taxRegime || FISCAL_NONE,
    zipCode: company?.billing?.zipCode ?? "",
    cfdiUse: company?.billing?.cfdiUse || FISCAL_NONE,
    email: company?.billing?.email ?? "",
  },
  contacts: (company?.contacts ?? []).map((contact) => ({
    name: contact.name,
    position: contact.position ?? "",
    email: contact.email ?? "",
    phone: contact.phone?.nationalNumber || contact.phone?.number || "",
    original: contact.phone ?? null,
  })),
  owner: { email: "", name: "", password: "" },
});

function toPhone(contact: CompanySchemaType["contacts"][number]): IPhone | null {
  const digits = onlyDigits(contact.phone);
  if (!digits) return null;

  const { original } = contact;
  if (original && onlyDigits(original.nationalNumber || original.number) === digits) {
    // Solo los campos del contrato: el backend rechaza cualquier otro
    return {
      number: original.number,
      internationalNumber: original.internationalNumber ?? "",
      nationalNumber: original.nationalNumber ?? "",
      e164Number: original.e164Number,
      countryCode: original.countryCode,
      dialCode: original.dialCode,
    };
  }

  const national = `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  return {
    number: national,
    internationalNumber: `+52 ${national}`,
    nationalNumber: national,
    e164Number: `+52${digits}`,
    countryCode: "MX",
    dialCode: "+52",
  };
}

const toContacts = (values: CompanySchemaType): ICompanyContact[] =>
  values.contacts.map((contact) => ({
    name: contact.name,
    position: contact.position,
    email: contact.email,
    phone: toPhone(contact),
  }));

const toAddress = ({ address }: CompanySchemaType) => ({
  ...address,
  interiorNumber: address.interiorNumber || null,
});

// Siempre los 6 campos: el PATCH reemplaza billing completo
const toBilling = ({ billing }: CompanySchemaType) => ({
  rfc: billing.rfc.toUpperCase(),
  businessName: billing.businessName,
  taxRegime: billing.taxRegime === FISCAL_NONE ? "" : billing.taxRegime,
  zipCode: billing.zipCode,
  cfdiUse: billing.cfdiUse === FISCAL_NONE ? "" : billing.cfdiUse,
  email: billing.email,
});

export const toCreateCompanyInput = (values: CompanySchemaType): CreateCompanyInput => ({
  tenant: values.tenant,
  nameCompany: values.nameCompany,
  address: toAddress(values),
  billing: toBilling(values),
  contacts: toContacts(values),
  owner: values.owner,
});

export const toUpdateCompanyInput = (values: CompanySchemaType): UpdateCompanyInput => ({
  nameCompany: values.nameCompany,
  address: toAddress(values),
  billing: toBilling(values),
  contacts: toContacts(values),
  active: values.active,
});
