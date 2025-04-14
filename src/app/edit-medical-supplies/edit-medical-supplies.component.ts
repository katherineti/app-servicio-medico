import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { IProduct } from '../medical-supplies/medical-supples.interface';

@Component({
  selector: 'app-edit-medical-supplies',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-medical-supplies.component.html',
  styleUrl: './edit-medical-supplies.component.scss'
})

export class EditMedicalSuppliesComponent {
  readonly dialogRef = inject(MatDialogRef<EditMedicalSuppliesComponent>);
  editProdFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;
  selectedProduct!: IProduct;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
      @Inject(MAT_DIALOG_DATA) 
      public data: IProduct
    ){
    this.buildForm();
  }

  async ngOnInit() {

    this.selectedProduct = this.data;
    console.log("this.data", this.selectedProduct )

    console.log(this.selectedProduct)
    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined) {
      return true;
    }
    console.log("falta id")
    return false;
  }

  buildForm() {
    this.editProdFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      category: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      type: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      stock: [
        0,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(3),
          Validators.max(100)
        ],
      ],
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      expiration_date: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      status: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
    });

  }

  setForm() {
    this.editProdFormGroup.controls['code'].disable();

    this.editProdFormGroup.patchValue({
      id: this.selectedProduct?.id,
      name: this.selectedProduct?.name,
      description: this.selectedProduct?.description,
      category: this.selectedProduct?.category,
      type: this.selectedProduct?.type,
      stock: this.selectedProduct?.stock,
      code: this.selectedProduct?.code,
      date_entry: this.selectedProduct?.date_entry,
      expiration_date: this.selectedProduct?.expiration_date,
      imagePath:this.selectedProduct?.imagePath,
      status:this.selectedProduct?.status,
      });
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

  save(){
    if (this.checkPropId) {
      return this.updateProduct();
    }
  }

  private updateProduct() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.editProdFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { ...params } = this.editProdFormGroup.value;
    const id = this.selectedProduct.id;

    let obj : IProduct= {
      id,
      ...params,
      urlImage: this.imgBase64,
    }
    console.log("guardar",obj);

    this.swalService.closeload();
    this.swalService.success();
    this.disableButton = false;
    this.closeDialog();
  }

}