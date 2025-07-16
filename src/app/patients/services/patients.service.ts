import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreatePatientDTO, IGetAllPatients, IUser, IPagination } from '../interfaces/patients.interface';

@Injectable({
  providedIn: 'root',
})

export class PatientsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  // getAll(params: IGetAllPatients): Observable<IPagination> {
  getAll(params: any): Observable<IPagination> {
    return this.http.post<IPagination>(
      `${this.tokenService.endPoint}patients/getAll`,
      params
    );
  }

/*   createUser(dto: ICreatePatientDTO) {
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}patients/createAccount`,
      dto
    );
  } */

/*   updateUser(id: string, dto: ICreatePatientDTO) {
    return this.http.patch<IUser>(
      `${this.tokenService.endPoint}patients/${id}`,
      dto
    );
  }

  deleteUser(id: string) {
    return this.http.delete<IUser>(`${this.tokenService.endPoint}patients/${id}`);
  }
 */
  getUser(id:number): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.tokenService.endPoint}patients/${id}`
    );
  }

/*   getRolesActives(): Observable<{id:number,name:string}[]> {
    return this.http.get<{id:number,name:string}[]>(
      `${this.tokenService.endPoint}roles/getRolesActives`
    );
  }   */
}