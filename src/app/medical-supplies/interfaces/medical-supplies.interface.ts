export interface IProduct {
  id: number;
  name: string;
  description: string;
  type: number;
  stock: number;
  code: string;
  categoryId: number;
  category: string;
  statusId: number;
  status: string;
  url_image?: string;
  createdAt?: string;
  updatedAt?: string;
  expirationDate: string;

  actionEdit?:boolean;
}

export interface IGetAllProducts {
  page: number;
  take: number;
  name?: string;
  category?: string;
  expirationDate?: Date;
}

export interface IProductPagination {
  total: number;
  page: number;
  list: IProduct[];
}

export interface ICreateProductDTO
  extends Omit<IProduct, 'id' | 'createdAt' | 'updatedAt' > {}