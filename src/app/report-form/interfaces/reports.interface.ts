export interface ICreateReport {
  title: string;
  addressee: string;
  auditorId: number;
}
export interface IReport {
  id?: number;
  title: string;
  addressee: string;
  auditorId: number;
  statusId?: number;
  startDate?: Date;
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
}
