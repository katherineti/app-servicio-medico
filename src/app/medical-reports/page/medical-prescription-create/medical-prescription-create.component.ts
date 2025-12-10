import { Component, type OnInit, inject } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router" 
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { FeatherIconsModule } from "../../../feathericons/feathericons.module"
import { MatSnackBar } from "@angular/material/snack-bar"
import { MedicalReportsService } from "../../services/medical-reports.service"
import { PatientsService } from "../../../patients/services/patients.service"
import { UsersService } from "../../../users/services/users.service"
import type { IPatient } from "../../../patients/interfaces/patients.interface"
import type { IUser } from "../../../users/interfaces/users.interface"
import type { ICreateMedicalPrescriptionDTO, IMedicalReports } from "../../interfaces/medical-reports.interface"
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from "@angular/material/core"
import { MY_DATE_FORMATS } from "../../../services/date-format.service"
import { MedicalPrescriptionService } from "../../services/medical-prescription.service"
import { capitalizeWords } from "../../../utils/string-utils"
import { Observable, startWith, map, debounceTime, distinctUntilChanged, forkJoin } from "rxjs" 
import { toast } from "ngx-sonner"
import { AuthService } from "../../../services/auth.service"
import Swal, { SweetAlertResult } from "sweetalert2"
import { SwalService } from "../../../services/swal.service"

@Component({
  selector: "app-medical-prescription-create",
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FeatherIconsModule],
  templateUrl: "./medical-prescription-create.component.html",
  styleUrls: ["./medical-prescription-create.component.scss"],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es-VE" },
  ],
})
export class MedicalPrescriptionCreateComponent implements OnInit {
  role = ""
  prescriptionForm!: FormGroup
  medicalReportId: string | null = null
  medicalReport: IMedicalReports | null = null
  patients: IPatient[] = []
  filteredPatients: Observable<IPatient[]> = new Observable()
  doctors: IUser[] = []
  filteredDoctors: Observable<IUser[]> = new Observable()
  isSubmitting = false
  isLoadingData = true
  isLoadingPatients = false
  isLoadingDoctors = false
  capitalizeWords = capitalizeWords

  private fb = inject(FormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private snackBar = inject(MatSnackBar)
  private medicalReportsService = inject(MedicalReportsService)
  private patientsService = inject(PatientsService)
  private usersService = inject(UsersService)
  private medicalPrescriptionService = inject(MedicalPrescriptionService)
  private authService = inject(AuthService)
   private swalService = inject(SwalService);
  async ngOnInit(): Promise<void> {
    this.role = await this.authService.getRol()
    this.medicalReportId = this.route.snapshot.paramMap.get("reportId")
    this.initializeForm()
    this.loadInitialData()
    this.setupPatientAutocomplete()
    this.setupDoctorAutocomplete()
  }

  private initializeForm(): void {
    this.prescriptionForm = this.fb.group({
      place: ["", [Validators.required, Validators.maxLength(100)]],
      emissionDate: [{ value: new Date(), disabled: true }, [Validators.required]],
      expirationDate: ["", [Validators.required]],
      recipeContent: ["", [Validators.required, Validators.maxLength(700)]],
      doctorId: ["", [Validators.required]],
      doctorSearch: [""], 
      mppsNumber: ["", [Validators.required, Validators.maxLength(100)]],
      patientId: ["", [Validators.required]],
      patientSearch: [""], 
      indications: ["", [Validators.maxLength(700)]],
    })
  }

  private loadInitialData(): void {
    this.isLoadingData = true
    this.isLoadingPatients = true
    this.isLoadingDoctors = true

    const loadPatients$ = this.patientsService.getAll({ page: 1, take: 200, patientCedula: "" }).pipe(
      map((response) => {
        this.patients = response.list
        this.isLoadingPatients = false
      }),
    )

    const loadDoctors$ = this.usersService.getUsers({ page: 1, take: 200, name: "" }).pipe(
      map((response) => {
        this.doctors = response.list.filter(
          (user) => (user.role?.toLowerCase() === "médico" || user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "admin RRHH") && user.isActivate,
        )
        this.isLoadingDoctors = false
      }),
    )

    forkJoin([loadPatients$, loadDoctors$]).subscribe({
      next: () => {
        if (this.medicalReportId) {
          console.log("this.medicalReportId",this.medicalReportId)
          this.medicalReportsService.getMedicalReportById(this.medicalReportId).subscribe({
            next: (report) => {
              console.log("report",report)
              this.medicalReport = report
              const selectedDoctor = this.doctors.find((d) => d.id === report.doctorId)
              const selectedPatient = this.patients.find((p) => p.id === report.patientId)

              this.prescriptionForm.patchValue({
                doctorId: report.doctorId,
                patientId: report.patientId,
                mppsNumber: report.mppsCM,
                doctorSearch: selectedDoctor ? this.displayDoctorFn(selectedDoctor) : "",
                patientSearch: selectedPatient ? this.displayPatientFn(selectedPatient) : "",
              })
              console.log("this.prescriptionForm",this.prescriptionForm)
              this.isLoadingData = false
            },
            error: (error) => {
              this.showError("Error al cargar el informe médico asociado.")
              this.isLoadingData = false
              this.router.navigate(["/medical-reports"])
            },
          })
        } else {
          this.isLoadingData = false
        }
      },
      error: (error) => {
        this.showError("Error al cargar datos iniciales (pacientes/doctores).")
        this.isLoadingData = false
        this.isLoadingPatients = false
        this.isLoadingDoctors = false
      },
    })
  }
  private setupPatientAutocomplete() {
    this.filteredPatients = this.prescriptionForm.get("patientSearch")!.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      distinctUntilChanged(),
      map((value) => {
        const searchValue = typeof value === "string" ? value : ""
        return this.filterPatients(searchValue)
      }),
    )
  }
  private filterPatients(value: string): IPatient[] {
    if (!value || value.trim() === "") {
      return this.patients
    }
    const filterValue = value.toLowerCase().trim()
    return this.patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(filterValue) || patient.cedula?.toLowerCase().includes(filterValue),
    )
  }

  onPatientSelected(patient: IPatient) {
    const capitalizedName = this.capitalizeWords(patient.name || "")
    const displayValue =
      patient.cedula && patient.cedula !== "V-" ? `${capitalizedName} - ${patient.cedula}` : capitalizedName
    this.prescriptionForm.patchValue({
      patientId: patient.id,
      patientSearch: displayValue,
    })
  }

  displayPatientFn = (patientOrString: IPatient | string): string => {
    if (typeof patientOrString === "string") {
      return this.capitalizeWords(patientOrString)
    }
    const name = this.capitalizeWords(patientOrString.name || "")
    const cedula = patientOrString.cedula || ""
    return cedula && cedula !== "V-" ? `${name} - ${cedula}` : name
  }

  clearPatientSelection() {
    this.prescriptionForm.patchValue({
      patientId: "",
      patientSearch: "",
    })
  }
  private setupDoctorAutocomplete() {
    this.filteredDoctors = this.prescriptionForm.get("doctorSearch")!.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      distinctUntilChanged(),
      map((value) => {
        const searchValue = typeof value === "string" ? value : ""
        return this.filterDoctors(searchValue)
      }),
    )
  }

  private filterDoctors(value: string): IUser[] {
    if (!value || value.trim() === "") {
      return this.doctors
    }

    const filterValue = value.toLowerCase().trim()

    return this.doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(filterValue) ||
        doctor.cedula?.toLowerCase().includes(filterValue) ||
        doctor.email?.toLowerCase().includes(filterValue),
    )
  }

  onDoctorSelected(doctor: IUser) {
    const capitalizedName = this.capitalizeWords(doctor.name || "")
    const displayValue =
      doctor.cedula && doctor.cedula !== "V-" ? `${capitalizedName} - ${doctor.cedula}` : capitalizedName
    this.prescriptionForm.patchValue({
      doctorId: doctor.id,
      doctorSearch: displayValue,
    })
  }

  displayDoctorFn = (doctorOrString: IUser | string): string => {
    if (typeof doctorOrString === "string") {
      return this.capitalizeWords(doctorOrString)
    }
    const name = this.capitalizeWords(doctorOrString.name || "")
    const cedula = doctorOrString.cedula || ""
    return cedula && cedula !== "V-" ? `${name} - ${cedula}` : name
  }
  clearDoctorSelection() {
    this.prescriptionForm.patchValue({
      doctorId: "",
      doctorSearch: "",
      mppsNumber: "", 
    })
  }

  async confirmOnSubmit() {
    if(this.role === "admin" || this.role === 'admin RRHH' ){
      this.onSubmit()
    }
    else{
      const confirmAlert: SweetAlertResult<any> = await this.swalService.confirmReportMedical();
      if (confirmAlert.isConfirmed) {
        this.onSubmit();
  
      } else if (confirmAlert.dismiss === Swal.DismissReason.cancel) {
      }
    }
  }

  onSubmit(): void {
    if (this.prescriptionForm.valid) {
      this.isSubmitting = true;
      const fechaConTiempo: string = this.prescriptionForm.value.expirationDate.toISOString();
      const partesFecha: string[] = fechaConTiempo.split('T');
      const soloFecha: string = partesFecha[0];

      const formData: ICreateMedicalPrescriptionDTO = {
        place: this.prescriptionForm.value.place,
        recipeContent: this.prescriptionForm.value.recipeContent,
        doctorId: this.prescriptionForm.value.doctorId,
        mpps: this.prescriptionForm.value.mppsNumber,
        patientId: this.prescriptionForm.value.patientId,
        indications: this.prescriptionForm.value.indications,
        medicalReportId: this.medicalReportId || undefined,
        expirationDate: this.prescriptionForm.value.expirationDate? soloFecha : '',
      }

      console.log("Datos del recipe a enviar:", formData)

      this.medicalPrescriptionService.createMedicalPrescription(formData).subscribe({
        next: (response) => {
          this.showSuccess("Recipe creado exitosamente")
          this.isSubmitting = false
          this.router.navigate(["/medical-reports"])
        },
        error: (error) => {
          if (typeof error === 'string' && error!='' ) {
            toast.error(error)
          }else{
            this.showError("Error al crear el recipe")
          }
          this.isSubmitting = false
        },
      })
    } else {
      this.markFormGroupTouched(this.prescriptionForm)
    }
  }

  onPreview() {
    if (this.prescriptionForm.valid) {
      const formData = this.prescriptionForm.value
      const selectedPatient = this.patients.find((p) => p.id === formData.patientId)
      const selectedDoctor = this.doctors.find((d) => d.id === formData.doctorId)

      console.log("Vista previa del recipe:", {
        ...formData,
        patientInfo: selectedPatient,
        doctorInfo: selectedDoctor,
      })

      this.showSuccess("Vista previa generada (ver consola)")
    } else {
      this.showError("Complete todos los campos requeridos para la vista previa")
    }
  }

  onCancel(): void {
    if (this.prescriptionForm.dirty) {
      const confirmLeave = confirm("¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.")
      if (confirmLeave) {
        this.router.navigate(["/medical-reports"])
      }
    } else {
      this.router.navigate(["/medical-reports"])
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched()
    })
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    })
  }

  private showError(message: string): void {
    this.snackBar.open(message, "Cerrar", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    })
  }
}