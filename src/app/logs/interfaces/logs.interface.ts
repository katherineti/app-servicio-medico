export interface ILog{
  id: number;
  userId: number;
  productId: number;
  action: string;
  ipAddress: string; //Direccion IP del usuario conectado
  hostname: string; //Hostname del usuario conectado
  createdAt: Date;
  [key: string]: any;
}

export interface IGetAllLogs {
  page: number;
  take: number;
  name_user?: string;
  createdAt?: string;
}

export interface ILogPagination {
  total: number;
  page: number;
  list: ILog[];
}

export interface ICreateLogDTO
  extends Omit<ILog, 'id' | 'createdAt' | 'updatedAt' > {}