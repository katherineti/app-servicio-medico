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
import { MedicalReportsCreateComponent } from './components/medical-reports-create/medical-reports-create.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MedicalReportsService } from './services/medical-reports.service';
import { IGetAllMedicalreports, IUser, IMedicalReportPagination, IMedicalReports } from './interfaces/medical-reports.interface';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  navigateToCreateMedicalPrescription(medicalReport: IMedicalReports): void {
    console.log("informe medico seleccionado: ", medicalReport)
    this.router.navigate(["/medical-prescriptions/create", medicalReport.id])
  }
  navigateToListMedicalPrescription(medicalReport: IMedicalReports): void {
    console.log("informe medico seleccionado: ", medicalReport)
    this.router.navigate(["/medical-prescriptions", medicalReport.id]) 
  }
  openDialogCreate(data?: any): void {
    const ref = this.dialog.open(MedicalReportsCreateComponent, {
      data: data || null,
      disableClose: true
    });
    ref.afterClosed().subscribe(() => {
      this.getAllMedicalReport(this.pageIndex, this.pageSize);
    });
  }
  getAllMedicalReport(page: number, take: number) {
    const parms: IGetAllMedicalreports = {
      page: page + 1, 
      take: take,
      doctorCedula: this.SearhMedico ? this.SearhMedico.trim() : null,
      patientCedula: this.SearchPatient ? this.SearchPatient.trim() : null,
      createdAt: this.SearhDate ? this.SearhDate.trim() : null,
    };
    this.medicalReportsService.getAll(parms).subscribe((data: IMedicalReportPagination) => {console.log(data)
      this.dataSource = new MatTableDataSource<IMedicalReports>(data.list);
      this.dataSource.length = data.total;
    });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllMedicalReport(event.pageIndex, event.pageSize);
  }
  generatePdf(element:any): void {
    if (!element.id || this.isGeneratingPdf) {
      return;
    }
    this.isGeneratingPdf = true;
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    this.medicalReportsService.generatePDFMedicalReport(element.id).subscribe({
      next: () => {
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
        this.snackBar.open('PDF generado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        loadingToast.dismiss();
        this.isGeneratingPdf = false;
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