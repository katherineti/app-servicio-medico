import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import type { ICreateMedicalPrescriptionDTO, IMedicalPrescriptios, ISearchMedicalPrescription } from '../interfaces/medical-reports.interface';

@Injectable({
  providedIn: 'root',
})

export class MedicalPrescriptionService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  createMedicalPrescription(dto: ICreateMedicalPrescriptionDTO): Observable<any> {
    return this.http.post<any>(
      `${this.tokenService.endPoint}medical-prescriptions/create`, 
      dto
    );
  }
  update(id: number, dto: any) {
    return this.http.put<IMedicalPrescriptios>(
      `${this.tokenService.endPoint}medical-prescriptions/${id}`,
      dto
    );
  }
  getAllMedicalPrescription(dto: ISearchMedicalPrescription): Observable<any> {
    return this.http.post<any>(
      `${this.tokenService.endPoint}medical-prescriptions/getAll`, 
      dto
    );
  }
  generateRecipePdf(prescriptionId: string): Observable<Blob> {console.log("prescriptionId", typeof prescriptionId)
    return this.http.get(`${this.tokenService.endPoint}medical-prescriptions/${prescriptionId}/pdf`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    })
  }
  previewRecipePdf(prescriptionId: string): Observable<Blob> {
    return this.http.get(`${this.tokenService.endPoint}medical-prescriptions/${prescriptionId}/pdf/preview`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    })
  }
}