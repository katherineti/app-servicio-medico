import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { IGetAllMedicalreports, IUser, IMedicalReportPagination, ICreateDTO } from '../interfaces/medical-reports.interface';

@Injectable({
  providedIn: 'root',
})

export class MedicalReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllMedicalreports): Observable<IMedicalReportPagination> {
    return this.http.post<IMedicalReportPagination>(
      `${this.tokenService.endPoint}medical-reports/getAll`,
      params
    );
  }

  create(dto: ICreateDTO) {
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}medical-reports/create`,
      dto
    );
  }

/*   update(id: string, dto: ICreateUserDTO) {
    return this.http.patch<IUser>(
      `${this.tokenService.endPoint}medical-reports/${id}`,
      dto
    );
  }

  deleteUser(id: string) {
    return this.http.delete<IUser>(`${this.tokenService.endPoint}medical-reports/${id}`);
  } */

  getUser(id:number): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.tokenService.endPoint}medical-reports/${id}`
    );
  }

  getRolesActives(): Observable<{id:number,name:string}[]> {
    return this.http.get<{id:number,name:string}[]>(
      `${this.tokenService.endPoint}roles/getRolesActives`
    );
  }  
}