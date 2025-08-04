import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { IGetAllLogs, ILogPagination } from '../interfaces/logs.interface';

@Injectable({
  providedIn: 'root',
})

export class LogsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getAll(params: IGetAllLogs): Observable<ILogPagination> {
    return this.http.post<ILogPagination>(
      `${this.tokenService.endPoint}logs/getAll`,
      params
    );
  }

}