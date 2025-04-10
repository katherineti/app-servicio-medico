import { Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RolDialogComponent } from '../rol-dialog/rol-dialog.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';

export interface Element {
  id: number;
  username?:string, 
  rol:string,
}

const ROL_DATA: Element[] = [
  {
    id: 1,
    rol: 'Administrador' 
  },
  {
    id: 2,
    rol: 'Almacen' 
  },
  {
    id: 3,
    rol: 'Medico' 
  },
  {
    id: 4,
    rol: 'Auditor' 
  },
];

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
    HeaderTitleComponent
  ]
})

export class RolComponent {

  displayedColumns = [ '#', 'rol', 'action'];
  dataSource = new MatTableDataSource<Element>(ROL_DATA);

  private swalService = inject(SwalService);
    
  constructor(breakpointObserver: BreakpointObserver, public dialog: MatDialog) {
    breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ '#', 'rol', 'action']
    : [ '#', 'rol', 'action'];
    });
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
  Object.create(null);
  /**
  * Set the paginator after the view init since this component will
  * be able to query its view for the initialized paginator.
  */
  ngAfterViewInit(): void {
   this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogEditRol(data?: any): void {
    const ref = this.dialog.open(RolDialogComponent, {
      data: data || null,
      disableClose: true
    });

  }

  async deleterol(){
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm('eliminar un rol');

    if (deleteAlert.isConfirmed) {
      this.swalService.success();
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel */
    }
  }
}