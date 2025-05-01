import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RolDialogComponent } from '../rol-dialog/rol-dialog.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { CreateRoleComponent } from '../create-role/create-role.component';
import { IGetAllRoles, IRolePagination, IRole } from './interfaces/roles.interface';
import { RolesService } from './services/roles.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
/**
* @title pagination table roles
*/
@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.scss',
  imports: [
    CommonModule,
    FeatherIconsModule,
    MaterialModule,
    MatIconModule,
    HeaderTitleComponent,
    ReactiveFormsModule
  ]
})

export class RolComponent {

  displayedColumns = [ '#', 'rol', 'isActivate', 'action'];

  dataSource: any = new MatTableDataSource<IRole>();
  searhField = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;

  private swalService = inject(SwalService);
  private rolesService = inject(RolesService);
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
    
  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ '#', 'rol', 'action']
    : [ '#', 'rol', 'isActivate', 'action'];
    });

    this.dataSource['length'] = 0;
    this.getAll(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
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
    const ref = this.dialog.open(RolDialogComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAll(this.pageIndex, this.pageSize);
    });
  }
  openDialogEditRol(data?: any): void {
    data.actionEdit=true;
    const ref = this.dialog.open(RolDialogComponent, {
      data: data || null,
      disableClose: true
    });
    console.log("Roles: data enviada desde la tabla: " , data)

    ref.afterClosed().subscribe(() => {
      this.getAll(this.pageIndex, this.pageSize);
    });
  }

  openDialogCreateRol(data?: any): void {
    const ref = this.dialog.open(CreateRoleComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAll(this.pageIndex, this.pageSize);
    });
  }

  async deleteRol(data: any) {
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm(
      'eliminar registro'
    );
    if (deleteAlert.isConfirmed) {
      this.rolesService.delete(data.id).subscribe((element) => {
        if (element) {
          this.getAll(this.pageIndex, this.pageSize);
          this.swalService.success();
        } else {
          this.swalService.error('Error', 'Error al eliminar rol.');
        }
      });
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel */
    }
  }

  getAll(page: number, take: number) {
    const parms: IGetAllRoles = {
      page: page + 1,
      take: take,
      name: this.searchValue ? this.searchValue.trim() : null,
    };
    this.rolesService.getAll(parms).subscribe((data: IRolePagination) => {
      this.dataSource = new MatTableDataSource<IRole>(data.list);
      this.dataSource.length = data.total;
    });
  }

  handlePageEvent(event: PageEvent) {
    this.getAll(event.pageIndex, event.pageSize);
  }
}