import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { RolesService } from '../rol/services/roles.service';

@Component({
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrl: './create-role.component.scss'
})
export class CreateRoleComponent {
  roleFormGroup!: FormGroup;
  disableButton: boolean = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private rolesService = inject(RolesService);

  constructor( 
    public dialogRef: MatDialogRef<CreateRoleComponent>,
    ){
    this.buildAddUserForm();
  }

  buildAddUserForm() {
    this.roleFormGroup = this.formBuilder.group({
      role: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(40),
        ],
      ],
      description: [
        '',
        [
          Validators.maxLength(50),
        ],
      ],
    });
  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save() {
    if (this.roleFormGroup) {
      return this.create();
    }
  }

  private create() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.roleFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { role, description } = this.roleFormGroup.value;
    this.rolesService
      .create({
        name:role,
        description
      })
      .subscribe({
        error: (msj) => {
          this.swalService.closeload();
          this.disableButton = false;
          this.swalService.error('Error', msj);
        },
        complete: () => {
          this.swalService.closeload();
          this.swalService.success();
          this.closeDialog();
          this.disableButton = false;
        },
      });
  }
}