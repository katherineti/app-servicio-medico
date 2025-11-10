import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateUserDTO, IGetAllUsers, IUser, IUserPagination } from '../interfaces/users.interface';

@Injectable({
  providedIn: 'root',
})

export class UsersService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getUsers(params: IGetAllUsers): Observable<IUserPagination> {
    return this.http.post<IUserPagination>(
      `${this.tokenService.endPoint}users/getAll`,
      params
    );
  }

  createUser(dto: ICreateUserDTO) {
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}users/createAccount`,
      dto
    );
  }

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
  }  

  //excel
  exportUsers(format: "xlsx" | "csv", name?: string, cedula?: string, role?: string): Observable<Blob> {
    const body = {
      format,
      name: name || "",
      cedula: cedula || "",
      role: role || "all",
    }
    return this.http.post(`${this.tokenService.endPoint}excel/download`, body, {
      responseType: "blob",
    })
  }

  exportUsersToExcel(name?: string, cedula?: string, role?: string): Observable<Blob> {
    return this.exportUsers("xlsx", name, cedula, role)
  }

  exportUsersToCSV(name?: string, cedula?: string, role?: string): Observable<Blob> {
    return this.exportUsers("csv", name, cedula, role)
  }

  downloadFile(blob: Blob, fileName: string): void {
    const link = document.createElement("a")
    const url = window.URL.createObjectURL(blob)
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }
}