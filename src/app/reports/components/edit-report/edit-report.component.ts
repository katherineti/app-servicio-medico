import { Component, inject, Inject } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { CommonModule, TitleCasePipe } from "@angular/common"
import { firstValueFrom } from "rxjs"
import { toast } from "ngx-sonner"
import { MaterialModule } from "../../../material/material.module"
import { ImageFile, ImageUploadComponent } from "../../../image-upload/image-upload.component"
import { ReportsService } from "../../services/reports.service"
import { AuthService } from "../../../services/auth.service"
import { TokenAuth } from "../../../authentication/models/token-auth.model"
import type { Auditor, ICreateReport, IReport } from "../../interfaces/reports.interface"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { DomSanitizer } from "@angular/platform-browser"
import { API_URL } from "../../../../../environment"
import type { AuditorOption } from "../report-form/report-form.component"
import { AuditorMultiSelectComponent } from "../auditor-multi-select/auditor-multi-select.component"
import { AuditoresService } from "../../services/auditores.service"

const REPORT_STATUS_ENPROCESO = 2
const REPORT_STATUS_FINALIZADO = 1

@Component({
  selector: "app-edit-report",
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, ImageUploadComponent, AuditorMultiSelectComponent],
  templateUrl: "./edit-report.component.html",
  styleUrl: "./edit-report.component.scss",
})
export class EditReportComponent {
  reportFormGroup!: FormGroup
  token!: TokenAuth
  reportCreated_id?: number
  user_name = ""
  displayText = ""
  activeSection: "title" | "summary" | "conclusions" = "title"
  selectedImages: ImageFile[] = []
  selectedAdditionalAuditors: Auditor[] = []
  showFiller = false
  isSidenavOpen = true
  disableButton = false
  hiddenButtonCreation = false
  activeConclutions = false
  showNewFamilyMemberForm = false
  showAddAuditorForm = false

  selectedReport!: IReport
  edit: boolean | undefined
  
  private onChange = (value: any) => {}
  private onTouched = () => {}
  
  private API_URL = API_URL
  private titleCasePipe = new TitleCasePipe()
  private formBuilder = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private authService = inject(AuthService);
  private sanitizer= inject( DomSanitizer)
  private auditoresService= inject(AuditoresService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: IReport, public dialogRef: MatDialogRef<EditReportComponent>){
    this.buildAddReportForm();
    this.selectedImages = [];
    this.reportCreated_id = 0;
  }

  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo(await this.authService.getPlainToken())
    if (this.token.sub) {
      this.user_name = this.token.name || this.token.email
      this.displayText = this.user_name
      this.onOptionSelected({ value: this.token.sub, displayText: this.user_name })
    }
    this.updateValidators()

    this.selectedReport = this.data
    console.log("selectedReport ", this.selectedReport)
    this.edit = this.data.actionEdit
    if (this.data) {
      this.setForm()
    }
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
        additionalAuditors: [],
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
      additionalAuditors: [[]],
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

  setForm() {
    if (!this.edit) {
      this.reportFormGroup.controls["title"].disable()
      this.reportFormGroup.controls["receiver"].disable()
      this.reportFormGroup.controls["summary_objective"].disable()
      this.reportFormGroup.controls["summary_scope"].disable()
      this.reportFormGroup.controls["summary_methodology"].disable()
      this.reportFormGroup.controls["summary_conclusionAndObservation"].disable()

      this.reportFormGroup.controls["introduction"].disable()
      this.reportFormGroup.controls["detailed_methodology"].disable()
      this.reportFormGroup.controls["findings"].disable()
      this.reportFormGroup.controls["conclusions"].disable()
    }
    this.reportFormGroup.controls["auditor"].disable()

    this.reportFormGroup.patchValue({
      title: this.selectedReport?.title,
      receiver: this.selectedReport?.receiver,
      auditor: this.titleCasePipe.transform(this.displayText),
      summary_objective: this.selectedReport?.summary_objective,
      summary_scope: this.selectedReport?.summary_scope,
      summary_methodology: this.selectedReport?.summary_methodology,
      summary_conclusionAndObservation: this.selectedReport?.summary_conclusionAndObservation,
      introduction: this.selectedReport?.introduction,
      detailed_methodology: this.selectedReport?.detailed_methodology,
      findings: this.selectedReport?.findings,
      conclusions: this.selectedReport?.conclusions,
    })

    this.reportCreated_id = this.data?.id

    this.loadAdditionalAuditors()

    if (this.selectedReport.images && this.selectedReport.images.length > 0) {
      this.selectedImages = this.selectedReport.images.map((imagePath) => {
        const fullUrl = this.normalizeUrl(this.API_URL, imagePath)
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(fullUrl)
        return {
          file: null,
          preview: safeUrl,
          isRemote: true,
          remoteUrl: imagePath,
        } as unknown as ImageFile
      })
      console.log("Images loaded from backend:", this.selectedImages)
    } else {
      this.selectedImages = []
    }
  }

  private loadAdditionalAuditors(): void {
    if (this.selectedReport?.additionalAuditorIds && this.selectedReport.additionalAuditorIds.length > 0) {
      this.showAddAuditorForm = true
      this.auditoresService.getAllActives().subscribe({
        next: (data: any) => {
          const auditors = data.list
          this.selectedAdditionalAuditors = auditors.filter((auditor: Auditor) =>
            this.selectedReport.additionalAuditorIds?.includes(auditor.id),
          )
          this.reportFormGroup.get("additionalAuditors")?.setValue(this.selectedReport.additionalAuditorIds)
          this.onAdditionalAuditorsChange(this.selectedAdditionalAuditors)
        },
        error: (error) => {
          console.error("Error al cargar auditores adicionales:", error)
        },
      })
    }
  }
  onAdditionalAuditorsChange(auditors: Auditor[]): void {
    this.selectedAdditionalAuditors = auditors
    const auditorIds = auditors.map((auditor) => auditor.id)
    this.reportFormGroup.get("additionalAuditors")?.setValue(auditorIds)
  }
  cancel() {
    this.reportFormGroup.reset()
    this.selectedAdditionalAuditors = []
    if(this.edit){
      this.closeDialog()
    }
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
      auditorId: this.token.sub,
      additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [], 
    }

    try {
      const isExistingReport = this.reportCreated_id !== undefined && this.reportCreated_id > 0
      if (isExistingReport) {
        data.id = this.reportCreated_id
      }
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
      auditorId: this.token.sub,
      additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [],  
      statusId: this.activeSection === "conclusions" ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
    }

    try {
      let result: IReport | any
      if (this.selectedImages.length > 0 && this.reportCreated_id) {
        const formData = new FormData()
        Object.keys(reportData).forEach((key) => {
          const value = reportData[key as keyof IReport]
          if (key === "additionalAuditorIds" && Array.isArray(value)) {
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
          auditorId: this.token.sub,
          additionalAuditorIds: this.reportFormGroup.value.additionalAuditors || [],
          statusId: this.activeSection === "conclusions" ? REPORT_STATUS_FINALIZADO : REPORT_STATUS_ENPROCESO,
        }
        delete dataToUpdate.images
        result = await firstValueFrom(this.reportsService.update(dataToUpdate, this.reportCreated_id))
        this.activeConclutions = true
      }
      this.reportCreated_id = result?.id
      if (result?.error) {
        toast.error(result.error)
        this.disableButton = false
        this.activeConclutions = false
        this.showAddAuditorForm = false
        return
      }
      this.handleSuccessResponse()
    } catch (error: any) {
      this.disableButton = false
      this.activeConclutions = false
      this.showAddAuditorForm = false
      console.error("Error al actualizar el reporte:", error)
      toast.error(error?.message || "Error al actualizar el reporte.")
    }
  }

  private handleSuccessResponse() {
    this.hiddenButtonCreation = true
    this.disableButton = false
    if (this.activeSection === "conclusions") {
      this.selectedImages = []
      this.selectedAdditionalAuditors = []
      this.reportCreated_id = 0
      toast.success("Reporte finalizado")
      this.changeSection("title")
      this.cancel()
      this.activeConclutions = false
      this.showAddAuditorForm = false
    } else {
      toast.success("Sección guardada y avanzando")
      this.changeSection("conclusions")
    }
  }
  normalizeUrl(baseUrl: string, path: string): string {
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
    const cleanPath = path.startsWith("/") ? path : "/" + path
    return cleanBaseUrl + cleanPath
  }

  onOptionSelected(option: AuditorOption): void {
    this.onChange(option.value)
    this.reportFormGroup.patchValue({
      auditor: this.titleCasePipe.transform(option.displayText),
    })
    this.onTouched()
  }
  displayFn(option: AuditorOption | string): any {
    if (option && typeof option === "object") {
      return option
    }
    return option as string
  }
  toggleAdditionalAuditorForm(): void {
    this.showAddAuditorForm = !this.showAddAuditorForm
    if (!this.showAddAuditorForm) {
      this.reportFormGroup.patchValue({ additionalAuditors: "" })
    }
  }
  closeDialog(): void | null {
    this.dialogRef.close({ event: "Cancel" })
  }
}