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

  async ngOnInit() {
    this.role = await this.authService.getRol()

    if (this.role === "admin" || this.role === "auditor") {
      this.totalUsers()
      this.totalProductsOfTheDay()
      this.totalProductsOfMonth()
    }
    if (this.role === "admin" || this.role === "almacen" || this.role === "auditor") {
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
    if (this.role === "admin" || this.role === "almacen") {
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

  // Función para descargar el PDF
  private downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Función para limpiar el nombre del archivo
  private sanitizeFileName(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // Métodos existentes del dashboard...
  async totalUsers() {
    try {
      const users: { count: number } = await firstValueFrom(this.dashboardService.totalUsers())
      this.countUsers = users.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de usuarios", e)
    }
  }

  async totalProductsOfTheDay() {
    try {
      const totalProductsOfTheDay: { count: number } = await firstValueFrom(
        this.dashboardService.totalProductsOfTheDay(),
      )
      this.countProductsOfTheDay = totalProductsOfTheDay.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos del día", e)
    }
  }

  async totalProductsOfMonth() {
    try {
      const totalProductsOfMonth: { count: number } = await firstValueFrom(this.dashboardService.totalProductsOfMonth())
      this.countProductsOfMonth = totalProductsOfMonth.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos del mes", e)
    }
  }

  async totalAssignmentOfTheDay() {
    try {
      const totalAssignmentOfTheDay: { count: number } = await firstValueFrom(
        this.dashboardService.totalAssignmentOfTheDay(),
      )
      this.countAssignmentOfTheDay = totalAssignmentOfTheDay.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones del día", e)
    }
  }

  async totalAssignmentOfMonth() {
    try {
      const totalAssignmentOfMonth: { count: number } = await firstValueFrom(
        this.dashboardService.totalAssignmentOfMonth(),
      )
      this.countAssignmentOfMonth = totalAssignmentOfMonth.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones del mes", e)
    }
  }

  async totalAllProducts() {
    try {
      const totalAllProducts: { count: number } = await firstValueFrom(this.dashboardService.totalAllProducts())
      this.countAllProducts = totalAllProducts.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de productos", e)
    }
  }

  async totalAllAssignments() {
    try {
      const totalAllAssignment: { count: number } = await firstValueFrom(this.dashboardService.totalAllAssignments())
      this.countAllAssignments = totalAllAssignment.count
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener la cantidad de asignaciones", e)
    }
  }

  async totalAvailableProductsByType() {
    try {
      const totalAvailableProductsByType: any = await firstValueFrom(
        this.dashboardService.totalAvailableProductsByType(),
      )
      console.log(totalAvailableProductsByType)
      this.getAccumulatedProductsStockByType = totalAvailableProductsByType
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de productos disponibles por tipo de producto", e)
    }
  }

  async totalOfProductAssignmentsByType() {
    try {
      const totalOfProductAssignmentsByType: any = await firstValueFrom(
        this.dashboardService.totalOfProductAssignmentsByType(),
      )
      console.log(totalOfProductAssignmentsByType)
      this.getAccumulatedAssignmentsByType = totalOfProductAssignmentsByType
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de asignaciones por tipo de producto", e)
    }
  }

  async expiredProductsCount() {
    try {
      const expiredProductsCount: any = await firstValueFrom(this.dashboardService.expiredProductsCount())
      console.log("expiredProductsCount", expiredProductsCount)
      this.getExpiredProductsCount = expiredProductsCount
    } catch (e: any) {
      toast.error(e.error.message)
      console.error("Error al obtener el número de productos proximos a vencerse o caducados", e)
    }
  }

  getLocalDate(): Date {
    return new Date()
  }

  formatearFecha(fecha: Date, mes: string | null = null): string {
    const dia = fecha.getDate()
    const mesCompleto = new Intl.DateTimeFormat("es", { month: "long" }).format(fecha)
    const mesInicialMayuscula = mesCompleto.charAt(0).toUpperCase() + mesCompleto.slice(1)
    const año = fecha.getFullYear()
    if (mes) return `${mesInicialMayuscula} de ${año}`
    return `${dia} de ${mesInicialMayuscula} de ${año}`
  }

  /**1
   * Genera y descarga el PDF del reporte de usuarios
   * @param element Reporte para el que se generará el PDF
   */
  // generatePdf(element: IReport): void {
  generatePdf(): void {
     let element! : any;
     //  let element: IReport = {};

     element = {
      additionalAuditorIds: [16, 13],
      auditor: "a mi nombre",
      auditorId: 4,
      code: "O475a7e9aa-b126-4f83-a1ac-c9b7dee7d8b6.4.2025",
      conclusions: "d",
      detailed_methodology: "d",
      endDate: new Date("2025-06-08 19:38:39 -0400"),
      findings: "d",
      id: 4,
      idDuplicate: null,
      images: ['/uploads/reports/Id 4/report-1749425919381-345499483-1-mandala.jpg', '/uploads/reports/Id 4/report-1749425919387-325340306-mandala.png', '/uploads/reports/Id 4/report-1749425919387-6672292…2622768_854260286819999_6447723401831025285_n.jpg', '/uploads/reports/Id 4/report-1749425919399-8837722…-tecnologia-impulsa-el-desarrollo-y-viceversa.jpg', '/uploads/reports/Id 4/report-1749425919401-2020545…5715485_296208562543640_9157808412213043412_n.jpg', '/uploads/reports/Id 4/report-1749425919402-974399550-5f361ce5cc3c107c008029e631e05c36.jpg', '/uploads/reports/Id 4/report-1749425919402-4663315…953190_1128356091619115_7251787043438431084_n.jpg', '/uploads/reports/Id 4/report-1749425919403-226057615-frases-viajeras-15.jpg', '/uploads/reports/Id 4/report-1749425919404-7771959…ras-frases-de-montana-que-celebran-la-amistad.jpg', '/uploads/reports/Id 4/report-1749425919405-185077049-frases-cortas.jpg'],
      introduction: "d",
      receiver: "d",
      startDate: new Date("2025-06-08 19:38:04 -0400"),
      // status: "Finalizado",
      statusId: 1,
      summary_conclusionAndObservation: "d",
      summary_methodology: "d",
      summary_objective: "d",
      summary_scope: "d",
      title: "D",
      }

    if (!element.id || this.isGeneratingPdf) {
      return;
    }
    console.log("generar pdf")

    
    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    // this.dashboardService.generateReportPdf(element.id, element).subscribe({
    // this.dashboardService.generateDashboardReport(element.id, element).subscribe({
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
   * Genera y descarga el PDF del reporte de usuarios
   * 
   */
  // generatePdf(element: IReport): void {
  generatePdfMedicalSupplies_Today(): void {

    if ( this.isGeneratingPdf) {
      return;
    }
    console.log("generar pdf de registros de insumos medicos (hoy)")

    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    // this.dashboardService.generateReportPdf(element.id, element).subscribe({
    // this.dashboardService.generateDashboardReport(element.id, element).subscribe({
    this.dashboardService.pdfMedicalSupplies_Today().subscribe({
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
        this.snackBar.open(`Error al generar el PDF de registros de insumos medicos (hoy): ${err.message || 'Error desconocido'}`, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error('Error al generar el PDF de registros de insumos medicos (hoy):', err);
      }
    }); 
  }

}