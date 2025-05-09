import { Component, inject } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { SwalService} from '../services/swal.service';
import { UserCreateComponent } from '../user-create/user-create.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IGetAllUsers } from '../users/interfaces/users.interface';
import { LogsService } from './services/logs.service';
import { IGetAllLogs, ILog, ILogPagination } from './interfaces/logs.interface';
import { DateFormatService } from '../services/date-format.service';
/**
* @title pagination table logs
*/
@Component({
selector: 'app-logs',
templateUrl: './logs.component.html',
styleUrl: './logs.component.scss',
imports: [ CommonModule, FeatherIconsModule, MaterialModule, MatIconModule, HeaderTitleComponent, ReactiveFormsModule ],
})
export class LogsComponent {

  displayedColumns = ['user_name','product','action','ipAddress','hostname','createdAt'];

  // dataSource: any = new MatTableDataSource<IUser>();
  dataSource: any = new MatTableDataSource<any>();
  searhField = new FormControl(); searhDate = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;

  private swalService = inject(SwalService);
  private logsService = inject(LogsService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private dateFormatService= inject(DateFormatService);
  
  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'user_name', 'product', 'action', 'ipAddress', 'hostname']
    : [ 'user_name', 'product', 'action', 'ipAddress', 'hostname','createdAt'];
    });
    
    this.dataSource['length'] = 0;
    this.getAllLogs(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  get searchValue() {
    return this.searhField.value;
  }
  get searchDateValue() {
    return this.searhDate.value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAllLogs(page: number, take: number) {
    const parms: IGetAllLogs = {
      page: page + 1, //page del paginador inicia en 0
      take: take,
      name_user: this.searchValue ? this.searchValue.trim() : null,
      createdAt: this.searchDateValue ? this.searchDateValue : null
    };
    this.logsService.getAll(parms).subscribe((data: ILogPagination) => {
      data.list.forEach((ele:any) => {
        ele.createdAt = this.dateFormatService.convertUtcToVenezuelaWithMoment( new Date( ele.createdAt ) );
      })

      this.dataSource = new MatTableDataSource<ILog>(data.list);
        this.dataSource.length = data.total;
      });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllLogs(event.pageIndex, event.pageSize);
  }
}