import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';

@Component({
  selector: 'app-user-create',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent {
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
    public dialogRef: MatDialogRef<UserCreateComponent>,
    ){
    this.buildAddUserForm();
  }

  async ngOnInit() {
  }

  buildAddUserForm() {
    this.userFormGroup = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],
      email: [
        '',
        [
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      isActive: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],
      roles: [],
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
    if (this.userFormGroup) {
      return this.createUser();
    }
  }

  private createUser() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.userFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { urlImage, roles, ...params } = this.userFormGroup.value;

    let obj= {
      ...params,
      roles: roles,
      urlImage: this.imgBase64,
    }
    console.log("guardar",obj);

    this.swalService.closeload();
    this.closeDialog();
    this.disableButton = false;
    this.swalService.success();
  }

}