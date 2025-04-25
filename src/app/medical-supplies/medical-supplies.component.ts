import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { CreateMedicalSuppliesComponent } from '../create-medical-supplies/create-medical-supplies.component';
import { AssignProductWorkerComponent } from '../assign-product-worker/assign-product-worker.component';
import { MedicalSuppliesDatatableComponent } from '../medical-supplies-datatable/medical-supplies-datatable.component';
import { EditMedicalSuppliesComponent } from '../edit-medical-supplies/edit-medical-supplies.component';
import { IGetAllProducts, IProduct, IProductPagination } from './medical-supplies.interface';
import { MedicalSuppliesService } from './medical-supplies.service';
import { FormControl } from '@angular/forms';

// const PRODUCT_DATA: IProduct[] = [
//   {
//     id: 1,
//     name: 'Atamel',
//     description: 'Descripción del Atamel',
//     category: 'categoria1',
//     type: 'medicamentos', //'medicamentos','uniformes','equipos odontologicos'
//     stock: 5,
//     code: '000363',
//     date_entry: '2025-04-10',
//     expiration_date: '2025-07-10',
//     status: 'Activo',
//     imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
//   }
// ];

/**
* @title pagination table medical supplies
*/
@Component({
  selector: 'app-medical-supplies',
  imports: [
    CommonModule,
    FeatherIconsModule,
    MaterialModule,
    MatIconModule,
    HeaderTitleComponent,
    MedicalSuppliesDatatableComponent
  ],
  templateUrl: './medical-supplies.component.html',
  styleUrl: './medical-supplies.component.scss'
})
export class MedicalSuppliesComponent {

/*   PRODUCT_DATA: IProduct[] = [
    {
      id: 1,
      name: 'Atamel',
      description: 'Descripción del Atamel',
      categoryId: 1,
      type: 'medicamentos', //'medicamentos','uniformes','equipos odontologicos'
      stock: 5,
      code: '000363',
      // date_entry: '2025-04-10',
      createdAt: '2025-04-10',
      // expiration_date: '2025-07-10',
      statusId: 1,
      url_image: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 2,
      name: 'Ibuprofeno',
      description: 'Descripción del Ibuprofeno',
      categoryId: 1,
      type: 'medicamentos', //'medicamentos','uniformes','equipos odontologicos'
      stock: 0,
      code: '000111',
      // date_entry: '2025-04-10',
      createdAt: '2025-04-10',
      // expiration_date: '2025-07-10',
      statusId: 2,
      url_image: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ]; */

  // dataSource: any = new MatTableDataSource<IProduct>();
  searhField = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;
  
  readonly dialog = inject(MatDialog);
  displayedColumns = ['name', 'stock', 'code','expiration_date','action'];
  // dataSource = new MatTableDataSource<IProduct>(this.PRODUCT_DATA);

  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);
    
  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'name', 'stock', 'code','expiration_date','action']
    : [ 'name', 'category', 'stock', 'code', 'date_entry','expiration_date','image','action','status'];
    });
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
  Object.create(null);
  /**
  * Set the paginator after the view init since this component will
  * be able to query its view for the initialized paginator.
  */
  // ngAfterViewInit(): void {
  //  this.dataSource.paginator = this.paginator;
  // }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  openDialogEdit(data?: any): void {
    const ref = this.dialog.open(EditMedicalSuppliesComponent, {
      data: data || null,
      disableClose: true
    });

  }
  openDialogCreateSupplies(data?: any): void {
    const ref = this.dialog.open(CreateMedicalSuppliesComponent, {
      data: data || null,
      disableClose: true
    });
  }

  async deleteSupplies(){
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm('eliminar registro');

    if (deleteAlert.isConfirmed) {
      this.swalService.success();
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel */
    }
  }

  assignProductToWorker(data?: any): void {
    const ref = this.dialog.open(AssignProductWorkerComponent, {
      data: data || null,
      disableClose: true
    });
  }


}