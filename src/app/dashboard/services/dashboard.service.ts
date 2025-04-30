import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  totalUsers(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalUsers`
    );
  }

  totalProductsOfTheDay(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalProductsOfTheDay`
    );
  }

  totalProductsOfMonth(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalProductsOfMonth`
    );
  }
}
