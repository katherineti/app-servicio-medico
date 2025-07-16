import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateMedicalPrescriptionDTO } from '../interfaces/medical-reports.interface';

@Injectable({
  providedIn: 'root',
})

export class MedicalPrescriptionService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  // Método para crear recipe médico
  createMedicalPrescription(dto: ICreateMedicalPrescriptionDTO): Observable<any> {
    return this.http.post<any>(
      `${this.tokenService.endPoint}medical-prescriptions/create`, 
      dto
    );
  }
 
}