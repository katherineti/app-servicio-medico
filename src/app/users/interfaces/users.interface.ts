export interface IUser {
  id: string;
  name: string;
  email?: string;
  password?: string;
  isActivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;

  actionEdit?:boolean;
  [key: string]: any;
}

export interface IGetAllUsers {
  name?: string;
  page: number;
  take: number;
}

export interface IUserPagination {
  total: number;
  page: number;
  list: IUser[];
}

export interface ICreateUserDTO
  extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt' > {}