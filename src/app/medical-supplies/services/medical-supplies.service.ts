import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateProductDTO, IGetAllProducts, IProduct } from '../interfaces/medical-supplies.interface';

export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})

export class MedicalSuppliesService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  controller='medical-supplies';
  getProducts(params: IGetAllProducts): Observable<any> {
    return this.http.post<IProduct[]>(
      `${this.tokenService.endPoint}${this.controller}/getAll`,
      params
    );
  }

  // createProduct(dto: ICreateProductDTO) {
  createProduct(dto: any) {
    console.log("dto create" , dto)
    return this.http.post<IProduct>(
      `${this.tokenService.endPoint}${this.controller}/newProduct`,
      dto
    );
  }

  updateProduct(id: number, dto: any) {
    console.log("dto update" , dto)

    return this.http.put<IProduct>(
      `${this.tokenService.endPoint}${this.controller}/${id}`,
      dto
    );
  }

  deleteProduct(id: string) {
    return this.http.delete<IProduct>(`${this.tokenService.endPoint}${this.controller}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.tokenService.endPoint}categories/getAll`
    );
  }
  
}