import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReportsService } from './services/reports.service';
import { firstValueFrom } from 'rxjs';
import { TokenAuth } from '../authentication/models/token-auth.model';
import { AuthService } from '../services/auth.service';
import { toast } from 'ngx-sonner';
import { ICreateReport, IReport } from './interfaces/reports.interface';

const REPORT_STATUS_ENPROCESO = 2;
const REPORT_STATUS_FINALIZADO = 1;

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
  user_name = '';
  // reportCreated_id:number | null=null;
  reportCreated_id?:number;

   // Variables para controlar qué sección está visible
  activeSection: "title" | "summary" | "conclusions" = "title";
  hiddenButtonCreation=false;
  
  constructor( ){
    this.buildAddReportForm();
  }
  
  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo( await this.authService.getPlainToken() );
    if( this.token.sub ){
      this.user_name = this.token.name || this.token.email;
      this.getAuditorInSesion();
    }
  }

  // Método para cambiar la sección activa
  changeSection(section: "title" | "summary" | "conclusions"): void {
    this.activeSection = section
  }
  
  getAuditorInSesion(): void {
    this.reportFormGroup.get('auditor')?.setValue(this.token.sub);
  }

  buildAddReportForm() {
    this.reportFormGroup = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      receiver: [
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
    this.disableButton = true;

    // if (this.reportFormGroup.invalid ||
    //   (this.reportFormGroup.value.title!='' && this.reportFormGroup.value.receiver !='' && this.reportFormGroup.value.auditor !='')
    // ) {
/*     if (this.reportFormGroup.invalid) {
      this.disableButton = false;
      return;
    } */

    let data:ICreateReport = {
      title: this.reportFormGroup.value.title,
      receiver: this.reportFormGroup.value.receiver,
      auditorId: this.reportFormGroup.value.auditor
    };
    console.log(data);

    try {
      let reportCreated = await firstValueFrom(
        this.reportsService.create(data)
      );
      console.log(reportCreated);
      this.reportCreated_id = reportCreated? reportCreated.id : 0;
      this.hiddenButtonCreation = true;
      this.disableButton = false;
      toast.success('Guardado');
      this.changeSection("summary");

    } catch (e: any) {
      this.disableButton = false;
      console.log(e);
      toast.error('Error al crear el reporte');
    }
  }

  async updateReport() {
    this.disableButton = true;

/*     if (this.reportFormGroup.invalid) {
      this.disableButton = false;
      return;
    } */

    console.log("this.reportCreated_id* ",this.reportCreated_id);
    let data:IReport = {
      title: this.reportFormGroup.value.title,
      receiver: this.reportFormGroup.value.receiver,
      auditorId: this.reportFormGroup.value.auditor,
      statusId: REPORT_STATUS_ENPROCESO,

      summary_objective: this.reportFormGroup.value.summary_objective,
      summary_scope: this.reportFormGroup.value.summary_scope,
      summary_methodology: this.reportFormGroup.value.summary_methodology,
      summary_conclusionAndObservation: this.reportFormGroup.value.summary_conclusionAndObservation,
    };

    if(this.activeSection==='conclusions'){
      data.introduction = this.reportFormGroup.value.introduction,
      data.detailed_methodology = this.reportFormGroup.value.detailed_methodology,
      data.findings = this.reportFormGroup.value.findings,
      data.conclusions = this.reportFormGroup.value.conclusions,
      data.statusId = REPORT_STATUS_FINALIZADO
    }
    console.log(data);

    try {
      let reportUpdated = await firstValueFrom(
        this.reportsService.update(data, this.reportCreated_id)
      );
      this.hiddenButtonCreation = true;
      this.disableButton = false;
      if(this.activeSection==='conclusions'){
        toast.success('Reporte finalizado');
        this.changeSection("title");
        this.cancel();
      }else{
        toast.success('Reporte actualizado exitosamente');
        this.changeSection("conclusions");
      }

    } catch (e: any) {
      this.disableButton = false;
      console.log(e);
      toast.error('Error al actualizar el reporte');
    }
  }
  
}