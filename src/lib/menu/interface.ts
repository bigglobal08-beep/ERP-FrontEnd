export interface IMenuItem {
  // Los elementos antiguos pueden no traer id
  id?: string;
  className: string;
  href: string;
  span: string;
  defaultActiveKey: string;
  eventKey: string;
  active: boolean;
  permission: string | null;
  children: IMenuItem[];
}

export interface IMenu {
  id: string;
  admin: boolean;
  menu: IMenuItem[];
}

export type MenuItemInput = {
  span: string;
  className: string;
  href: string;
  defaultActiveKey: string;
  eventKey: string;
  permission: string | null;
};
