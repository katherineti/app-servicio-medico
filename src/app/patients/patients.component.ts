import { Component, inject } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PatientsDialogComponent } from './components/patients-dialog/patients-dialog.component';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { PatientsCreateComponent } from './components/patients-create/patients-create.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PatientsService } from './services/patients.service';
import { IGetAllPatients, IPatient, IPagination } from './interfaces/patients.interface';
import { AuthService } from '../services/auth.service';

/**
* @title pagination table patients
*/
@Component({
selector: 'app-patients',
templateUrl: './patients.component.html',
styleUrl: './patients.component.scss',
imports: [
  CommonModule,
  FeatherIconsModule,
  MaterialModule,
  MatIconModule,
  HeaderTitleComponent,
  ReactiveFormsModule 
],
providers:[PatientsService]
})
export class PatientsComponent {
  role:string='';
  // displayedColumns = [ 'name','rol','email','isActive','action'];
  displayedColumns = [ 'name', 'cedula', 'birthdate', 'age', 'gender', 'civilStatus','children', 'phone', 'email', 'isActive', 'createdAt' ];
  dataSource: any = new MatTableDataSource<IPatient>();
  searhField = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;

  private swalService = inject(SwalService);
  private patientsService = inject(PatientsService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'name', 'cedula', 'age', 'gender', 'phone', 'email', 'createdAt', 'action' ]
    : [ 'name', 'cedula', 'age', 'gender', 'phone', 'email', 'createdAt', 'action' ];
    });
    
    this.dataSource['length'] = 0;
    this.getAllPatients(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  async ngOnInit(){
    this.role = await this.authService.getRol();
  }

  get searchValue() {
    return this.searhField.value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogSee(data?: any): void {
    data.actionEdit=false;
    const ref = this.dialog.open(PatientsDialogComponent, {
      data: data || null,
      disableClose: false
    });

    ref.afterClosed().subscribe(() => {
      this.getAllPatients(this.pageIndex, this.pageSize);
    });
  }

  openDialogEdit(data?: any): void {
    data.actionEdit=true;
    const ref = this.dialog.open(PatientsDialogComponent, {
      data: data || null,
      disableClose: false
    });

    ref.afterClosed().subscribe(() => {
      this.getAllPatients(this.pageIndex, this.pageSize);
    });
  }

  openDialogCreate(data?: any): void {
    const ref = this.dialog.open(PatientsCreateComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllPatients(this.pageIndex, this.pageSize);
    });
  }

  async deletePatients(data: any) {
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm(
      'eliminar registro'
    );
/*     if (deleteAlert.isConfirmed) {
      this.patientsService.deleteUser(data.id).subscribe((element) => {
        if (element) {
          this.getAllPatients(this.pageIndex, this.pageSize);
          this.swalService.success();
        } else {
          this.swalService.error('Error', 'Error al eliminar el informe médico.');
        }
      });
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel * /
    } */
  }

  getAllPatients(page: number, take: number) {
    const parms: IGetAllPatients = {
      page: page + 1,
      take: take,
      patientCedula: this.searchValue ? this.searchValue.trim() : null,
    };
    this.patientsService.getAll(parms).subscribe((data: IPagination) => {
      this.dataSource = new MatTableDataSource<IPatient>(data.list);
      this.dataSource.length = data.total;
    });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllPatients(event.pageIndex, event.pageSize);
  }
}