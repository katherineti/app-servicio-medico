export interface ICreateReport {
  title: string;
  receiver: string;
  auditorId: number;
  id?:number;
}
export interface IReport {
  forEach(arg0: (value: any, key: any) => void): unknown;
  id?: number;
  code?: string;
  title: string;
  receiver: string;
  auditorId: number;    auditor: string;
  statusId?: number;
  startDate?: Date;
  endDate?: Date;
  idDuplicate?: number | null;
  updatedAt?: Date;
  summary_objective: string;
  summary_scope: string;
  summary_methodology: string;
  summary_conclusionAndObservation: string;
  introduction?: string;
  detailed_methodology?: string;
  findings?: string;
  conclusions?: string;
  images?:string[];

  actionEdit?:boolean;
}

export interface IGetAllReports {
  title?: string;
  receiver?: string;
  endDate?: Date;
  page: number;
  take: number;
}

export interface IReportPagination {
  total: number;
  page: number;
  list: IReport[];
}

// export interface ICreateUserDTO
//   extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt' > {}