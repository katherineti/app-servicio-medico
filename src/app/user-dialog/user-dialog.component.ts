import { Component, Inject, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';

export interface IUser {
  id: string;
  username: string;
  email: string;
  name: string;
  isActive: boolean;
  urlImage?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-user-dialog',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})

export class UserDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selectedUser!: IUser;
  disableButton: boolean = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IUser){
    this.buildEditUserForm();
  }

  async ngOnInit() {

    this.selectedUser = this.data;
    console.log(this.selectedUser)
    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedUser?.id !== null && this.selectedUser?.id !== undefined) {
      return true;
    }
    console.log("falta id")
    return false;
  }

  buildEditUserForm() {
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

  setForm() {

      this.userFormGroup.patchValue({
        username: this.selectedUser?.username,
        email: this.selectedUser?.email,
        name: this.selectedUser?.name,
        isActive: this.selectedUser?.isActive,
        roles: 1,
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
    if (this.checkPropId) {
      return this.updateUser();
    }
  }

  private updateUser() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.userFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { roles, ...params } = this.userFormGroup.value;
    const id = this.selectedUser.id;

    let obj= {
      id,
      ...params,
      roles: roles,
      urlImage: this.imgBase64,
    }
    console.log("guardar",obj);

    this.swalService.closeload();
    this.swalService.success();
    this.disableButton = false;
    this.closeDialog();
  }
}