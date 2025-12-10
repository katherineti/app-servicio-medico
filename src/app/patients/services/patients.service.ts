import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { IGetAllPatients, IPagination, UpdatePatientDto, IPatient } from '../interfaces/patients.interface';
@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  getAll(params: IGetAllPatients): Observable<IPagination> {
    return this.http.post<IPagination>(
      `${this.tokenService.endPoint}patients/getAll`,
      params
    );
  }
   update(id: string, dto: UpdatePatientDto) {console.log(dto)
    return this.http.patch<IPatient>(
      `${this.tokenService.endPoint}patients/${id}`,
      dto
    );
  }
}