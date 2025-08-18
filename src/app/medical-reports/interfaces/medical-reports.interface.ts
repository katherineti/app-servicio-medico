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
    patientId: any,
    doctorId: any,
    description: string,
    insurance: string,
    apsCenter: string,
    mppsCM: string,
    isActivate: boolean,
    createdAt: any
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

export interface ICreateDTO
  extends Omit<IMedicalReports, 'id' | 'createdAt' | 'isActivate' > {}
  // extends Omit<IMedicalReports, 'id' | 'createdAt' | 'updatedAt' > {}


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
  medicalReportId: string;
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
  doctorName: string;
  doctorCedula: string;
  mpps: string;
  patientId: number;
  patientName: string;
  patientCedula: string;
  indications: string;
  expirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}