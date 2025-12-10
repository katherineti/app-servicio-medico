import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FeatherIconsModule } from '../../feathericons/feathericons.module';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { EditMedicalSuppliesComponent } from '../components/edit-medical-supplies/edit-medical-supplies.component';
import { CreateMedicalSuppliesComponent } from '../components/create-medical-supplies/create-medical-supplies.component';
import { IProductPagination } from '../interfaces/medical-supplies.interface';
import { Category, MedicalSuppliesService } from '../services/medical-supplies.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { API_URL } from '../../../../environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { AssignmentComponent } from '../../assignment/assignment.component';
import { AuthService } from '../../services/auth.service';
import { DateFormatService, MY_DATE_FORMATS } from '../../services/date-format.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { HeaderTitleComponent } from '../../header-title/header-title.component';
import { MedicalSuppliesExpiredService } from '../services/medical-supplies-expired.service';
import { IGetAllProductsExpired, IProductExpired, IProductExpiredPagination } from '../interfaces/medical-supplies-expired.interface';

@Component({
  selector: 'app-medical-supplies-expired',
  templateUrl: './medical-supplies-expired.component.html',
  styleUrl: './medical-supplies-expired.component.scss',
  imports: [
    CommonModule,
    MaterialModule,
    HeaderTitleComponent,
    FeatherIconsModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [ 
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-VE' },
  ],
})

export class MedicalSuppliesExpiredComponent {
  role:string='';
  displayedColumns = ['name', 'stock', 'code','action'];
  dataSource: any = new MatTableDataSource<IProductExpired>();
  searhField = new FormControl();  searhCategoryField = new FormControl();  searh_expirationDate = new FormControl();
  pageSize: number = 5;
  pageIndex = 0;
  categories: any;   loadingCategorie = signal(false);
  API_URL= API_URL;
  readonly dialog = inject(MatDialog);
  private medicalSuppliesService = inject(MedicalSuppliesService);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private dateFormatService= inject(DateFormatService);
  private medicalSuppliesExpiredService = inject(MedicalSuppliesExpiredService);

  constructor() {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
      this.displayedColumns = result.matches
        ? [ 'name','action']
        : [ 'name', 'provider', 'category', 'stock', 'code', 'date_entry','expirationDate','image','status','action'];

      if ( this.role === 'almacen movil') {
        this.displayedColumns = result.matches
          ? [ 'name','action']
          : [ 'name', 'category', 'stock', 'code', 'date_entry','expirationDate','image','status','action'];
      };
    });

    this.loadingCategorie.set(true);
    this.categories = toSignal(
       this.medicalSuppliesService.getCategories().pipe( tap(() => this.loadingCategorie.set(false)) ), { initialValue: [] as Category[] },
     );
  }

  async ngOnInit() {
    this.role = await this.authService.getRol();
    this.dataSource['length'] = 0;
    this.getAllProducts(this.pageIndex, this.pageSize);
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }

  get searchValue() {
    return this.searhField.value;
  }
  get searchCategoryValue() {
    return this.searhCategoryField.value;
  }
  get searchExpirationDateValue() {
    return this.searh_expirationDate.value;
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
    const parms: IGetAllProductsExpired = {
      page: page + 1,
      take: take,
      name: this.searchValue ? this.searchValue.trim() : null,
      category: this.searchCategoryValue ? this.searchCategoryValue.trim() : null,
      expirationDate: this.searchExpirationDateValue ? this.searchExpirationDateValue : null,
    };
    this.medicalSuppliesExpiredService.getProducts(parms).subscribe((data: IProductExpiredPagination) => {
      console.log("data.list " , data)
      data.list.forEach((ele:any) => {
        ele.createdAt = this.dateFormatService.convertUtcToVenezuelaWithMoment( new Date( ele.createdAt ) );
        ele.updatedAt = this.dateFormatService.convertUtcToVenezuelaWithMoment( new Date( ele.updatedAt ) );
      }); 
      this.dataSource = new MatTableDataSource<IProductExpired>(data.list);
      this.dataSource.length = data.total;
    });
  }

  isSticky(buttonToggleGroup: MatButtonToggleGroup, id: string) {
      return (buttonToggleGroup.value || []).indexOf(id) !== -1;
  }
}