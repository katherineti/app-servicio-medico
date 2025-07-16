import { Component, inject } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MedicalReportsDialogComponent } from './components/medical-reports-dialog/medical-reports-dialog.component';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { MedicalReportsCreateComponent } from './components/medical-reports-create/medical-reports-create.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MedicalReportsService } from './services/medical-reports.service';
import { IGetAllMedicalreports, IUser, IMedicalReportPagination, IMedicalReports } from './interfaces/medical-reports.interface';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
* @title pagination table medical reports
*/
@Component({
selector: 'app-medical-reports',
templateUrl: './medical-reports.component.html',
styleUrl: './medical-reports.component.scss',
imports: [
  CommonModule,
  FeatherIconsModule,
  MaterialModule,
  MatIconModule,
  HeaderTitleComponent,
  ReactiveFormsModule 
],
providers:[MedicalReportsService]
})
export class MedicalReportsComponent {
  role:string='';
  displayedColumns = [ 'doctorName','patientName','apsCenter','insurance','createdAt','action'];
  dataSource: any = new MatTableDataSource<IUser>();
  searhMedico = new FormControl();
  searhPatient = new FormControl();
  searhDate = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;
  isGeneratingPdf = false;

  private swalService = inject(SwalService);
  private medicalReportsService = inject(MedicalReportsService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router)
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'doctorName', 'patientName','apsCenter','insurance', 'createdAt','action']
    : [ 'doctorName', 'patientName','apsCenter','insurance', 'createdAt','action'];
    });

    this.dataSource['length'] = 0;
    this.getAllMedicalReport(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  async ngOnInit(){
    this.role = await this.authService.getRol();
  }

  /**
   * Navega a la página de creación de informes médicos.
   */
  navigateToAddReport(): void {
    this.router.navigate(["/create-medical-reports"])
  }

  get SearhMedico() {
    return this.searhMedico.value;
  }

  get SearchPatient() {
    return this.searhPatient.value;
  }

  get SearhDate() {
    return this.searhDate.value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogSee(data?: any): void {
    data.actionEdit=false;
    const ref = this.dialog.open(MedicalReportsDialogComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalReport(this.pageIndex, this.pageSize);
    });
  }
  openDialogCreateMedicalPrescription(data?: any): void {
    console.log("seleccionado",data)
    data.actionEdit=false;
    const ref = this.dialog.open(MedicalReportsDialogComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalReport(this.pageIndex, this.pageSize);
    });
  }

   /**
   * Navega a la página de creación de recetas médicas, pasando el ID del informe.
   * @param medicalReport El informe médico para el cual se creará la receta.
   */
  navigateToCreateMedicalPrescription(medicalReport: IMedicalReports): void {
    this.router.navigate(["/medical-prescriptions/create", medicalReport.id])
  }

/*   openEditMedicalReport(data?: any): void {
    data.actionEdit=true;
    const ref = this.dialog.open(MedicalReportsDialogComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalReport(this.pageIndex, this.pageSize);
    });
  } */

  openDialogCreate(data?: any): void {
    const ref = this.dialog.open(MedicalReportsCreateComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalReport(this.pageIndex, this.pageSize);
    });
  }

/*   async deleteMedicalReport(data: any) {
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm(
      'eliminar registro'
    );
    if (deleteAlert.isConfirmed) {
      this.medicalReportsService.deleteUser(data.id).subscribe((element) => {
        if (element) {
          this.getAllMedicalReport(this.pageIndex, this.pageSize);
          this.swalService.success();
        } else {
          this.swalService.error('Error', 'Error al eliminar usuario.');
        }
      });
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel * /
    }
  } */

  getAllMedicalReport(page: number, take: number) {
    const parms: IGetAllMedicalreports = {
      page: page + 1, //page del paginador inicia en 0
      take: take,
      doctorCedula: this.SearhMedico ? this.SearhMedico.trim() : null,
      patientCedula: this.SearchPatient ? this.SearchPatient.trim() : null,
      createdAt: this.SearhDate ? this.SearhDate.trim() : null,
    };
    this.medicalReportsService.getAll(parms).subscribe((data: IMedicalReportPagination) => {
      // this.dataSource = new MatTableDataSource<IUser>(data.list);
      this.dataSource = new MatTableDataSource<IMedicalReports>(data.list);
      this.dataSource.length = data.total;
    });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllMedicalReport(event.pageIndex, event.pageSize);
  }

  // PDF
  generatePdf(element:any): void {
    //  let element! : any;
     //  let element: IReport = {};

/*      element = {
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
      } */

    if (!element.id || this.isGeneratingPdf) {
      return;
    }
    
    this.isGeneratingPdf = true;
    
    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    // this.dashboardService.generateReportPdf(element.id, element).subscribe({
    // this.dashboardService.generateDashboardReport(element.id, element).subscribe({
    this.medicalReportsService.generatePDFMedicalReport(element.id).subscribe({
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
}