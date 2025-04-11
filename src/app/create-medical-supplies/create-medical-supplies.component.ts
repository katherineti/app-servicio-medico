import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';

@Component({
  selector: 'app-create-medical-supplies',
  templateUrl: './create-medical-supplies.component.html',
  styleUrl: './create-medical-supplies.component.scss',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
})
export class CreateMedicalSuppliesComponent {
  createProdFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
    public dialogRef: MatDialogRef<CreateMedicalSuppliesComponent>,
    ){
    this.buildAddUserForm();
  }

  buildAddUserForm() {
    this.createProdFormGroup = this.formBuilder.group({
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
        null,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(100),
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

  saveUser() {
    if (this.createProdFormGroup) {
      return this.createUser();
    }
  }

  private createUser() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.createProdFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { urlImage, ...params } = this.createProdFormGroup.value;

    let obj= {
      ...params,
      urlImage: (this.imgBase64)?this.imgBase64:null,
    }
    console.log("guardar",obj);

    this.swalService.closeload();
    this.closeDialog();
    this.disableButton = false;
    this.swalService.success();
  }

}