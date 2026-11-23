export interface IPermission {
  id: string;
  key: string;
  description: string;
  segment: string;
  system: boolean;
  order: number;
}

export interface IPermissionSegment {
  // "" en el grupo automático sin-segmento
  id: string;
  key: string;
  name: string;
  description: string;
  order: number;
  permissions: IPermission[];
}

export type SegmentInput = {
  key?: string;
  name: string;
  description: string;
  order: number;
};

export type PermissionInput = {
  key?: string;
  description: string;
  segment: string;
  order: number;
};
