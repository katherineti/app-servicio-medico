import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../../services/Token.service';
import { ICreateReport, IReport } from '../interfaces/reports.interface';

@Injectable({
  providedIn: 'root',
})

export class ReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  create(dto: ICreateReport) {
    console.log("dto create", dto)
    return this.http.post<IReport>(
      `${this.tokenService.endPoint}temp-auditor-reports`,
      dto
    );
  }
 
  // update(formData: FormData, id?: number) {
  //   return this.http.put<IReport>(
  //     `${this.tokenService.endPoint}temp-auditor-reports/${id}`,
  //     formData
  //   );
  // }
  update(dto: IReport, id?: number) {
    console.log("update",dto)
    return this.http.put<IReport>(
      `${this.tokenService.endPoint}temp-auditor-reports/${id}`,
      dto
    );
  }

  updateWithImages(formData: FormData, id?: number) {
    return this.http.put<IReport>(
      `${this.tokenService.endPoint}temp-auditor-reports/images/${id}`,
      formData
    );
  }

}