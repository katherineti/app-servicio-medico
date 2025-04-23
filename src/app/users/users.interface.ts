export interface IUser {
  id: string;
  email: string;
  name: string;
  isActivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
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
  extends Omit<IUser, 'id' | 'email' | 'createdAt' | 'updatedAt' > {}