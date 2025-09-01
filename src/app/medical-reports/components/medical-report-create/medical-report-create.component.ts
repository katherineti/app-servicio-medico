import { Component, type OnInit, inject } from "@angular/core"
import { FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { MedicalReportsService } from "../../services/medical-reports.service"
import { PatientsService } from "../../../patients/services/patients.service"
import type { IGetAllPatients, IPatient } from "../../../patients/interfaces/patients.interface"
import type { IGetAllUsers, IUser } from "../../../users/interfaces/users.interface"
import { UsersService } from "../../../users/services/users.service"
import { Observable, startWith, map, debounceTime, distinctUntilChanged } from "rxjs"
import { MatSnackBar } from "@angular/material/snack-bar"
import { ICreateDTO } from "../../interfaces/medical-reports.interface"
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from "@angular/material/core"
import { MY_DATE_FORMATS } from "../../../services/date-format.service"
import { toast } from "ngx-sonner"
import { SwalService } from "../../../services/swal.service"
import Swal, { SweetAlertResult } from "sweetalert2"

@Component({
  selector: "app-medical-report-create",
  templateUrl: "./medical-report-create.component.html",
  styleUrls: ["./medical-report-create.component.scss"],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
    providers: [ 
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-VE' },
  ],
})
export class MedicalReportCreateComponent implements OnInit {
  medicalReportForm!: FormGroup
  patients: IPatient[] = []
  filteredPatients: Observable<IPatient[]> = new Observable()
  doctors: IUser[] = []
  filteredDoctors: Observable<IUser[]> = new Observable()
  isSubmitting = false
  isLoadingPatients = false
  isLoadingDoctors = false

  private fb = inject(FormBuilder)
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)
  private medicalReportsService = inject(MedicalReportsService)
  private patientsService = inject(PatientsService)
  private usersService = inject(UsersService)
  public swalService = inject(SwalService)

  // Helper function to capitalize the first letter of each word (now static)
  static capitalizeWords(str: string): string {
    if (!str) return ""
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  ngOnInit() {
    this.initializeForm()
    this.loadPatients()
    this.loadDoctors()
    this.setupPatientAutocomplete()
    this.setupDoctorAutocomplete()
  }

  private initializeForm() {
    this.medicalReportForm = this.fb.group({
      elaborationDate: [new Date(), [Validators.required]],
      apsCenter: ["", [Validators.required, Validators.maxLength(100)]],
      insurance: ["", [Validators.required, Validators.maxLength(100)]],
      patientId: ["", [Validators.required]],
      doctorId: ["", [Validators.required]],
      patientSearch: [""],
      doctorSearch: [""],
      report: ["", [Validators.required, Validators.minLength(50), Validators.maxLength(700)]],
      mppsCM: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }

  // --- Autocomplete para Pacientes ---
  private setupPatientAutocomplete() {
    this.filteredPatients = this.medicalReportForm.get("patientSearch")!.valueChanges.pipe(
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
    const capitalizedName = MedicalReportCreateComponent.capitalizeWords(patient.name || "")
    const displayValue =
      patient.cedula && patient.cedula !== "V-" ? `${capitalizedName} - ${patient.cedula}` : capitalizedName
    this.medicalReportForm.patchValue({
      patientId: patient.id,
      patientSearch: displayValue,
    })
  }

  displayPatientFn = (patientOrString: IPatient | string): string => {
    if (typeof patientOrString === "string") {
      return MedicalReportCreateComponent.capitalizeWords(patientOrString)
    }
    const name = MedicalReportCreateComponent.capitalizeWords(patientOrString.name || "")
    const cedula = patientOrString.cedula || ""
    return cedula && cedula !== "V-" ? `${name} - ${cedula}` : name
  }

  clearPatientSelection() {
    this.medicalReportForm.patchValue({
      patientId: "",
      patientSearch: "",
    })
  }

  // --- Autocomplete para Doctores ---
  private setupDoctorAutocomplete() {
    this.filteredDoctors = this.medicalReportForm.get("doctorSearch")!.valueChanges.pipe(
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
    const capitalizedName = MedicalReportCreateComponent.capitalizeWords(doctor.name || "")
    const displayValue =
      doctor.cedula && doctor.cedula !== "V-" ? `${capitalizedName} - ${doctor.cedula}` : capitalizedName
    this.medicalReportForm.patchValue({
      doctorId: doctor.id,
      doctorSearch: displayValue,
    })
  }

  displayDoctorFn = (doctorOrString: IUser | string): string => {
    if (typeof doctorOrString === "string") {
      return MedicalReportCreateComponent.capitalizeWords(doctorOrString)
    }
    const name = MedicalReportCreateComponent.capitalizeWords(doctorOrString.name || "")
    const cedula = doctorOrString.cedula || ""
    return cedula && cedula !== "V-" ? `${name} - ${cedula}` : name
  }

  clearDoctorSelection() {
    this.medicalReportForm.patchValue({
      doctorId: "",
      doctorSearch: "",
    })
  }

  // --- Carga de Datos Inicial ---
  private loadPatients() {
    this.isLoadingPatients = true
    const parms: IGetAllPatients = {
      page: 1,
      take: 200,
      patientCedula: "",
    }

    this.patientsService.getAll(parms).subscribe({
      next: (response) => {
        // this.patients = response.list.filter((patient) => patient.isActivate)
        this.patients = response.list
        this.isLoadingPatients = false
      },
      error: (error) => {
        this.showError("Error al cargar pacientes")
        this.isLoadingPatients = false
      },
    })
  }

  private loadDoctors() {
    this.isLoadingDoctors = true
    const parms: IGetAllUsers = {
      page: 1,
      take: 200,
      name: "",
    }

    this.usersService.getUsers(parms).subscribe({
      next: (response) => {
        // Filtra usuarios con rol de "médico" o "admin" y que estén activos
        this.doctors = response.list.filter(
          (user) => (user.role?.toLowerCase() === "médico" || user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "admin RRHH") && user.isActivate,
        )
        this.isLoadingDoctors = false
      },
      error: (error) => {
        this.showError("Error al cargar doctores")
        this.isLoadingDoctors = false
      },
    })
  }
  // --- Métodos de Formulario y UI ---
  async confirmOnSubmit() {
    const confirmAlert: SweetAlertResult<any> = await this.swalService.confirmReportMedical();
    if (confirmAlert.isConfirmed) {
      this.onSubmit();

    } else if (confirmAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel */
    }
  }

  onSubmit() {
    if (this.medicalReportForm.valid) {
      this.isSubmitting = true

      const formData:ICreateDTO = {
        //la fecha se carga automaticamente en el backend
        // elaborationDate: this.medicalReportForm.value.elaborationDate.toISOString(), 
        apsCenter: this.medicalReportForm.value.apsCenter,
        insurance: this.medicalReportForm.value.insurance,
        patientId: this.medicalReportForm.value.patientId,
        doctorId: this.medicalReportForm.value.doctorId,
        description: this.medicalReportForm.value.report,//informe
        mppsCM: this.medicalReportForm.value.mppsCM
      }

      console.log("Datos a enviar:", formData)
      
      this.medicalReportsService.create(formData).subscribe({
        next: (response) => {
          this.swalService.success();
          // this.showSuccess("Informe médico creado exitosamente"); //snackbar
          // toast.error("Informe médico creado exitosamente")
          
          this.medicalReportForm.reset({ elaborationDate: new Date() }); // Resetear el formulario y establecer la fecha actual
          this.router.navigate(["/medical-reports"])
        },
        error: (error) => {
          if (typeof error === 'string' && error!='' ) {
            toast.error(error)
          }else{

            this.showError("Error al crear el informe médico")
          }
          this.isSubmitting = false
        },
      })
  

      // Simulación temporal
      setTimeout(() => {
        // this.showSuccess("Informe médico creado exitosamente")
        this.isSubmitting = false
        this.router.navigate(["/medical-reports"]);
      }, 2000)
    } else {
      this.markFormGroupTouched()
    }
  }

  onPreview() {
    if (this.medicalReportForm.valid) {
      const formData = this.medicalReportForm.value
      const selectedPatient = this.patients.find((p) => p.id === formData.patientId)
      const selectedDoctor = this.doctors.find((d) => d.id === formData.doctorId)

      console.log("Vista previa del informe:", {
        ...formData,
        patientInfo: selectedPatient,
        doctorInfo: selectedDoctor,
      })

      // this.showSuccess("Vista previa generada (ver consola)")
      this.showSuccess("Vista previa generada ")
    } else {
      this.showError("Complete todos los campos requeridos para la vista previa")
    }
  }

  onCancel() {
    if (this.medicalReportForm.dirty) {
      const confirmLeave = confirm("¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.")
      if (confirmLeave) {
        this.router.navigate(["/medical-reports"])
      }
    } else {
      this.router.navigate(["/medical-reports"])
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.medicalReportForm.controls).forEach((key) => {
      const control = this.medicalReportForm.get(key)
      control?.markAsTouched()
    })
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, "Cerrar", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    })
  }

  private showError(message: string) {
    this.snackBar.open(message, "Cerrar", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    })
  }
}
