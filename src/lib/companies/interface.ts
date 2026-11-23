export interface IPhone {
  number: string;
  internationalNumber: string;
  nationalNumber: string;
  e164Number: string;
  countryCode: string;
  dialCode: string;
}

export interface ICompanyAddress {
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ICompanyBilling {
  rfc: string;
  businessName: string;
  taxRegime: string;
  zipCode: string;
  cfdiUse: string;
  email: string;
}

export interface ICompanyContact {
  name: string;
  position: string;
  email: string;
  phone: IPhone | null;
}

export interface ICompany {
  id: string;
  tenant: string;
  nameCompany: string;
  address: ICompanyAddress | null;
  billing: ICompanyBilling | null;
  contacts: ICompanyContact[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateCompanyInput = {
  tenant: string;
  nameCompany: string;
  address: ICompanyAddress;
  billing: ICompanyBilling;
  contacts: ICompanyContact[];
  owner: { email: string; name: string; password: string };
};

export type UpdateCompanyInput = {
  nameCompany: string;
  address: ICompanyAddress;
  billing: ICompanyBilling;
  contacts: ICompanyContact[];
  active: boolean;
};

// Misma conversión que hace el backend con el subdominio
export function toSubdomain(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const RESERVED_SUBDOMAINS = [
  "admin", "api", "app", "www", "static", "mail", "webmail", "cpanel", "whm",
  "webdisk", "ftp", "autodiscover", "autoconfig", "cpcalendars", "cpcontacts",
];

export const TAX_REGIMES = [
  { value: "601", label: "601 · General de Ley Personas Morales" },
  { value: "603", label: "603 · Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 · Sueldos y Salarios" },
  { value: "606", label: "606 · Arrendamiento" },
  { value: "607", label: "607 · Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 · Demás ingresos" },
  { value: "610", label: "610 · Residentes en el Extranjero" },
  { value: "611", label: "611 · Dividendos" },
  { value: "612", label: "612 · Actividades Empresariales y Profesionales" },
  { value: "614", label: "614 · Intereses" },
  { value: "615", label: "615 · Obtención de premios" },
  { value: "616", label: "616 · Sin obligaciones fiscales" },
  { value: "620", label: "620 · Sociedades Cooperativas de Producción" },
  { value: "621", label: "621 · Incorporación Fiscal" },
  { value: "622", label: "622 · Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { value: "623", label: "623 · Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 · Coordinados" },
  { value: "625", label: "625 · Plataformas Tecnológicas" },
  { value: "626", label: "626 · Régimen Simplificado de Confianza" },
];

export const CFDI_USES = [
  { value: "G01", label: "G01 · Adquisición de mercancías" },
  { value: "G02", label: "G02 · Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 · Gastos en general" },
  { value: "I01", label: "I01 · Construcciones" },
  { value: "I02", label: "I02 · Mobiliario y equipo de oficina" },
  { value: "I03", label: "I03 · Equipo de transporte" },
  { value: "I04", label: "I04 · Equipo de cómputo" },
  { value: "I05", label: "I05 · Dados, troqueles, moldes y herramental" },
  { value: "I06", label: "I06 · Comunicaciones telefónicas" },
  { value: "I07", label: "I07 · Comunicaciones satelitales" },
  { value: "I08", label: "I08 · Otra maquinaria y equipo" },
  { value: "D01", label: "D01 · Honorarios médicos y gastos hospitalarios" },
  { value: "D02", label: "D02 · Gastos médicos por incapacidad" },
  { value: "D03", label: "D03 · Gastos funerales" },
  { value: "D04", label: "D04 · Donativos" },
  { value: "D05", label: "D05 · Intereses por créditos hipotecarios" },
  { value: "D06", label: "D06 · Aportaciones voluntarias al SAR" },
  { value: "D07", label: "D07 · Primas de seguros de gastos médicos" },
  { value: "D08", label: "D08 · Transportación escolar" },
  { value: "D09", label: "D09 · Depósitos para el ahorro" },
  { value: "D10", label: "D10 · Servicios educativos" },
  { value: "S01", label: "S01 · Sin efectos fiscales" },
  { value: "CP01", label: "CP01 · Pagos" },
  { value: "CN01", label: "CN01 · Nómina" },
];
