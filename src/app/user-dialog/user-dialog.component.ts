import { Component, Inject, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { UsersService } from '../users/services/users.service';
import { IUser } from '../users/interfaces/users.interface';

@Component({
  selector: 'app-user-dialog',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
  providers: [UsersService]
})

export class UserDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selectedUser!: IUser;
  disableButton: boolean = false;
  typeError = '';
  edit:boolean | undefined;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private usersService = inject(UsersService);

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IUser){
    this.buildEditUserForm();
  }

  async ngOnInit() {

    this.selectedUser = this.data;
    console.log("this.selectedUser ", this.selectedUser.id);
    this.edit = this.data.actionEdit;
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
      email: [
        '',
        [
          Validators.required, 
          Validators.email,
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
          // Validators.pattern('/^[a-zA-ZÀ-ÿ\s]+$/')
        ],
      ],
      isActive: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      role: [''],
    });
  }

  setForm() {
    if(!this.edit){
      this.userFormGroup.controls['name'].disable();
      this.userFormGroup.controls['isActive'].disable();
      this.userFormGroup.controls['role'].disable();
    }

    this.userFormGroup.controls['email'].disable();

      this.userFormGroup.patchValue({
        name: this.selectedUser?.name,
        email: this.selectedUser?.email,
        isActive: this.selectedUser?.isActivate,
        role: this.selectedUser?.role,
      });
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
    const { name, role, isActive } = this.userFormGroup.value;
    const id = this.selectedUser.id;

    this.usersService
      .updateUser(
        id, 
        {
          name, 
          role,
          isActivate: isActive,
        })
      .subscribe({
        next: () => {
          this.swalService.closeload();
          this.swalService.success();
          this.disableButton = false;
          this.closeDialog();
        },
        error: (error) => {
          console.log("error ",error)
          this.swalService.closeload();
          this.disableButton = false;
          this.swalService.error('Error', error);
        },
      });
  }

}