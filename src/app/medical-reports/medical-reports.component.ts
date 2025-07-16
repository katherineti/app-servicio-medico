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
  // displayedColumns = [ 'name','rol','email','isActive','action'];
  displayedColumns = [ 'doctorName','patientName','apsCenter','insurance','createdAt'];
  dataSource: any = new MatTableDataSource<IUser>();
  searhMedico = new FormControl();
  searhPatient = new FormControl();
  searhDate = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;

  private swalService = inject(SwalService);
  private medicalReportsService = inject(MedicalReportsService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'doctorName', 'patientName','apsCenter','insurance', 'createdAt']
    : [ 'doctorName', 'patientName','apsCenter','insurance', 'createdAt'];
    });

    this.dataSource['length'] = 0;
    this.getAllMedicalReport(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  async ngOnInit(){
    this.role = await this.authService.getRol();
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
}