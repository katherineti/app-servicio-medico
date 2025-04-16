import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MaterialModule } from '../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { IProduct } from '../medical-supplies/medical-supples.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SwalService } from '../services/swal.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatPaginator } from '@angular/material/paginator';
import { AssignProductWorkerComponent } from '../assign-product-worker/assign-product-worker.component';
import { RouterModule } from '@angular/router';
import { EditMedicalSuppliesComponent } from '../edit-medical-supplies/edit-medical-supplies.component';
import { CreateMedicalSuppliesComponent } from '../create-medical-supplies/create-medical-supplies.component';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-medical-supplies-datatable',
  templateUrl: './medical-supplies-datatable.component.html',
  styleUrl: './medical-supplies-datatable.component.scss',
  imports: [
    CommonModule,
    FeatherIconsModule,
    MaterialModule,
    RouterModule
    // NgOptimizedImage,
  ],
})

export class MedicalSuppliesDatatableComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns = ['name', 'stock', 'code','expiration_date','action'];
  // dataSource = new MatTableDataSource<IProduct>(PRODUCT_DATA);
  dataSource = new MatTableDataSource<IProduct>([]);
  @Input()
  data!: IProduct[];
  
  private swalService = inject(SwalService);
    
  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'name', 'stock', 'code','expiration_date','action']
    : [ 'name', 'category', 'stock', 'code', 'date_entry','expiration_date','image','action','status'];
    });
  }

  async ngOnInit() {
    if(this.data){
      const PRODUCT_DATA = this.data;
      this.dataSource = new MatTableDataSource<IProduct>(PRODUCT_DATA);
    }
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