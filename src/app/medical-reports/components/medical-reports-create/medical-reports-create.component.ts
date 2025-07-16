import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { MedicalReportsService } from '../../services/medical-reports.service';

@Component({
  selector: 'app-medical-reports-create',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './medical-reports-create.component.html',
  styleUrl: './medical-reports-create.component.scss'
})
export class MedicalReportsCreateComponent {
  formGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;
  listRolesActives!: {id:number,name:string}[];

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalReportsService = inject(MedicalReportsService);

  constructor( 
    public dialogRef: MatDialogRef<MedicalReportsCreateComponent>,
    ){
    this.buildAddUserForm();
    this.getRolesActives();
  }

  buildAddUserForm() {
    this.formGroup = this.formBuilder.group({
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

  save() {
    if (this.formGroup) {
      return this.create();
    }
  }

  private create() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.formGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { ...params } = this.formGroup.value;
    this.medicalReportsService
      .create({
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
      });
  }

  getRolesActives() {
    this.medicalReportsService.getRolesActives().subscribe((data: any) => {
      this.listRolesActives = data;
    });
  }
}