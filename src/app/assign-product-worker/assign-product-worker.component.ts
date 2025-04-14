import { Component, Inject, inject, OnInit, model } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

export interface IAssignProduct {
  id: string;
  name: string;
  employee: string;
  family: string;
  type: string;
  observation: string;
  urlImage?: string;
  checked_addFamily?: boolean;
}

export interface employee {
  name: string;
}

@Component({
  selector: 'app-assign-product-worker',
  templateUrl: './assign-product-worker.component.html',
  styleUrl: './assign-product-worker.component.scss',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
})

export class AssignProductWorkerComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AssignProductWorkerComponent>);
  AssignProductForm!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selectedProduct!: IAssignProduct; //cambiar interfaz a la de producto
  disableButton: boolean = false;

    //autocomplete
    myControl = new FormControl<string | employee>('');
    options: employee[] = [{name: 'Mary'}, {name: 'Shelley'}, {name: 'Igor'},{name: 'Mery'},{name: 'Igasa'},{name: 'Aapo'}];
    filteredOptions!: Observable<employee[]>;
    readonly checked_addFamily = model(false);

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IAssignProduct){
    this.buildEditUserForm();
  }

  async ngOnInit() {
    console.log("myControl" , this.myControl)
    console.log("form group AssignProductForm" , this.AssignProductForm)

    this.selectedProduct = this.data; 
    console.log("this.selectedProduct " , this.selectedProduct)
    if (this.data) {
      this.setForm();
    }

    //autocomplete
    this.filteredOptions = this.controlEmployee.valueChanges.pipe(
    // this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );
  }

  get checkPropId() {
    if (this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined) {
      return true;
    }
    console.log("falta id")
    return false;
  }

  get controlEmployee() {
    return this.AssignProductForm.controls['employee'];
  }

  buildEditUserForm() {
    this.AssignProductForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      quantity: [
        0,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(1),
          Validators.max(3)
        ],
      ],
      employee: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      family: [
        '',
        [
          Validators.minLength(1),
          Validators.maxLength(50),
        ]
      ],
      type: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      observation: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      checked_addFamily:[false]
    });

  }

  setForm() {
    this.AssignProductForm.controls['name'].disable();

      this.AssignProductForm.patchValue({
        name: this.selectedProduct?.name,
      });
      console.log(  this.AssignProductForm.controls['checked_addFamily'].value )
  }

  onFileSelected(event: any): void | null {
    const reader = new FileReader();
    this.imageField = <File>event.target.files[0];
    reader.readAsDataURL(this.imageField);
    reader.onload = () => {
      this.imgBase64 = reader.result;
      return reader.result;
    };
  }
  getBase64(data: any) {
    this.imgBase64 = data;
  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save() {
    if (this.checkPropId) {
      return this.assignProductToEmployee();
    }
  }

  private assignProductToEmployee() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.AssignProductForm.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { employee, ...params } = this.AssignProductForm.value;
    const productId = this.selectedProduct.id;

    let obj= { //sin id porque es un registro nuevo
      productId,
      ...params,
      employee: employee.name,
      urlImage: this.imgBase64,
    };
    delete obj.checked_addFamily;

    console.log("guardar", obj);

    this.swalService.closeload();
    this.swalService.success();
    this.disableButton = false;
    this.closeDialog();
  }

  //autocomplete
  displayFn(employee: employee): string {
    return employee && employee.name ? employee.name : '';
  }

  private _filter(name: string): employee[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}