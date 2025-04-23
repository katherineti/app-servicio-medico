export interface IUser {
  id: string;
  email: string;
  name: string;
  // password: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
  [key: string]: any;
}

export interface ICreateUserDTO
  extends Omit<IUser, 'id' | 'updatedAt' | 'role'> {}