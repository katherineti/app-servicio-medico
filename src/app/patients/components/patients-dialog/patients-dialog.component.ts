import { Component, Inject, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { PatientsService } from '../../services/patients.service';
import { IPatient } from '../../interfaces/patients.interface';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../services/date-format.service';
import { debounceTime, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-patients-dialog',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './patients-dialog.component.html',
  styleUrl: './patients-dialog.component.scss',
  providers: [
    PatientsService,
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es-VE" },
  ]  
})

export class PatientsDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<PatientsDialogComponent>);
  formGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selectedUser!: IPatient;
  disableButton: boolean = false;
  typeError = '';
  edit:boolean | undefined;
  public isLoading = false; 
  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private patientsService = inject(PatientsService);

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IPatient){
    this.buildEditUserForm();
  }

  async ngOnInit() {

    this.selectedUser = this.data;
    this.edit = this.data.actionEdit;
    if (this.data) {
      console.log("paciente seleccionado",this.data)
      this.setForm();
      this.formatNameInput();
    }
  }

  get checkPropId() {
    if (this.selectedUser?.id !== null && this.selectedUser?.id !== undefined) {
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
      birthdate: ['', [Validators.required]], 
      placeBirth: ['', [Validators.required, Validators.maxLength(40)]], 
      age: [0, [Validators.required]], 
      cedulaType: ['V', [Validators.required]], 
      cedulaNumber: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      email: [
        '',
        [
          Validators.required, 
          Validators.email,
          Validators.maxLength(100)
        ],
      ],
      phone: ['', [Validators.required, Validators.maxLength(50)]], 
      gender: ['', [Validators.required]], 
      civilStatus: ['', [Validators.required]], 
      children: [0, [Validators.required]], 
      isActive: [ '', [Validators.required] ],
    });
  }

  setForm() {
    if(!this.edit){
      this.formGroup.controls['name'].disable();
      this.formGroup.controls['birthdate'].disable();
      this.formGroup.controls['placeBirth'].disable();
      this.formGroup.controls['age'].disable();
      this.formGroup.controls['cedulaType'].disable();
      this.formGroup.controls['cedulaNumber'].disable();
      this.formGroup.controls['email'].disable();
      this.formGroup.controls['phone'].disable();
      this.formGroup.controls['gender'].disable();
      this.formGroup.controls['civilStatus'].disable();
      this.formGroup.controls['children'].disable();
      this.formGroup.controls['isActive'].disable();
    }

    if (this.selectedUser?.birthdate) {
      const [year, month, day] = this.selectedUser?.birthdate.split("-")
      const date = new Date(+year, +month - 1, +day) 

      this.formGroup.patchValue({
        birthdate: date,
      })
    }

    if (this.selectedUser?.cedula) {
      const [cedulaType, cedulaNumber] = this.selectedUser?.cedula.split("-");

      this.formGroup.patchValue({
        cedulaType: cedulaType,
        cedulaNumber: cedulaNumber,
      })
    }

    this.formGroup.patchValue({
      name: this.selectedUser?.name,
      placeBirth: this.selectedUser?.placeBirth,
      age: this.selectedUser?.age,
      email: this.selectedUser?.email,
      phone: this.selectedUser?.phone,
      gender: this.selectedUser?.gender,
      civilStatus: this.selectedUser?.civilStatus,
      children: this.selectedUser?.children,
      isActive: this.selectedUser?.isActivate,
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
      return this.updatePatient();
    }
  }

  private updatePatient() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.formGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { 
          name,
          birthdate,
          placeBirth,
          age,
          email,
          phone,
          gender,
          civilStatus,
          children,
          cedulaType,
          cedulaNumber,
          isActive
           } = this.formGroup.value;
    const id = this.selectedUser.id;

     this.patientsService
      .update(
        id, 
        {
          name,
          birthdate,
          placeBirth,
          age,
          email,
          phone,
          gender,
          civilStatus,
          children,
          cedula: cedulaType+'-'+cedulaNumber,
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
          console.log("Error ", error)
          this.disableButton = false;
          if(error){
            this.swalService.closeload();
            this.swalService.error('Error', error);
          }else{
            this.swalService.error('Error de actualización', 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
          }
        },
      }); 
  }
 
  private capitalizeName(value: string): string {
    if (!value) return '';
    return value.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  private formatNameInput() {
    this.formGroup.get('name')?.valueChanges.pipe(
      startWith(this.formGroup.get('name')?.value),
      debounceTime(300) 
    ).subscribe(value => {
      if (value) {
        const formattedName = this.capitalizeName(value);
        this.formGroup.get('name')?.setValue(formattedName, { emitEvent: false });
      }
    });
  }

}