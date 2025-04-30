import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MaterialModule } from '../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SwalService } from '../services/swal.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { EditMedicalSuppliesComponent } from '../edit-medical-supplies/edit-medical-supplies.component';
import { CreateMedicalSuppliesComponent } from '../create-medical-supplies/create-medical-supplies.component';
import { IGetAllProducts, IProduct, IProductPagination } from '../medical-supplies/interfaces/medical-supplies.interface';
import { Category, MedicalSuppliesService } from '../medical-supplies/services/medical-supplies.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { API_URL } from '../../../environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { AssignmentComponent } from '../assignment/assignment.component';

@Component({
  selector: 'app-medical-supplies-datatable',
  templateUrl: './medical-supplies-datatable.component.html',
  styleUrl: './medical-supplies-datatable.component.scss',
  imports: [
    CommonModule,
    FeatherIconsModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ],
})

export class MedicalSuppliesDatatableComponent {
  readonly dialog = inject(MatDialog);
  displayedColumns = ['name', 'stock', 'code','action'];
  @Input()
  data!: string;

  dataSource: any = new MatTableDataSource<IProduct>();
  searhField = new FormControl();  searhCategoryField = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;

  categories: any;   loadingCategorie = signal(false);
  API_URL= API_URL;
  
  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'name','action']
    : [ 'name', 'category', 'stock', 'code', 'date_entry','image','status','action'];
    });

    this.loadingCategorie.set(true);
    this.categories = toSignal(
       this.medicalSuppliesService.getCategories().pipe( tap(() => this.loadingCategorie.set(false)) ), { initialValue: [] as Category[] },
     );
  }

  async ngOnInit() {
 
    if(this.data=='allProducts'){
      this.dataSource['length'] = 0;
      this.getAllProducts(this.pageIndex, this.pageSize);
      this.paginatorIntl.itemsPerPageLabel = 'Registros por página';

    }else if(this.data=='expiredProducts'){

    }
  }

  get searchValue() {
    return this.searhField.value;
  }
  get searchCategoryValue() {
    return this.searhCategoryField.value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogSeeProduct(data?: any): void {
    data.actionEdit=false;
    const ref = this.dialog.open(EditMedicalSuppliesComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllProducts(this.pageIndex, this.pageSize);
    });
  }

  openDialogEditProduct(data?: any): void {
    data.actionEdit=true;
    const ref = this.dialog.open(EditMedicalSuppliesComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllProducts(this.pageIndex, this.pageSize);
    });
  }
  openDialogCreateSupplies(data?: any): void {
    const ref = this.dialog.open(CreateMedicalSuppliesComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllProducts(this.pageIndex, this.pageSize);
    });
  }

  assignProductToWorker(data?: any): void {
    const ref = this.dialog.open(AssignmentComponent, {
      data: data || null,
      disableClose: true
    });
    ref.afterClosed().subscribe(() => {
      this.getAllProducts(this.pageIndex, this.pageSize);
    });
  }

  handlePageEvent(event: PageEvent) {
    this.getAllProducts(event.pageIndex, event.pageSize);
  }

  getAllProducts(page: number, take: number) {
    const parms: IGetAllProducts = {
      page: page + 1,
      take: take,
      name: this.searchValue ? this.searchValue.trim() : null,
      category: this.searchCategoryValue ? this.searchCategoryValue.trim() : null,
    };
    this.medicalSuppliesService.getProducts(parms).subscribe((data: IProductPagination) => {
      console.log(data)
      this.dataSource = new MatTableDataSource<IProduct>(data.list);
      this.dataSource.length = data.total;
    });
  }
}