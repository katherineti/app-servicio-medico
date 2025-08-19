import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import type { ICreateMedicalPrescriptionDTO, ISearchMedicalPrescription } from '../interfaces/medical-reports.interface';

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

  //Para el listado de recipes
  getAllMedicalPrescription(dto: ISearchMedicalPrescription): Observable<any> {
    return this.http.post<any>(
      `${this.tokenService.endPoint}medical-prescriptions/getAll`, 
      dto
    );
  }

  // Método para generar y descargar PDF del recipe médico
  generateRecipePdf(prescriptionId: string): Observable<Blob> {console.log("prescriptionId", typeof prescriptionId)
    return this.http.get(`${this.tokenService.endPoint}medical-prescriptions/${prescriptionId}/pdf`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    })
  }

  // Método para previsualizar PDF de receta médica en nueva ventana. No esta en uso
  previewRecipePdf(prescriptionId: string): Observable<Blob> {
    return this.http.get(`${this.tokenService.endPoint}medical-prescriptions/${prescriptionId}/pdf/preview`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    })
  }
 
}