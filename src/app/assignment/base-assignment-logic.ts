import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { SwalService } from '../services/swal.service';
import { AssignmentService } from './services/assignment.service';
import { toast } from 'ngx-sonner';
import { ICreateFamily, IEmployee, IEmployeeFamily, ITypesAssignment } from './intefaces/assignment.interface';
import { IProduct } from '../medical-supplies/interfaces/medical-supplies.interface';
import { IUser } from '../users/interfaces/users.interface';

export function noSpecialCharactersValidator(control: AbstractControl): ValidationErrors | null { 
  console.log("Validador: control.value" , control.value)
  if (!control.value) {
    return null
  }

  const value = typeof control.value === "string" ? control.value : ""
  const allowedCharactersRegex = /^[a-zA-Z0-9\s,.\-]+$/

  if (!allowedCharactersRegex.test(value)) {
    return { hasSpecialCharacters: true }
  }

  return null
}

export function onlyNumbersValidator(control: AbstractControl): ValidationErrors | null { 
  const value = control.value;
  if (!value) {
    return null;
  }
  
  const onlyNumbersRegex = /^\d+$/; 
  
  if (typeof value === "string" && !onlyNumbersRegex.test(value)) {
    return { hasSpecialCharacters: true };
  }
  
  return null;
}

export abstract class BaseAssignmentLogic {
  selectedProduct!: IProduct
  disableButton = false

  employees: IEmployee[] = []
  doctors: IUser[] = []
  listFamily: IEmployeeFamily[] = []
  listTypesAssignment: ITypesAssignment[] = []

  showNewFamilyMemberForm = false
  showNewEmployeeForm = false

  public filteredEmployeesOptions!: Observable<IEmployee[]>
  public filteredDoctorsOptions!: Observable<IUser[]>

  protected formBuilder: FormBuilder
  protected swalService: SwalService
  protected assignmentService: AssignmentService

  constructor(formBuilder: FormBuilder, swalService: SwalService, assignmentService: AssignmentService) {
    this.formBuilder = formBuilder
    this.swalService = swalService
    this.assignmentService = assignmentService
  }

  protected abstract buildAssignmentForm(): void

  protected abstract get controlEmployee(): any

  protected abstract get controlMedico(): any

  protected abstract get controlRecipient(): any

  protected abstract get controlProducts(): any

  protected abstract get controlFamily(): any

  protected abstract get controlType(): any

  protected abstract get controlObservation(): any

  async loadInitialData() {
    this.assignmentService.getEmployees().subscribe((employees: IEmployee[]) => {
      this.employees = employees
      console.log("Lista de empleados:", this.employees)
      this.setupEmployeeAutocomplete()
    })

    this.assignmentService.getDoctors().subscribe((doctors: IUser[]) => {
      this.doctors = doctors
      console.log("Lista de médicos:", this.doctors)
      this.setupDoctorAutocomplete()
    })

    this.assignmentService.getAllTypesAssignment().subscribe((listTypesAssignment: ITypesAssignment[]) => {
      this.listTypesAssignment = listTypesAssignment
    })
  }

  protected setupEmployeeAutocomplete(): void {
  }

  protected setupDoctorAutocomplete(): void { }

  setupFormDynamics() {
    this.updateFormOnRecipientChange(this.controlRecipient.value)

    this.controlRecipient.valueChanges.subscribe((recipient: "employee" | "mobile-warehouse") => {
      this.updateFormOnRecipientChange(recipient)
    })

    this.controlEmployee.valueChanges
      .pipe(
        switchMap((selectedEmployee: IEmployee) => {
          this.controlFamily.disable()
          this.listFamily = []
          this.controlFamily.setValue(null)

          if (selectedEmployee?.id) {
            return this.assignmentService.getFamiliesByEmployee(selectedEmployee.id)
          } else {
            this.showNewFamilyMemberForm = false
            return of([])
          }
        }),
      )
      .subscribe((familiares: IEmployeeFamily[]) => {
        this.listFamily = familiares
        console.log("Familiares: ", familiares)
        if (this.listFamily.length > 0) {
          this.controlFamily.enable()
        }
      })
  }

  updateFormOnRecipientChange(recipient: "employee" | "mobile-warehouse") { console.log("cambio el destinariop***")
    const productsControl = this.controlProducts
    const employeeControl = this.controlEmployee
    const medicoControl = this.controlMedico
    const familyControl = this.controlFamily
    const controlType = this.controlType
    const controlObservation = this.controlObservation

    if (productsControl) {
      productsControl.clearValidators()

      const baseValidators = [
        Validators.required, 
        onlyNumbersValidator
      ];

      productsControl.setValue(null)
      controlType.setValue(null)
      controlObservation.setValue(null)

      if (recipient === "employee") {
        productsControl.setValidators([...baseValidators, Validators.min(1), Validators.max(3) ])
      } else {
        productsControl.setValidators([...baseValidators, Validators.min(4) ])
      }
      productsControl.updateValueAndValidity()
      productsControl.markAsUntouched()
    }

    employeeControl.setValue(null)
    medicoControl.setValue(null)
    familyControl.setValue(null)
    familyControl.disable()
    this.listFamily = []

    if (recipient === "employee") {
      const currentValidators = employeeControl.validator ? [employeeControl.validator] : []
      employeeControl.setValidators([Validators.required, noSpecialCharactersValidator])
      medicoControl.clearValidators()
      medicoControl.disable()
      employeeControl.enable()
    } else {
      const currentValidators = medicoControl.validator ? [medicoControl.validator] : []
      medicoControl.setValidators([Validators.required, noSpecialCharactersValidator])
      employeeControl.clearValidators()
      employeeControl.disable()
      medicoControl.enable()
    }
    employeeControl.updateValueAndValidity()
    medicoControl.updateValueAndValidity()

    medicoControl.markAsUntouched()
    medicoControl.markAsPristine()
    employeeControl.markAsUntouched()
    employeeControl.markAsPristine()
    controlType.markAsUntouched()
    controlType.markAsPristine()

    this.showNewEmployeeForm = false
    this.showNewFamilyMemberForm = false
  }

  get checkPropId() {
    return this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined
  }

  displayFn(target: IEmployee | IUser): string {console.log(target)
    if (!target) return ""
    if ("cedula" in target) {
      return `${target.name} - ${target.cedula}`
    } else if ("email" in target && "cedula" in target) {
      return `${target.name} - ${target.cedula} - ${target.email}`
    } else if ("email" in target) {
      return `${target.name} - ${target.email}`
    }
    return ""
  }

  protected _filterEmployees(value: string): IEmployee[] {
    const filterValue = value.toLowerCase()
    return this.employees.filter(
      (option) => option.name.toLowerCase().includes(filterValue) || option.cedula.toLowerCase().includes(filterValue),
    )
  }

  protected _filterDoctors(value: string): IUser[] {
    const filterValue = value.toLowerCase()
    return this.doctors.filter(
      (option) => option.name.toLowerCase().includes(filterValue) || option.email.toLowerCase().includes(filterValue),
    )
  }

  toggleNewFamilyMemberForm(): void {
    this.showNewFamilyMemberForm = !this.showNewFamilyMemberForm
    this.showNewEmployeeForm = false
    if (!this.showNewFamilyMemberForm) {
      this.formBuilder
        .group({
          name: ["", Validators.required],
          documentId: [null, [Validators.maxLength(10)]],
        })
        .reset()
    }
  }

  toggleNewEmployeeForm(): void {
    this.showNewEmployeeForm = !this.showNewEmployeeForm
    this.showNewFamilyMemberForm = false
    if (!this.showNewEmployeeForm) {
      this.formBuilder
        .group({
          name: ["", [Validators.required, Validators.maxLength(200)]],
          cedula: ["", [Validators.required, Validators.maxLength(10)]],
          email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
          phone: ["", [Validators.required, Validators.maxLength(50)]],
        })
        .reset()
    }
  }

  saveFamilyMember(familyMemberForm: any, employeeId: number, controlFamily: any): void {
    if (familyMemberForm.valid && employeeId) {
      const { name, cedulaType, cedulaNumber } = familyMemberForm.value;
      const fullCedula = `${cedulaType}-${cedulaNumber}`;

      const newFamilyMember: ICreateFamily = {
        employeeId: employeeId,
        name,
        cedula: fullCedula,
      }
      this.assignmentService.addFamilyMember(newFamilyMember).subscribe((savedMember) => {
        this.listFamily.push(savedMember)
        console.log(" listFamily ", this.listFamily)
        controlFamily.setValue(savedMember.familyId)
        this.showNewFamilyMemberForm = false
        familyMemberForm.reset()
        toast.success("Familiar agregado correctamente.")
        if (this.listFamily.length > 0) {
          controlFamily.enable()
        }
      })
    } else {
      familyMemberForm.markAllAsTouched()
      toast.error("Por favor, complete los campos del familiar.")
    }
  }

  saveEmployee(employeeForm: any, employeeControl: any, filteredEmployeesOptions: Observable<IEmployee[]>): void {
    
    if (employeeForm.valid) {
      console.log("employeeForm ", employeeForm)
      console.log(" employeeForm.value ",  employeeForm.value)
      const {
            name,
            cedulaType,
            cedulaNumber,
            email,
            phone
          } = employeeForm.value

      const fullCedula = `${cedulaType}-${cedulaNumber}`;

      const newEmployee: IEmployee = {
        name,
        cedula: fullCedula,
        email,
        phone
      }
      console.log("newEmployee ", newEmployee)
      this.assignmentService.addEmployee(newEmployee).subscribe((savedEmployee) => {
        this.employees.push(savedEmployee)
        this.filteredEmployeesOptions = employeeControl.valueChanges.pipe(
          startWith(savedEmployee),
          map((value: any) =>
            typeof value === "string" ? this._filterEmployees(value) : this._filterEmployees(value?.name || ""),
          ),
        )
        employeeControl.setValue(savedEmployee)
        this.showNewEmployeeForm = false
        employeeForm.reset()
        toast.success("Empleado guardado.")
      })
    } else {
      employeeForm.markAllAsTouched()
      toast.error("Por favor, complete los campos del empleado.")
    }
  }

   preventNonInteger(event: KeyboardEvent) {
    const regex = /[0-9]/;
    const key = event.key;

    if (!regex.test(key) &&
        !event.ctrlKey &&
        !event.metaKey &&
        key.length === 1
    ) {
      event.preventDefault();
    }
  }
}