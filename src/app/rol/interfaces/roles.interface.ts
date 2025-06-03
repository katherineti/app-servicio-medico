export interface IRole {
  id: number;
  name: string;
  description: string;
  isActivate: boolean;
  actionEdit?:boolean;
  [key: string]: any;
}

export interface IGetAllRoles {
  name?: string;
  page: number;
  take: number;
}

export interface IRolePagination {
  total: number;
  page: number;
  list: IRole[];
}

export interface ICreateRoleDTO
  extends Omit<IRole, 'id' > {}

export interface IUpdateRole {
  name: string;
  description: string;
  isActivate: boolean;
}