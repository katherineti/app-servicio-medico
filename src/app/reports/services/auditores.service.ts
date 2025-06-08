import { HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import {  IReportPagination } from '../interfaces/reports.interface';

@Injectable({
  providedIn: 'root',
})

export class AuditoresService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAllActives(): Observable<any> {
    return this.http.get<any>(
      `${this.tokenService.endPoint}temp-auditor-reports/getAllAuditores`
    );
  }
}