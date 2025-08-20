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

export interface IMedicalReports {
    id: string;
    apsCenter: string,
    insurance: string,
    doctorId: any,
    doctorName: string,
    doctorCedula: string,
    patientId: any,
    patientName: string,
    patientCedula: string,
    description: string,
    createdAt: Date,
    countMedicalPrescriptions:number,//cuenta los recipes del informe

    mppsCM?: string,
    isActivate?: boolean,
}

export interface IGetAllMedicalreports {
  doctorCedula?: number;
  patientCedula?: number;
  createdAt?: any;
  page: number;
  take: number;
}

export interface IMedicalReportPagination {
  total: number;
  page: number;
  list: IMedicalReports[];
}

/* export interface ICreateDTO
  extends Omit<IMedicalReports, 'id' | 'createdAt' | 'isActivate' > {} */
export interface ICreateDTO  {
  apsCenter: string,
  insurance: string,
  patientId: number,
  doctorId: number,
  description: string,
  mppsCM: string
}

// Nueva interfaz para la creación de recetas médicas
export interface ICreateMedicalPrescriptionDTO {
  place: string
  emissionDate?: string
  expirationDate: string
  recipeContent: string
  doctorId: string
  mpps: string
  patientId: string
  indications?: string // Opcional
  medicalReportId?: string // Opcional, para vincular con un informe existente
}

export interface ISearchMedicalPrescription{//GetAll
  page: number;
  take: number;
  medicalReportId: number;
}

export interface IMedicalPrescriptioPagination {
  total: number;
  page: number;
  list: IMedicalPrescriptios[];
}

export interface IMedicalPrescriptios{
  id: number;
  medicalReportId: number;
  place: string;
  recipeContent: string;
  doctorId: number;
  doctorName?: string;
  doctorCedula?: string;
  mpps: string;
  patientId: number;
  patientName?: string;
  patientCedula?: string;
  indications: string;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}