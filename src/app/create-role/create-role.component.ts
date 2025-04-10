import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';

@Component({
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss'
})
export class CreateRoleComponent {
  roleFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);

  constructor( 
    public dialogRef: MatDialogRef<CreateRoleComponent>,
    ){
    this.buildAddUserForm();
  }

  async ngOnInit() {
  }

  buildAddUserForm() {
    this.roleFormGroup = this.formBuilder.group({
      role: [
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
    if (this.roleFormGroup) {
      return this.createUser();
    }
  }

  private createUser() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.roleFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { role } = this.roleFormGroup.value;

    console.log("guardar",role);

    this.swalService.closeload();
    this.closeDialog();
    this.disableButton = false;
    this.swalService.success();
  }

}