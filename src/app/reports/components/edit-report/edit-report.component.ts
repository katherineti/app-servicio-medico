import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
import { MaterialModule } from '../../../material/material.module';
import { ImageFile, ImageUploadComponent } from '../../../image-upload/image-upload.component';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from '../../../services/auth.service';
import { TokenAuth } from '../../../authentication/models/token-auth.model';
import { ICreateReport, IReport } from '../../interfaces/reports.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditMedicalSuppliesComponent } from '../../../edit-medical-supplies/edit-medical-supplies.component';
import { DomSanitizer } from '@angular/platform-browser';
import { API_URL } from '../../../../../environment';

const REPORT_STATUS_ENPROCESO = 2;
const REPORT_STATUS_FINALIZADO = 1;

@Component({
  selector: 'app-edit-report',
  imports: [CommonModule,MaterialModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss'
})
export class EditReportComponent {
  readonly dialogRef = inject(MatDialogRef<EditMedicalSuppliesComponent>);
  showFiller = false;
  isSidenavOpen = true; // Establece en true para que el sidenav esté abierto al inicio
  reportFormGroup!: FormGroup;
  disableButton: boolean = false;
  private formBuilder = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  token!: TokenAuth;
  authService = inject(AuthService)
  user_name = '';
  reportCreated_id?:number;
  activeSection: "title" | "summary" | "conclusions" = "title";
  hiddenButtonCreation=false;
  selectedImages: ImageFile[] = []
 
  selectedReport!: IReport;
  edit:boolean | undefined;
  private API_URL = API_URL; 
  private sanitizer = inject(DomSanitizer);

  constructor(@Inject(MAT_DIALOG_DATA) public data: IReport){
    this.buildAddReportForm();
    this.selectedImages = [];
    this.reportCreated_id = 0;
  }
  
  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo(await this.authService.getPlainToken());
    if (this.token.sub) {
      this.user_name = this.token.name || this.token.email;
      this.getAuditorInSesion();
    }
    this.updateValidators(); 

    this.selectedReport = this.data;   console.log("selectedReport ", this.selectedReport );
    this.edit = this.data.actionEdit; 
    if (this.data) {
      this.setForm();
    }
  }

  // Método para cambiar la sección activa
  changeSection(section: "title" | "summary" | "conclusions"): void {
    this.activeSection = section;
    this.updateValidators();
  }

  // Método para actualizar los validadores según la sección activa
  updateValidators(): void {
    const validatorsBySection: { [key: string]: any } = {
      title: {
        title: [Validators.required, Validators.maxLength(50)],
        receiver: [Validators.required, Validators.maxLength(50)],
        auditor: [Validators.required, Validators.maxLength(50)],
      },
      summary: {
        summary_objective: [Validators.required, Validators.maxLength(50)],
        summary_scope: [Validators.required, Validators.maxLength(50)],
        summary_methodology: [Validators.required, Validators.maxLength(50)],
        summary_conclusionAndObservation: [Validators.required, Validators.maxLength(50)],
      },
      conclusions: {
        introduction: [Validators.required, Validators.maxLength(50)],
        detailed_methodology: [Validators.required, Validators.maxLength(50)],
        findings: [Validators.required, Validators.maxLength(50)],
        conclusions: [Validators.required, Validators.maxLength(50)],
      },
    };

    Object.keys(this.reportFormGroup.controls).forEach(controlName => {
      const validators = validatorsBySection[this.activeSection]?.[controlName] || [Validators.maxLength(50)];
      this.reportFormGroup.get(controlName)?.setValidators(validators);
      this.reportFormGroup.get(controlName)?.updateValueAndValidity();
    });
  }
  
  getAuditorInSesion(): void {
    this.reportFormGroup.get('auditor')?.setValue(this.token.sub);
  }

  buildAddReportForm() {
    this.reportFormGroup = this.formBuilder.group({
      title: ['', [Validators.maxLength(50)]],
      receiver: ['', [Validators.maxLength(50)]],
      auditor: ['', [Validators.maxLength(50)]],
      summary_objective: ['', [Validators.maxLength(50)]],
      summary_scope: ['', [Validators.maxLength(50)]],
      summary_methodology: ['', [Validators.maxLength(50)]],
      summary_conclusionAndObservation: ['', [Validators.maxLength(50)]],
      introduction: ['', [Validators.maxLength(50)]],
      detailed_methodology: ['', [Validators.maxLength(50)]],
      findings: ['', [Validators.maxLength(50)]],
      conclusions: ['', [Validators.maxLength(50)]],
      images: [null],
    });
  }

  setForm() {
    if(!this.edit){
      this.reportFormGroup.controls['title'].disable();
      this.reportFormGroup.controls['receiver'].disable();
      // this.reportFormGroup.controls['auditor'].disable();
      this.reportFormGroup.controls['summary_objective'].disable();
      this.reportFormGroup.controls['summary_scope'].disable();
      this.reportFormGroup.controls['summary_methodology'].disable();
      this.reportFormGroup.controls['summary_conclusionAndObservation'].disable();

      this.reportFormGroup.controls['introduction'].disable();
      this.reportFormGroup.controls['detailed_methodology'].disable();
      this.reportFormGroup.controls['findings'].disable();
      this.reportFormGroup.controls['conclusions'].disable();
      // this.reportFormGroup.controls['images'].disable();
    }
    this.reportFormGroup.controls['auditor'].disable();

    this.reportFormGroup.patchValue({
      title: this.selectedReport?.title,
      receiver: this.selectedReport?.receiver,
      auditor: this.selectedReport?.auditorId,
      summary_objective: this.selectedReport?.summary_objective,
      summary_scope: this.selectedReport?.summary_scope,
      summary_methodology: this.selectedReport?.summary_methodology,
      summary_conclusionAndObservation: this.selectedReport?.summary_conclusionAndObservation,
      introduction: this.selectedReport?.introduction,
      detailed_methodology:this.selectedReport?.detailed_methodology,
      findings: this.selectedReport?.findings,
      conclusions:this.selectedReport?.conclusions,
      });

      this.reportCreated_id = this.data?.id;

   // Handle images from the backend
    if (this.selectedReport.images && this.selectedReport.images.length > 0) {
      this.selectedImages = this.selectedReport.images.map(imagePath => {
        const fullUrl = this.normalizeUrl(this.API_URL, imagePath);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl);
        return {
          file: null, // No original File object from backend
          preview: safeUrl,
          isRemote: true, // Mark it as a remote image
          remoteUrl: imagePath // Store the original backend path
        } as unknown as ImageFile;
      });
      console.log("Images loaded from backend:", this.selectedImages);
    } else {
      this.selectedImages = []; // Ensure it's empty if no images from DB
    }
  }

  cancel() {
    this.reportFormGroup.reset();
    this.getAuditorInSesion();
  }

  // Método para manejar cambios en las imágenes desde el componente hijo
  onImagesChange(images: ImageFile[]) {
    this.selectedImages = images;
  }

  async save(): Promise<void> {
    this.disableButton = true;

    if (this.activeSection === "title" && this.reportFormGroup.invalid) {
      this.disableButton = false;
      toast.error("Por favor complete todos los campos requeridos en la sección título");
      return;
    }

    const data: ICreateReport = {
      title: this.reportFormGroup.value.title,
      receiver: this.reportFormGroup.value.receiver,
      auditorId: this.reportFormGroup.value.auditor
    };

    try {
      const isExistingReport = this.reportCreated_id !== undefined && this.reportCreated_id > 0;
      if (isExistingReport) {
        data.id = this.reportCreated_id;
        const reportCreated = await firstValueFrom(this.reportsService.create(data));
        // this.reportCreated_id = reportCreated?.id;
        this.hiddenButtonCreation = true;
        this.disableButton = false;
        toast.success('Guardado');
        this.changeSection("summary");
      }else{
        toast.success('El id del reporte no existe');
      }

    } catch (error: any) {
      this.disableButton = false;
      console.error('Error al actualizar el título del reporte:', error);
      toast.error(error?.message || 'Error al guardar el título del reporte.');
    }
  }

  async updateReport(): Promise<void> {
    this.disableButton = true;

    if (this.activeSection === "summary" && this.reportFormGroup.invalid) {
      this.disableButton = false;
      toast.error("Por favor complete todos los campos requeridos en la sección resumen");
      return;
    }

    if (this.activeSection === "conclusions" && this.reportFormGroup.invalid) {
      this.disableButton = false;
      toast.error("Por favor complete todos los campos requeridos en la sección conclusiones");
      return;
    }

    const reportData: IReport = {
      ...this.reportFormGroup.value,
      auditorId: this.reportFormGroup.value.auditor,
      statusId: this.activeSection === 'conclusions' ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
    };

    try {
      let result: IReport | any;
      if (this.selectedImages.length > 0 && this.reportCreated_id) {
        const formData = new FormData();
        Object.keys(reportData).forEach((key) => {
          formData.append(key, reportData[key as keyof IReport] as string);
        });
        this.selectedImages.forEach(img => {
          formData.append('images', img.file);
        });
        result = await firstValueFrom(this.reportsService.updateWithImages(formData, this.reportCreated_id));
          console.log("enviando data:");
          formData.forEach((value, key) => {
            console.log(key, value);
          });

      } else  {
        const dataToUpdate = {
          ...this.reportFormGroup.value,
          auditorId: this.reportFormGroup.value.auditor,
          statusId: this.activeSection === 'conclusions' ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
        };
        console.log("this.reportCreated_id " , this.reportCreated_id)
        console.log("dataToUpdate " , dataToUpdate)
        delete dataToUpdate.images;
        result = await firstValueFrom(this.reportsService.update(dataToUpdate, this.reportCreated_id));
        console.log("enviando data: ", dataToUpdate);
      }
      console.log("resultado update " , result)
      this.reportCreated_id = result?.id;
        console.log("this.reportCreated_id: ", this.reportCreated_id);

      if (result?.error) {
        toast.error(result.error);
        this.disableButton = false;
        return;
      }

      this.handleSuccessResponse();
    } catch (error: any) {
      this.disableButton = false;
      console.error('Error al actualizar el reporte:', error);
      toast.error(error?.message || 'Error al actualizar el reporte.');
    }
  }

  private handleSuccessResponse() {
    this.hiddenButtonCreation = true;
    this.disableButton = false;
    
    if (this.activeSection === "conclusions") {
      this.selectedImages = [];
      this.reportCreated_id = 0; // Resetear el ID después de finalizar
      toast.success("Reporte finalizado");
      this.changeSection("title");
      this.cancel();
    } else {
      toast.success("Sección guardada y avanzando");
      this.changeSection("conclusions");
    }
  }

normalizeUrl(baseUrl: string, path: string): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : '/' + path;

  return cleanBaseUrl + cleanPath;
}
}
