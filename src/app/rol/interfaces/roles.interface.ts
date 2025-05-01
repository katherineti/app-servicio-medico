export interface IRole {
  id: string;
  name: string;
  // isActivate: boolean;
  // createdAt?: Date;
  // updatedAt?: Date;
  // role: string;

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
  extends Omit<IRole, 'id' | 'createdAt' | 'updatedAt' > {}