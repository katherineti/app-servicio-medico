import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ICreateReport, IGetAllReports, IReport, IReportPagination } from '../interfaces/reports.interface';

@Injectable({
  providedIn: 'root',
})

export class ReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllReports): Observable<IReportPagination> {
    return this.http.post<IReportPagination>(
      `${this.tokenService.endPoint}temp-auditor-reports/getAll`,
      params
    );
  }
   //creacion de reporte
    create(dto: ICreateReport) {
      console.log("dto create", dto)
      return this.http.post<IReport>(
        `${this.tokenService.endPoint}temp-auditor-reports`,
        dto
      );
    }
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

  deleteReport(id: string) {
    return this.http.delete<IReport>(`${this.tokenService.endPoint}temp-auditor-reports/${id}`);
  }
}