import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { HttpClient, HttpResponse } from '@angular/common/http';

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
    totalAllProducts(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAllProducts`
      );
    }
    totalAllAssignments(): Observable<{ count: number }> {
      return this.http.get<{ count: number }>(
        `${this.tokenService.endPoint}dashboard/totalAssignments`
      );
    }
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
  generateReportPdf(id: number,body:any): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}temp-auditor-reports/pdf/${id}`, body,options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              let filename = `reporte-auditoria-${id}.pdf`;
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
  generateDashboardReport_Users(): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              console.log("reporte-estadistico-de-usuarios",contentDisposition)
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-de-usuarios-${year}.pdf`;
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
  pdfRegistryMedicalSupplies(reportTodayOrMonth:string): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      let endpointReport = 'medicalSuppliesToday'
      if(reportTodayOrMonth==='mes'){
        endpointReport = 'medicalSuppliesMonth'
      } else if(reportTodayOrMonth==='todos'){
        endpointReport = 'medicalSupplies/all'
      }
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/register/${endpointReport}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-insumos-medicos(Hoy)-${year}-${month}-${day}.pdf`;
                if(reportTodayOrMonth==='mes'){
                   filename = `reporte-estadistico-insumos-medicos(Mes)-${year}-${month}-${day}.pdf`;
                }
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
  pdfRegistryAssignmentsMedicalSupplies_MonthOrToday(reportTodayOrMonth:string): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const,
      reportType: ''
    };
    return new Observable<void>(observer => {
      let endpointReport = 'assignments-day'
      if(reportTodayOrMonth==='mes'){
        endpointReport = 'assignments-month'
      }
      if(reportTodayOrMonth==='anio'){
        endpointReport = 'assignments-year';
      }
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/register/${endpointReport}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) { 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {  
                  filename = matches[1].replace(/['"]/g, ''); 
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                filename = `reporte-estadistico-de-registros-asignaciones-a-emopelados-${year}-${month}-${day}.pdf`;
                if(reportTodayOrMonth==='mes'){
                   filename = `reporte-estadistico-de-registros-asignaciones-a-empleados-${year}-${month}.pdf`;
                }
                if(reportTodayOrMonth==='anio'){
                   filename = `reporte-estadistico-de-registros-asignaciones-a-empleados-${year}.pdf`;
                }
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
  pdfStockAssignmentsBySupplyType_Month(supplyType:number): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/pdf/generate/assignments-month/${supplyType}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) { 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) {
                  filename = matches[1].replace(/['"]/g, '');
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                  filename = `reporte-estadistico-asignaciones-${supplyType}-${year}-${month}.pdf`;
                  if(supplyType===1){
                    filename = `reporte-estadistico-asignaciones-medicamentos-${year}-${month}.pdf`
                  }
                  if(supplyType===2){
                    filename = `reporte-estadistico-asignaciones-uniformes-${year}-${month}.pdf`
                  }
                  if(supplyType===3){
                    filename = `reporte-estadistico-asignaciones-equiposodontologicos-${year}-${month}.pdf`
                  }
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
  pdfMedicalSuppliesAvailables(supplyType:number): Observable<void> {
    const options = {
      responseType: 'blob' as 'blob',
      observe: 'response' as const
    };
    return new Observable<void>(observer => {
      this.http.post(`${this.tokenService.endPoint}dashboard-reports/generate/${supplyType}`, null, options)
        .subscribe({
          next: (response: HttpResponse<Blob>) => {
            if (response.body) {
              let filename: string | null = null; 
              const contentDisposition = response.headers.get('Content-Disposition');
              if (contentDisposition) { 
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                if (matches != null && matches[1]) { 
                  filename = matches[1].replace(/['"]/g, ''); 
                }
              }
              if (!filename) {
                let today = new Date();
                let year = today.getFullYear();
                let month = (today.getMonth() + 1).toString().padStart(2, '0');
                let day = today.getDate().toString().padStart(2, '0');
                if(supplyType===1){
                  filename = `reporte-estadistico-medicamentos-disponibles-${year}-${month}-${day}.pdf`;
                }else if(supplyType===2){
                  filename = `reporte-estadistico-uniformes-disponibles-${year}-${month}-${day}.pdf`;
                }else {
                  filename = `reporte-estadistico-equiposodontologicos-disponibles-${year}-${month}-${day}.pdf`;
                }
              }
              const blob = new Blob([response.body], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 100);
              observer.next();
              observer.complete();
            } else {
              observer.error('La respuesta no contiene datos');
            }
          },
          error: (err) => {
            console.error('Error al generar el PDF:', err);
            observer.error(err);
          }
        });
    });
  }
}