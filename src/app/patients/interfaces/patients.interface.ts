export interface IPatient{
  id: string;
  name: string,
  birthdate:any,
  placeBirth:string,
  age: number,
  cedula: string,
  email: string,
  phone: string,
  gender: string,
  civilStatus: string,
  children: number,
  isActivate:boolean,
  createdAt: Date,
  updatedAt: Date,
  actionEdit?:boolean;

  cedulaType?:string;
  cedulaNumber?:string;
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

export interface UpdatePatientDto{
    name: string;
    birthdate: string;
    placeBirth : string;
    age: number;
    cedula: string;
    email: string;
    phone:string ;
    gender: string;
    civilStatus: string;
    children: number;
    isActivate:boolean;
}