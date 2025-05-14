import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportsService } from './services/reports.service';
import { firstValueFrom } from 'rxjs';
import { TokenAuth } from '../authentication/models/token-auth.model';
import { AuthService } from '../services/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-report-form',
  imports: [CommonModule,MaterialModule, ReactiveFormsModule],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.scss'
})
export class ReportFormComponent {
  showFiller = false;
  isSidenavOpen = true; // Establece en true para que el sidenav esté abierto al inicio

  reportFormGroup!: FormGroup;
  disableButton: boolean = false;
  private formBuilder = inject(FormBuilder);
  private reportsService = inject(ReportsService);

  token!: TokenAuth;
  authService = inject(AuthService)
  user_name = ''
  
  constructor( ){
    this.buildAddUserForm();
  }
  
  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo( await this.authService.getPlainToken() );
    if( this.token.sub ){
      this.user_name = this.token.name || this.token.email;
      this.getAuditorInSesion();
    }
  }
  getAuditorInSesion(): void {
    this.reportFormGroup.get('auditor')?.setValue(this.token.sub);
  }

  buildAddUserForm() {
    this.reportFormGroup = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      addressee: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      auditor: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      summary_objective: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      summary_scope: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      summary_methodology: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      summary_conclusionAndObservation: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      introduction: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      detailed_methodology: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      findings: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      conclusions: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      images: [null],
    });

  }

  cancel() {
    this.reportFormGroup.reset();
    this.getAuditorInSesion();
  }


  async save() {
    let data = {
      title: this.reportFormGroup.value.title,
      addressee: this.reportFormGroup.value.addressee,
      auditorId: this.reportFormGroup.value.auditor
    };
    console.log(data);

    try {
      let item = await firstValueFrom(
        this.reportsService.create(data)
      );
      toast.success('Reporte creado exitosamente');
      this.cancel();
      
    } catch (e: any) {
      console.log(e);
      toast.error('Error al crear el reporte');
    }
  }
  
}