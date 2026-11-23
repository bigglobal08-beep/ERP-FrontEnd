export interface ICompanyModuleChild {
  id: string;
  className: string;
  href: string;
  span: string;
  defaultActiveKey: string;
  eventKey: string;
  active: boolean;
}

export interface ICompanyModule {
  id: string;
  key: string;
  className: string;
  href: string;
  span: string;
  defaultActiveKey: string;
  eventKey: string;
  order: number;
  active: boolean;
  children: ICompanyModuleChild[];
  createdAt: string;
  updatedAt: string;
}

export type ICompanyModuleAssigned = Omit<
  ICompanyModule,
  "id" | "createdAt" | "updatedAt"
>;

export interface ICompanyModuleDirectory {
  companyClientId: string;
  tenant: string;
  modules: ICompanyModuleAssigned[];
  updatedAt: string | null;
}

export type CompanyModuleInput = {
  key?: string;
  span: string;
  className: string;
  href: string;
  defaultActiveKey: string;
  eventKey: string;
  order: number;
  active: boolean;
};

export type CompanyModuleChildInput = {
  span: string;
  className: string;
  href: string;
  defaultActiveKey: string;
  eventKey: string;
  active: boolean;
};

export type AssignCompanyModule = { key: string; children: string[] };
