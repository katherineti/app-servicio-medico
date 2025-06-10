import { IGetAllProducts, IProduct } from "./medical-supplies.interface";

export interface IProductExpired extends IProduct {
  isExpired: boolean;
}

export interface IGetAllProductsExpired extends IGetAllProducts{}

export interface IProductExpiredPagination{
  total: number;
  page: number;
  list: IProductExpired[];
}