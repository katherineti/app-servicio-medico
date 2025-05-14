import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';

@Injectable({
  providedIn: 'root',
})

export class ReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  // getUsers(params: IGetAllUsers): Observable<IUserPagination> {
  getUsers(params: any): Observable<any> {
    // return this.http.post<IUserPagination>(
    return this.http.post<any>(
      `${this.tokenService.endPoint}auditor-reports/getAll`,
      params
    );
  }

  // createUser(dto: ICreateUserDTO) {
  create(dto: any) {
    console.log("dto create" , dto)
    // return this.http.post<IUser>(
    return this.http.post<any>(
      `${this.tokenService.endPoint}auditor-reports`,
      dto
    );
  }
/* 
  updateUser(id: string, dto: ICreateUserDTO) {
    return this.http.patch<IUser>(
      `${this.tokenService.endPoint}users/${id}`,
      dto
    );
  }

  deleteUser(id: string) {
    return this.http.delete<IUser>(`${this.tokenService.endPoint}users/${id}`);
  }

  getUser(id:number): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.tokenService.endPoint}users/${id}`
    );
  }

  getRolesActives(): Observable<{id:number,name:string}[]> {
    return this.http.get<{id:number,name:string}[]>(
      `${this.tokenService.endPoint}roles/getRolesActives`
    );
  }   */
}