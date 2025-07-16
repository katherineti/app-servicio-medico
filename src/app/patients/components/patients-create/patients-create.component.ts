import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { PatientsService } from '../../services/patients.service';

@Component({
  selector: 'app-patients-create',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './patients-create.component.html',
  styleUrl: './patients-create.component.scss'
})
export class PatientsCreateComponent {
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;
  // listRolesActives!: {id:number,name:string}[];

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private patientsService = inject(PatientsService);

  constructor( 
    public dialogRef: MatDialogRef<PatientsCreateComponent>,
    ){
    this.buildAddUserForm();
    // this.getRolesActives();
  }

  buildAddUserForm() {
    this.userFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          // Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
        ],
      ],
      email: [
        '', 
      [
        Validators.required, 
        Validators.email,
        Validators.maxLength(50),
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],

      role: ["", [Validators.required]],
    });

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
    const { ...params } = this.userFormGroup.value;
/*     this.patientsService
      .createUser({
        ...params,
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
      }); */
  }

/*   getRolesActives() {
    this.patientsService.getRolesActives().subscribe((data: any) => {
      this.listRolesActives = data;
    });
  } */
}