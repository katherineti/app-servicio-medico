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

  //Solo admin
  totalUsers(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalUsers`
    );
  }

  //Para todos:
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
  
  //Para el dashboard del usuario almacen:
  totalAssignmentOfTheDay(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalAssignmentOfTheDay`
    );
  }

  totalAssignmentOfMonth(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.tokenService.endPoint}dashboard/totalAssignmentOfMonth`
    );
  }

    //Solo almacen
    totalAllProducts(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAllProducts`
      );
    }
    //Solo médico
    totalAllAssignments(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAssignments`
      );
    }

    // Nuevos
    totalAvailableProductsByType(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/totalAvailableProductsByType`
      );
    }
    totalOfProductAssignmentsByType(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/totalOfProductAssignmentsByType`
      );
    }
    expiredProductsCount(): Observable<any> {
      return this.http.get<any>(
        `${this.tokenService.endPoint}dashboard/expiredProductsCount`
      );
    }
}