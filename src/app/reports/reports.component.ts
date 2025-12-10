import { Component, inject } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { IUser } from '../users/interfaces/users.interface';
import { ReportsService } from './services/reports.service';
import { IGetAllReports, IReport, IReportPagination } from './interfaces/reports.interface';
import { DateFormatService, MY_DATE_FORMATS } from '../services/date-format.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { SwalService } from '../services/swal.service';
import { EditReportComponent } from './components/edit-report/edit-report.component';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  imports: [
    CommonModule,
    FeatherIconsModule,
    MaterialModule,
    MatIconModule,
    HeaderTitleComponent,
    ReactiveFormsModule,
  ],
  providers: [ 
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-VE' },
  ],
})
export class ReportsComponent {
  role:string='';
  displayedColumns = ['id', 'title','startDate','endDate','status','duplicated','action'];
  dataSource: any = new MatTableDataSource<IUser>();
  searhFieldReceiver = new FormControl(); 
  searhField_EndDate = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;
  isGeneratingPdf = false;

  private reportsService = inject(ReportsService);
  private dateFormatService= inject(DateFormatService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private swalService = inject(SwalService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? ['id', 'title', 'startDate', 'endDate', 'status', 'duplicated', 'action']
    : ['id', 'title', 'startDate', 'endDate', 'status', 'duplicated', 'action'];
    });
    
    this.dataSource['length'] = 0;
    this.getAllReports(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  async ngOnInit(){
    this.role = await this.authService.getRol();
  }

  get searchReceiver() {
    return this.searhFieldReceiver.value;
  }
  get searchEndDate() {
    return this.searhField_EndDate.value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogSee(data?: any): void {
    data.actionEdit=false;
    const ref = this.dialog.open(EditReportComponent, {
      data: data || null,
    });

    ref.afterClosed().subscribe(() => {
      this.getAllReports(this.pageIndex, this.pageSize);
    });
  }

  openDialogEdit(data?: any): void {
    data.actionEdit=true;
    const ref = this.dialog.open(EditReportComponent, {
      data: data || null,
      disableClose: false
    });

    ref.afterClosed().subscribe(() => {
      this.getAllReports(this.pageIndex, this.pageSize);
    });
  }
  async deleteReport(data: any) {
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm(
      'eliminar registro'
    );
    if (deleteAlert.isConfirmed) {
      this.reportsService.deleteReport(data.id).subscribe((element) => {
        if (element) {
          this.getAllReports(this.pageIndex, this.pageSize);
          this.swalService.success();
        } else {
          this.swalService.error('Error', 'Error al eliminar el reporte.');
        }
      });
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
    }
  } 

  getAllReports(page: number, take: number) {
    const parms: IGetAllReports = {
      page: page + 1,
      take: take,
      receiver: this.searchReceiver ? this.searchReceiver.trim() : null,
      endDate: this.searchEndDate ? this.searchEndDate : null,
    };

    this.reportsService.getAll(parms).subscribe((data: IReportPagination) => {console.log(data)
      data.list.forEach((ele:any) => {
        if(ele.endDate ){
          ele.endDate = this.dateFormatService.convertUtcToVenezuelaWithMoment( new Date( ele.endDate ) );
        }
        if(ele.startDate ){
          ele.startDate = this.dateFormatService.convertUtcToVenezuelaWithMoment( new Date( ele.startDate ) );
        }
      }); 
      this.dataSource = new MatTableDataSource<IReport>(data.list);
      this.dataSource.length = data.total;
    });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllReports(event.pageIndex, event.pageSize);
  }
  generatePdf(element: IReport): void {console.group("element" , element)
    if (!element.id || this.isGeneratingPdf) {
      return;
    }
    
    this.isGeneratingPdf = true;
    
    const loadingToast = this.snackBar.open('Generando PDF...', '', {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
    
    this.reportsService.generateReportPdf(element.id, element).subscribe({
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
  duplicate_auditReport(id: number){
    this.reportsService.duplicate(id).subscribe({
        error: (error) => {
          console.log("Error ", error)
          if(error){
            this.swalService.closeload();
            this.swalService.error('Error', error);
          }else{
            this.swalService.error('Error', 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
          }
        },
        complete: () => {
          this.swalService.closeload();
          this.swalService.success();
          this.getAllReports(this.pageIndex, this.pageSize);
        },
      });
    
  }
}