import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateRoleDTO, IGetAllRoles, IRole, IRolePagination } from '../interfaces/roles.interface';

@Injectable({
  providedIn: 'root',
})

export class RolesService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllRoles): Observable<IRolePagination> {
    return this.http.post<IRolePagination>(
      `${this.tokenService.endPoint}roles/getAll`,
      params
    );
  }

  create(dto: ICreateRoleDTO) {
    console.log("create role:" , dto)
    return this.http.post<IRole>(
      `${this.tokenService.endPoint}roles/create`,
      dto
    );
  }

  delete(id: string) {
    return this.http.delete<IRole>(`${this.tokenService.endPoint}roles/${id}`);
  }
}