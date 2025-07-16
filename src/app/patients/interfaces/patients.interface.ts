export interface IUser{
  id: string;
  name: string;
  email: string;
  password?: string;
  roleId?: number;
  role: string;
  isActivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  actionEdit?:boolean;
  [key: string]: any;
}
export interface IPatient{
    id: string;
    name: string,
    birthdate:any,
    age: number,
    cedula: string,
    email: string,
    phone: string,
    gender: string,
    civilStatus: string,
    children: number,
    createdAt: Date,
    updatedAt: Date
}

export interface IGetAllPatients {
  patientCedula?: string;
  page: number;
  take: number;
}

export interface IPagination {
  total: number;
  page: number;
  list: IPatient[];
}

export interface ICreatePatientDTO
  extends Omit<IPatient, 'id' | 'createdAt' | 'updatedAt' > {}