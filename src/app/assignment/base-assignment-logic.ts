 import { CommonModule } from '@angular/common';
import { Component, Inject, inject, model, OnInit } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { SwalService } from '../services/swal.service';
import { AssignmentService } from './services/assignment.service';
import { toast } from 'ngx-sonner';
import { ICreateFamily, IEmployee, IEmployeeFamily, ITypesAssignment } from './intefaces/assignment.interface';
import { IProduct } from '../medical-supplies/interfaces/medical-supplies.interface';
import { IUser } from '../users/interfaces/users.interface';
 
/* import { type FormBuilder, Validators } from "@angular/forms"
import { type Observable, of, map, switchMap, startWith } from "rxjs"
import type { AssignmentService } from "./services/assignment.service"
import type { SwalService } from "../services/swal.service"
import type {
  ICreateFamily,
  IEmployee,
  IEmployeeFamily,
  ITypesAssignment,
  IProduct,
  IUser,
} from "./intefaces/assignment.interface"
import { toast } from "ngx-sonner" */

export abstract class BaseAssignmentLogic {
  selectedProduct!: IProduct
  disableButton = false

  employees: IEmployee[] = []
  doctors: IUser[] = []
  listFamily: IEmployeeFamily[] = []
  listTypesAssignment: ITypesAssignment[] = []

  showNewFamilyMemberForm = false
  showNewEmployeeForm = false
  // showNewDoctorForm = false; // Temporarily disabled

  // Declaraciones de las propiedades de autocompletado movidas a la clase base
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

  // Método abstracto que debe ser implementado por la clase hija para construir el formulario
  protected abstract buildAssignmentForm(): void

  // Método abstracto para obtener el control del formulario para el empleado
  protected abstract get controlEmployee(): any

  // Método abstracto para obtener el control del formulario para el médico
  protected abstract get controlMedico(): any

  // Método abstracto para obtener el control del formulario para el destinatario
  protected abstract get controlRecipient(): any

  // Método abstracto para obtener el control del formulario para los productos
  protected abstract get controlProducts(): any

  // Método abstracto para obtener el control del formulario para la familia
  protected abstract get controlFamily(): any

  // Método abstracto para obtener el control del formulario para el tipo de asignación
  protected abstract get controlType(): any

  // Método abstracto para obtener el control del formulario para la observación
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
    // Implementado en la clase hija
  }

  protected setupDoctorAutocomplete(): void {
    // Implementado en la clase hija
  }

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

  updateFormOnRecipientChange(recipient: "employee" | "mobile-warehouse") {
    const productsControl = this.controlProducts
    const employeeControl = this.controlEmployee
    const medicoControl = this.controlMedico
    const familyControl = this.controlFamily

    if (productsControl) {
      productsControl.clearValidators()
      if (recipient === "employee") {
        productsControl.setValidators([Validators.required, Validators.min(1), Validators.max(3)])
      } else {
        productsControl.setValidators([Validators.required, Validators.min(4)])
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
      employeeControl.setValidators([Validators.required])
      medicoControl.clearValidators()
      medicoControl.disable()
      employeeControl.enable()
    } else {
      medicoControl.setValidators([Validators.required])
      employeeControl.clearValidators()
      employeeControl.disable()
      medicoControl.enable()
    }
    employeeControl.updateValueAndValidity()
    medicoControl.updateValueAndValidity()

    this.showNewEmployeeForm = false
    // this.showNewDoctorForm = false;
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

/*
  protected assignProduct(formData: any, productId: number) {
    this.swalService.loading()
    this.disableButton = true

    const { products, employee, medico, family, type, observation, recipient } = formData

    const obj: any = {
      type: type.id,
      observation: observation,
      productId: productId,
      products: products,
      // quantity: products,
      // assignmentTypeId: type.id,
      employeeId: null,
      medicoId: null,
    }

    if (recipient === "employee") {
      obj.employeeId = employee.id
      if (family) {
        obj.familyId = family
      }
    } else if (recipient === "mobile-warehouse") {
      obj.medicoId = medico.id
    }

    console.log("Objeto para guardar: ", obj)

    this.assignmentService.createAssignment(obj).subscribe({
      complete: () => {
        // Resetting form and closing dialog will be handled by the component
/*         toast.success("Asignación de producto realizado con éxito.")
        this.swalService.closeload()
        this.disableButton = false * /

          this.AssignProductForm.reset();
          toast.success("Asignación de producto realizado con éxito.");
          this.closeDialog();
      },
      error: (error) => {
        this.swalService.closeload()
        this.disableButton = false
        toast.error(error.message || "Error al crear la asignación de producto.")
        console.error("Error al crear la asignación de producto", error)
      },
    })
  }
  */

  toggleNewFamilyMemberForm(): void {
    this.showNewFamilyMemberForm = !this.showNewFamilyMemberForm
    this.showNewEmployeeForm = false
    // this.showNewDoctorForm = false;
    if (!this.showNewFamilyMemberForm) {
      // Reset the form directly using a new FormGroup instance
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
    // this.showNewDoctorForm = false;
    if (!this.showNewEmployeeForm) {
      // Reset the form directly using a new FormGroup instance
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
      const { name, documentId } = familyMemberForm.value
      const newFamilyMember: ICreateFamily = {
        employeeId: employeeId,
        name,
        cedula: documentId,
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

/*       const newEmployee: IEmployee = {
        id: 0,
        ...employeeForm.value,
      } */
      const newEmployee: IEmployee = {
        name,
        cedula: fullCedula,
        email,
        phone
      }
      console.log("newEmployee ", newEmployee)
      this.assignmentService.addEmployee(newEmployee).subscribe((savedEmployee) => {
        this.employees.push(savedEmployee)
        // Re-initialize filtered options for employees to include the new one
        // Assign to 'this.filteredEmployeesOptions' directly
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
}
