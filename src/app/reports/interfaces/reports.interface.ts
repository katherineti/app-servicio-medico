export interface ICreateReport {
  title: string
  receiver: string
  auditorId: number
  additionalAuditorIds?: number[] // Nueva propiedad para auditores adicionales
  id?: number
}

export interface IReport {
  forEach(arg0: (value: any, key: any) => void): unknown
  id?: number
  code?: string
  title: string
  receiver: string
  auditorId: number
  auditor: string
  additionalAuditorIds?: number[] // Nueva propiedad para auditores adicionales
  statusId?: number
  startDate?: Date
  endDate?: Date
  idDuplicate?: number | null
  updatedAt?: Date
  summary_objective: string
  summary_scope: string
  summary_methodology: string
  summary_conclusionAndObservation: string
  introduction?: string
  detailed_methodology?: string
  findings?: string
  conclusions?: string
  images?: string[]
  actionEdit?: boolean
}

export interface IGetAllReports {
  title?: string
  receiver?: string
  endDate?: Date
  page: number
  take: number
}

export interface IReportPagination {
  total: number
  page: number
  list: IReport[]
}

export interface Auditor {
  id: number
  name: string
  email: string
  isActivate: boolean
  role:number
}