import { Component, inject } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { CommonModule, TitleCasePipe } from "@angular/common"
import { firstValueFrom } from "rxjs"
import type { TokenAuth } from "../../../authentication/models/token-auth.model"
import { AuthService } from "../../../services/auth.service"
import { toast } from "ngx-sonner"
import { type ImageFile, ImageUploadComponent } from "../../../image-upload/image-upload.component"
import type { Auditor, ICreateReport, IReport } from "../../interfaces/reports.interface"
import { ReportsService } from "../../services/reports.service"
import { AuditorMultiSelectComponent} from "../auditor-multi-select/auditor-multi-select.component"
export interface AuditorOption {
  value: any // El valor real (this.token.sub)
  displayText: string // El texto a mostrar como primera opción (Nombre del usuario activo)
}

const REPORT_STATUS_ENPROCESO = 2
const REPORT_STATUS_FINALIZADO = 1

@Component({
  selector: "app-report-form",
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, ImageUploadComponent, AuditorMultiSelectComponent],
  templateUrl: "./report-form.component.html",
  styleUrl: "./report-form.component.scss",
})
export class ReportFormComponent {
  
  reportFormGroup!: FormGroup;
  token!: TokenAuth;
  reportCreated_id?: number;
  user_name = "";
  displayText = "";
  activeSection: "title" | "summary" | "conclusions" = "title";
  selectedImages: ImageFile[] = [];
  selectedAdditionalAuditors: Auditor[] = [];
  showFiller = false;
  isSidenavOpen = true;
  disableButton = false;
  hiddenButtonCreation = false;
  activeConclutions = false;
  showNewFamilyMemberForm = false;
  showAddAuditorForm = false;
  
  private onChange = (value: any) => {}
  private onTouched = () => {}
  private titleCasePipe = new TitleCasePipe();
  
  private formBuilder = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private authService = inject(AuthService);

  constructor() {
    this.buildAddReportForm();
    this.selectedImages = [];
    this.reportCreated_id = 0;
  }

  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo(await this.authService.getPlainToken())
    if (this.token.sub) {
      this.user_name = this.token.name || this.token.email;
      this.displayText=this.user_name;
      this.onOptionSelected({value: this.token.sub, displayText: this.user_name});    
    }
    this.updateValidators()
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  changeSection(section: "title" | "summary" | "conclusions"): void {
    this.activeSection = section
    this.updateValidators()
  }

  updateValidators(): void {
    const validatorsBySection: { [key: string]: any } = {
      title: {
        title: [Validators.required, Validators.maxLength(50)],
        receiver: [Validators.required, Validators.maxLength(50)],
        auditor: [Validators.required, Validators.maxLength(50)],
        additionalAuditors: [], // Sin validadores requeridos para auditores adicionales
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
    }

    Object.keys(this.reportFormGroup.controls).forEach((controlName) => {
      const validators = validatorsBySection[this.activeSection]?.[controlName] || [Validators.maxLength(50)]
      this.reportFormGroup.get(controlName)?.setValidators(validators)
      this.reportFormGroup.get(controlName)?.updateValueAndValidity()
    })
  }

  buildAddReportForm() {
    this.reportFormGroup = this.formBuilder.group({
      title: ["", [Validators.maxLength(50)]],
      receiver: ["", [Validators.maxLength(50)]],
      auditor: ["", [Validators.maxLength(50)]],
      additionalAuditors: [[]], // Nuevo campo para auditores adicionales
      summary_objective: ["", [Validators.maxLength(50)]],
      summary_scope: ["", [Validators.maxLength(50)]],
      summary_methodology: ["", [Validators.maxLength(50)]],
      summary_conclusionAndObservation: ["", [Validators.maxLength(50)]],
      introduction: ["", [Validators.maxLength(50)]],
      detailed_methodology: ["", [Validators.maxLength(50)]],
      findings: ["", [Validators.maxLength(50)]],
      conclusions: ["", [Validators.maxLength(50)]],
      images: [null],
    })
  }

  // Nuevo método para manejar cambios en auditores adicionales
  onAdditionalAuditorsChange(auditors: Auditor[]): void {
    this.selectedAdditionalAuditors = auditors
    const auditorIds = auditors.map((auditor) => auditor.id)
    this.reportFormGroup.get("additionalAuditors")?.setValue(auditorIds)
  }

  cancel() {
    this.reportFormGroup.reset()
    this.selectedAdditionalAuditors = []
  }

  onImagesChange(images: ImageFile[]) {
    this.selectedImages = images
  }

  async save(): Promise<void> {
    this.disableButton = true
    this.activeConclutions = false

    if (this.activeSection === "title" && this.reportFormGroup.invalid) {
      this.disableButton = false
      toast.error("Por favor complete todos los campos requeridos en la sección título")
      return
    }

    const data: ICreateReport = {
      title: this.reportFormGroup.value.title,
      receiver: this.reportFormGroup.value.receiver,
      // auditorId: this.reportFormGroup.value.auditor,
      auditorId: this.token.sub,
      additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [], // Incluir auditores adicionales
    }

    try {
      const isExistingReport = this.reportCreated_id !== undefined && this.reportCreated_id > 0
      if (isExistingReport) {
        data.id = this.reportCreated_id
      }
console.log("creando reporte  - paso 1 " , data)
      const reportCreated = await firstValueFrom(this.reportsService.create(data))
      this.reportCreated_id = reportCreated?.id
      this.hiddenButtonCreation = true
      this.disableButton = false
      toast.success("Guardado")
      this.changeSection("summary")
    } catch (error: any) {
      this.disableButton = false
      console.error("Error al crear/actualizar el título del reporte:", error)
      toast.error(error)
    }
  }

  async updateReport(): Promise<void> {
    this.disableButton = true

    if (this.activeSection === "summary" && this.reportFormGroup.invalid) {
      this.disableButton = false
      toast.error("Por favor complete todos los campos requeridos en la sección resumen")
      return
    }

    if (this.activeSection === "conclusions" && this.reportFormGroup.invalid) {
      this.disableButton = false
      toast.error("Por favor complete todos los campos requeridos en la sección conclusiones")
      return
    }

    const reportData: IReport = {
      ...this.reportFormGroup.value,
      // auditorId: this.reportFormGroup.value.auditor,
      auditorId: this.token.sub,
      additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [], // Incluir auditores adicionales
      statusId: this.activeSection === "conclusions" ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
    }

    try {
      let result: IReport | any
      if (this.selectedImages.length > 0 && this.reportCreated_id) {
        const formData = new FormData()
        Object.keys(reportData).forEach((key) => {
          const value = reportData[key as keyof IReport]
          if (key === "additionalAuditorIds" && Array.isArray(value)) {
            // Manejar array de IDs de auditores adicionales
            value.forEach((id, index) => {
              formData.append(`additionalAuditorIds[${index}]`, id.toString())
            })
          } else {
            formData.append(key, value as string)
          }
        })
        this.selectedImages.forEach((img) => {
          formData.append("images", img.file)
        })
        result = await firstValueFrom(this.reportsService.updateWithImages(formData, this.reportCreated_id))
        console.log("enviando data:")
        this.activeConclutions = true
        formData.forEach((value, key) => {
          console.log(key, value)
        })
      } else {
        const dataToUpdate = {
          ...this.reportFormGroup.value,
          // auditorId: this.reportFormGroup.value.auditor,
          auditorId: this.token.sub,
          additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [],
          statusId: this.activeSection === "conclusions" ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
        }
        console.log("this.reportCreated_id ", this.reportCreated_id)
        console.log("dataToUpdate ", dataToUpdate)
        delete dataToUpdate.images
        result = await firstValueFrom(this.reportsService.update(dataToUpdate, this.reportCreated_id))
        this.activeConclutions = true
        console.log("enviando data: ", dataToUpdate)
      }
      console.log("resultado update ", result)
      this.reportCreated_id = result?.id
      console.log("this.reportCreated_id: ", this.reportCreated_id)

      if (result?.error) {
        toast.error(result.error)
        this.disableButton = false;
        this.activeConclutions = false;
        this.showAddAuditorForm=  false;
        return
      }

      this.handleSuccessResponse();

    } catch (error: any) {
      this.disableButton = false
      this.activeConclutions = false
      this.showAddAuditorForm=  false;

      console.error("Error al actualizar el reporte:", error)
      toast.error(error?.message || "Error al actualizar el reporte.")
    }
  }

  private handleSuccessResponse() {
    this.hiddenButtonCreation = true
    this.disableButton = false

    if (this.activeSection === "conclusions") {
      this.selectedImages = [];
      this.selectedAdditionalAuditors = [];
      this.reportCreated_id = 0;
      toast.success("Reporte finalizado");
      this.changeSection("title");
      this.cancel();
      this.activeConclutions = false;
      this.showAddAuditorForm=  false;
    } else {
      toast.success("Sección guardada y avanzando");
      this.changeSection("conclusions");
    }
  }

  // Cuando se selecciona una opción
  onOptionSelected(option: AuditorOption): void {
    this.onChange(option.value)

    // Pero mostramos el texto personalizado
    this.reportFormGroup.patchValue({
      auditor: this.titleCasePipe.transform( option.displayText )
    });

    this.onTouched();
  }

  // Función para mostrar el texto en el input cuando se selecciona una opción
  displayFn(option: AuditorOption | string): any {
    // Si es un objeto (nuestra opción), mostramos su displayText
    if (option && typeof option === "object") {
      return option
      // return option.displayText
    }
    // Si es un string, lo devolvemos tal cual
    return option as string
  }

  toggleAdditionalAuditorForm(): void {
    this.showAddAuditorForm = !this.showAddAuditorForm;
    if (!this.showAddAuditorForm) {
      this.reportFormGroup.patchValue({ additionalAuditors: "" });
    }
  }
  
}