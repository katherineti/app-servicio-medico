export interface IProduct {
  id: number;
  name: string;
  description: string;
  type: string;
  stock: number;
  code: string;
  categoryId: number;
  category: string;
  statusId: number;
  status: string;
  url_image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGetAllProducts {
  name?: string;
  page: number;
  take: number;
}

export interface IProductPagination {
  total: number;
  page: number;
  list: IProduct[];
}

export interface ICreateProductDTO
  extends Omit<IProduct, 'id' | 'createdAt' | 'updatedAt' > {}