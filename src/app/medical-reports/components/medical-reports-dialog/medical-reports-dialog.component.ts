import { Component, Inject, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { MedicalReportsService } from '../../services/medical-reports.service';
import { IUser } from '../../interfaces/medical-reports.interface';
@Component({
  selector: 'app-medical-reports-dialog',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './medical-reports-dialog.component.html',
  styleUrl: './medical-reports-dialog.component.scss',
  providers: [MedicalReportsService]
})
export class MedicalReportsDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<MedicalReportsDialogComponent>);
  formGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selected_medicalReport!: IUser;
  disableButton: boolean = false;
  typeError = '';
  edit:boolean | undefined;
  listRolesActives!: {id:number,name:string}[];
  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalReportsService = inject(MedicalReportsService);
  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IUser){
    this.buildEditUserForm();
    this.getRolesActives();
  }
  async ngOnInit() {
    this.selected_medicalReport = this.data;
    this.edit = this.data.actionEdit;
    if (this.data) {
      this.setForm();
    }
  }
  get checkPropId() {
    if (this.selected_medicalReport?.id !== null && this.selected_medicalReport?.id !== undefined) {
      return true;
    }
    console.log("Falta id")
    return false;
  }
  buildEditUserForm() {
    this.formGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
        ],
      ],
      email: [
        '',
        [
          Validators.required, 
          Validators.email,
          Validators.maxLength(50),
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
      role: ['', [Validators.required]],
    });
  }
  setForm() {
    if(!this.edit){
      this.formGroup.controls['name'].disable();
      this.formGroup.controls['isActive'].disable();
      this.formGroup.controls['role'].disable();
    }
    this.formGroup.controls['email'].disable();
      this.formGroup.patchValue({
        name: this.selected_medicalReport?.name,
        email: this.selected_medicalReport?.email,
        isActive: this.selected_medicalReport?.isActivate,
        role: this.selected_medicalReport?.roleId,
      });
  }
  cancel() {
    this.closeDialog();
  }
  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }
  save() {
    if (this.checkPropId) {
      return this.update();
    }
  }
  private update() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.formGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { name, role, isActive } = this.formGroup.value;
    const id = this.selected_medicalReport.id;
  }

  getRolesActives() {
    this.medicalReportsService.getRolesActives().subscribe((data: any) => {
      this.listRolesActives = data;
    });
  }

}