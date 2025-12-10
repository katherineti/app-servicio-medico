import { CommonModule } from "@angular/common"
import { Component, Inject, type OnInit } from "@angular/core"
import { MaterialModule } from "../material/material.module"
import {  FormBuilder, FormControl, type FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { map, startWith } from "rxjs"
import  { SwalService } from "../services/swal.service"
import  { AssignmentService } from "./services/assignment.service"
import { toast } from "ngx-sonner"
import { FeatherIconsModule } from "../feathericons/feathericons.module"
import { MatIconModule } from "@angular/material/icon"
import { BaseAssignmentLogic, noSpecialCharactersValidator, onlyNumbersValidator } from "./base-assignment-logic" 
import { AuthService } from "../services/auth.service"

@Component({
  selector: "app-assignment",
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, FeatherIconsModule, MatIconModule],
  templateUrl: "./assignment.component.html",
  styleUrl: "./assignment.component.scss",
})
export class AssignmentComponent extends BaseAssignmentLogic implements OnInit {
  AssignProductForm!: FormGroup
  familyMemberForm!: FormGroup
  employeeForm!: FormGroup
  role = ""

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AssignmentComponent>,
    public  authService: AuthService,
    protected override  formBuilder: FormBuilder,
    protected override swalService: SwalService,
    protected override assignmentService: AssignmentService,
  ) {
    super(formBuilder, swalService, assignmentService)

    this.buildAssignmentForm()

    this.familyMemberForm = this.formBuilder.group({
      name: ["", Validators.required],
      cedulaType: ['', [Validators.required]],
      cedulaNumber: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/) 
      ]],
    })

    this.familyMemberForm.patchValue({
      cedulaType: 'V',
    }) 

    this.employeeForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200)]],
      cedulaType: ['V', [Validators.required]],
      cedulaNumber: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/) 
      ]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.pattern('^\\+?\\d+$'), Validators.maxLength(50)]],
    })
  }

  async ngOnInit() {
    this.role = await this.authService.getRol()

    this.selectedProduct = this.data
    console.log("Producto seleccionado: ", this.selectedProduct)
    if (this.data) {
      this.AssignProductForm.controls["name"].disable()
      this.AssignProductForm.patchValue({
        name: this.selectedProduct?.name,
      })

      await this.loadInitialData()
      this.setupFormDynamics()
    }
  }

  protected buildAssignmentForm() {
    this.AssignProductForm = this.formBuilder.group({
      recipient: ["employee", Validators.required],
      name: ["", [Validators.required, Validators.minLength(0), Validators.maxLength(100)]],
      products: [
        0,
        [
          Validators.required,
          onlyNumbersValidator,
          Validators.minLength(0),
          Validators.min(1),
          Validators.max(3), 
        ],
      ],
      employee: ["", [noSpecialCharactersValidator]],
      medico: ["", [noSpecialCharactersValidator]],
      family: [{ value: null, disabled: true }, []],
      type: ["", [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      observation: ["", [Validators.maxLength(200)]],
    })
    this.setupEmployeeAutocomplete();
  }

  get recipientControl(): FormControl {
    return this.AssignProductForm.get('recipient') as FormControl;
  }

  protected get controlEmployee() {
    return this.AssignProductForm.controls["employee"]
  }

  protected get controlMedico() {
    return this.AssignProductForm.controls["medico"]
  }

  protected get controlRecipient() {
    return this.AssignProductForm.controls["recipient"]
  }

  protected get controlProducts() {
    return this.AssignProductForm.controls["products"]
  }

  protected get controlFamily() {
    return this.AssignProductForm.controls["family"]
  }

  protected get controlType() {
    return this.AssignProductForm.controls["type"]
  }

  protected get controlObservation() {
    return this.AssignProductForm.controls["observation"]
  }

  protected override setupEmployeeAutocomplete(): void {
    this.filteredEmployeesOptions = this.controlEmployee.valueChanges.pipe(
      startWith(""),
      map((value) =>
        typeof value === "string" ? this._filterEmployees(value) : this._filterEmployees(value?.name || ""),
      ),
    )
  }

  protected override setupDoctorAutocomplete(): void {
    this.filteredDoctorsOptions = this.controlMedico.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? this._filterDoctors(value) : this._filterDoctors(value?.name || ""))),
    )
  }

  cancel() {
    this.closeDialog()
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: "Cancel" })
  }

  save() {
    if (this.AssignProductForm.invalid) {
      this.AssignProductForm.markAllAsTouched()
      this.swalService.closeload()
      this.disableButton = false
      toast.error("Por favor, complete todos los campos requeridos y válidos.")
      return
    }

    if (this.checkPropId) {
      this.assignProduct(this.AssignProductForm.value, this.selectedProduct.id)
    }
  }

  assignProduct(formData: any, productId: number) {
    this.swalService.loading()
    this.disableButton = true

    const { products, employee, medico, family, type, observation, recipient } = formData

    const obj: any = {
      type: type.id,
      observation: observation,
      productId: productId,
      products: products,
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
          this.AssignProductForm.reset();
          toast.success("Asignación de producto realizado con éxito.");
          this.closeDialog();
          this.swalService.closeload(); this.disableButton = false;
      },
      error: (error) => {
          this.swalService.closeload();
          this.disableButton = false;
          if( typeof error === 'string'){ toast.error(error) }else{  toast.error(error.message || "Error al crear la asignación de producto.")  }
          console.error('Error al crear la asignacion de producto', error);
      },
    })
  }

  override saveFamilyMember(): void {
    super.saveFamilyMember(this.familyMemberForm, this.controlEmployee.value.id, this.controlFamily)
  }

  override saveEmployee(): void {
    super.saveEmployee(this.employeeForm, this.controlEmployee, this.filteredEmployeesOptions)
  }

  cancelFamilyMember(): void {
    this.showNewFamilyMemberForm = false
    this.familyMemberForm.reset()
  }

  cancelEmployee(): void {
    this.showNewEmployeeForm = false
    this.employeeForm.reset()
  }
}