import { Component, inject } from "@angular/core"
import { MaterialModule } from "../material/material.module"
import { FeatherIconsModule } from "../feathericons/feathericons.module"
import { Router } from "@angular/router"
import { DashboardService } from "./services/dashboard.service"
import { firstValueFrom } from "rxjs"
import { toast } from "ngx-sonner"
import { CommonModule } from "@angular/common"
import { AuthService } from "../services/auth.service"
import { IReport } from "../reports/interfaces/reports.interface"
import { MatSnackBar } from "@angular/material/snack-bar"
import { TokenService } from "../services/Token.service"

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, MaterialModule, FeatherIconsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  providers: [DashboardService, AuthService],
})
export class DashboardComponent {
  countUsers = 0
  countAllProducts = 0
  countProductsOfTheDay = 0
  countProductsOfMonth = 0
  countAllAssignments = 0
  countAssignmentOfTheDay = 0
  countAssignmentOfMonth = 0
  formattedLocalDate!: string
  role = ""
  getAccumulatedProductsStockByType!: {
    sum_medicamentos: string
    sum_uniformes: string
    sum_equiposOdontologicos: string
  }
  getAccumulatedAssignmentsByType!: {
    sumAsig_medicamentos: string
    sumAsig_uniformes: string
    sumAsig_equiposOdontologicos: string
  }
  getExpiredProductsCount: any

  // Estado de generación de reportes
  generatingReport = false

  isGeneratingPdf = false;

  public router = inject(Router)
  public dashboardService = inject(DashboardService)
  private authService = inject(AuthService)
  private snackBar = inject(MatSnackBar);
  // private reportsService = inject(ReportsService);
  private readonly tokenService = inject(TokenService);

  async ngOnInit() {
    this.role = await this.authService.getRol()

    if (this.role === "admin" || this.role === 'admin RRHH' || this.role === "auditor") {
      this.totalUsers()
      this.totalProductsOfTheDay()
      this.totalProductsOfMonth()
    }
    if (this.role === "admin" || this.role === 'admin RRHH' || this.role === "almacen" || this.role === "auditor") {
      this.totalAssignmentOfTheDay()
      this.totalAssignmentOfMonth()
    }
    if (this.role === "almacen" || this.role === "medico") {
      this.totalAllProducts()
    }

    this.getAccumulatedProductsStockByType = {
      sum_medicamentos: "0",
      sum_uniformes: "0",
      sum_equiposOdontologicos: "0",
    }
    if (this.role === "admin" || this.role === 'admin RRHH' || this.role === "almacen") {
      this.totalAvailableProductsByType()
      this.totalOfProductAssignmentsByType()
    }

    this.totalAllAssignments()
    this.expiredProductsCount()

    // this.estadisticas();
  }

  navigate(route: string) {
    this.router.navigate([route])
  }

  // Métodos existentes del dashboard...
  async totalUsers() {
    try {
      const users: { count: number } = await firstValueFrom(this.dashboardService.totalUsers());
      this.countUsers = users.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de usuarios", e)
    }
  }

  async totalProductsOfTheDay() {
    try {
      const totalProductsOfTheDay: { count: number } = await firstValueFrom(this.dashboardService.totalProductsOfTheDay());
      this.countProductsOfTheDay = totalProductsOfTheDay.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos del día", e)
    }
  }

  async totalProductsOfMonth() {
    try {
      const totalProductsOfMonth: { count: number } = await firstValueFrom(this.dashboardService.totalProductsOfMonth());
      this.countProductsOfMonth = totalProductsOfMonth.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos del mes", e)
    }
  }

  async totalAssignmentOfTheDay() {
    try {
      const totalAssignmentOfTheDay: { count: number } = await firstValueFrom(this.dashboardService.totalAssignmentOfTheDay());
      this.countAssignmentOfTheDay = totalAssignmentOfTheDay.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones del día", e)
    }
  }

  async totalAssignmentOfMonth() {
    try {
      const totalAssignmentOfMonth: { count: number } = await firstValueFrom(this.dashboardService.totalAssignmentOfMonth());
      this.countAssignmentOfMonth = totalAssignmentOfMonth.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones del mes", e)
    }
  }

  async totalAllProducts() {
    try {
      const totalAllProducts: { count: number } = await firstValueFrom(this.dashboardService.totalAllProducts());
      this.countAllProducts = totalAllProducts.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos", e)
    }
  }

  async totalAllAssignments() {
    try {
      const totalAllAssignment: { count: number } = await firstValueFrom(this.dashboardService.totalAllAssignments());
      this.countAllAssignments = totalAllAssignment.count;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones", e)
    }
  }

  async totalAvailableProductsByType() {
    try {
      const totalAvailableProductsByType: any = await firstValueFrom(this.dashboardService.totalAvailableProductsByType());
      this.getAccumulatedProductsStockByType = totalAvailableProductsByType;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de productos disponibles por tipo de producto", e)
    }
  }

  async totalOfProductAssignmentsByType() {
    try {
      const totalOfProductAssignmentsByType: any = await firstValueFrom(this.dashboardService.totalOfProductAssignmentsByType());
      this.getAccumulatedAssignmentsByType = totalOfProductAssignmentsByType;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de asignaciones por tipo de producto", e)
    }
  }

  async expiredProductsCount() {
    try {
      const expiredProductsCount: any = await firstValueFrom(this.dashboardService.expiredProductsCount());
      this.getExpiredProductsCount = expiredProductsCount;
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de productos proximos a vencerse o caducados", e)
    }
  }

  getLocalDate(): Date {
    return new Date()
  }

  formatearFecha(fecha: Date, mes: string | null = null, anio_: string | null = null): string {
    const dia = fecha.getDate()
    const mesCompleto = new Intl.DateTimeFormat("es", { month: "long" }).format(fecha)
    const mesInicialMayuscula = mesCompleto.charAt(0).toUpperCase() + mesCompleto.slice(1)
    const anio = fecha.getFullYear()
    if (mes) return `${mesInicialMayuscula} de ${anio}`
    if (anio_) return `${anio}`
    return `${dia} de ${mesInicialMayuscula} de ${anio}`
  }

  /**1
   * Genera y descarga el PDF del reporte de registro de usuarios
   * @param element Reporte para el que se generará el PDF
   */
  // generatePdf(element: IReport): void {
  generatePdf(): void {
    if (this.isGeneratingPdf) {
      return;
    }
    
    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    this.dashboardService.generateDashboardReport_Users().subscribe({
      next: () => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open('PDF generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar el PDF: ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error('Error al generar el PDF:', err);
      }
    }); 
  }

  /**2
   * Genera y descarga el PDF del reporte de l registro de inventario almacen (dia o mes)
   */
  generatePdfRegistryMedicalSupplies(reportTodayOrMonth:string): void {

    if (this.isGeneratingPdf) {
      return;
    }
    console.log(`generar pdf de registros de insumos medicos (${reportTodayOrMonth})`)

    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    this.dashboardService.pdfRegistryMedicalSupplies(reportTodayOrMonth).subscribe({
      next: () => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open('PDF generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar el PDF de registros de insumos medicos (${reportTodayOrMonth}): ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error(`Error al generar el PDF de registros de insumos medicos (${reportTodayOrMonth}):`, err);
      }
    }); 
  }
  /**card 4,5
   * Genera y descarga el PDF del reporte de asignaciones de insumos medicos a empleados o a los familiares de empleados (dia o mes)
   */
  pdfRegistryAssignmentsMedicalSupplies_MonthOrToday(reportTodayOrMonth:string): void {

    if (this.isGeneratingPdf) {
      return;
    }
    console.log(`Generar pdf de registros de asignacion de insumos medicos a empleados o a sus familiares (${reportTodayOrMonth})`)

    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    this.dashboardService.pdfRegistryAssignmentsMedicalSupplies_MonthOrToday(reportTodayOrMonth).subscribe({
      next: () => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open('PDF generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar el PDF de registros de asignaciones de insumos medicos a empleados (${reportTodayOrMonth}): ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error(`Error al generar el PDF de registros de asignaciones de insumos medicos a empleados (${reportTodayOrMonth}):`, err);
      }
    }); 
  }
      /**
       * Genera y descarga el PDF del reporte de asignaciones de medicamentos,uniformes,odontologico a empleados o a los familiares de empleados (mes)
       */
      pdfStockAssignmentsBySupplyType_Month(supplyType:number): void {

        if (this.isGeneratingPdf) {
          return;
        }

        this.isGeneratingPdf = true;
        
        // Mostrar indicador de carga
        const loadingToast = this.snackBar.open('Generando PDF...', '', {
          duration: undefined,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        
        this.dashboardService.pdfStockAssignmentsBySupplyType_Month(supplyType).subscribe({
          next: () => {
            // Cerrar el indicador de carga
            loadingToast.dismiss();
            this.isGeneratingPdf = false;
            
            // Mostrar mensaje de éxito
            this.snackBar.open('PDF generado correctamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          },
          error: (err) => {
            // Cerrar el indicador de carga
            loadingToast.dismiss();
            this.isGeneratingPdf = false;
            
            // Mostrar mensaje de error
            this.snackBar.open(`Error al generar el PDF de registros de asignaciones de insumos medicos(${supplyType}) a empleados: ${err.message || 'Error desconocido'}`, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            
            console.error(`Error al generar el PDF de registros de asignaciones de insumos medicos(${supplyType}) a empleados:`, err);
          }
        }); 
      }


  /**
   * Genera y descarga el PDF del reporte de  insumos medicos disponibles
   */
  pdfMedicalSuppliesAvailables(supplyType:number): void {

    if (this.isGeneratingPdf) {
      return;
    }
    console.log(`generar pdf de insumos medicos disponibles`)

    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    this.dashboardService.pdfMedicalSuppliesAvailables(supplyType).subscribe({
      next: () => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open('PDF generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        
        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar el PDF de insumos medicos disponibles : ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error(`Error al generar el PDF de insumos medicos disponibles:`, err);
      }
    }); 
  }

}