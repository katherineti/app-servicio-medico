/*import { CommonModule } from "@angular/common"
import { Component, Inject, inject, type OnInit } from "@angular/core"
import { MaterialModule } from "../material/material.module"
import { FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { map, type Observable, startWith } from "rxjs"
import  { SwalService } from "../services/swal.service"
import { AssignmentService } from "./services/assignment.service"
import { toast } from "ngx-sonner"
// import type { IEmployee, IUser } from "./intefaces/assignment.interface"
import type { IEmployee } from "./intefaces/assignment.interface"
import type { IUser } from '../users/interfaces/users.interface';
import { FeatherIconsModule } from "../feathericons/feathericons.module"
import { MatIconModule } from "@angular/material/icon"
import { BaseAssignmentLogic } from "./base-assignment-logic" // Importa la clase base
*/
import { CommonModule } from "@angular/common"
import { Component, Inject, type OnInit } from "@angular/core"
import { MaterialModule } from "../material/material.module"
import {  FormBuilder, FormControl, type FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog"
import { map, startWith } from "rxjs"
import  { SwalService } from "../services/swal.service"
import  { AssignmentService } from "./services/assignment.service"
import { toast } from "ngx-sonner"
import { FeatherIconsModule } from "../feathericons/feathericons.module"
import { MatIconModule } from "@angular/material/icon"
import { BaseAssignmentLogic } from "./base-assignment-logic" // Importa la clase base
import { AuthService } from "../services/auth.service"

@Component({
  selector: "app-assignment",
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, FeatherIconsModule, MatIconModule],
  templateUrl: "./assignment.component.html",
  styleUrl: "./assignment.component.scss",
})
export class AssignmentComponent extends BaseAssignmentLogic implements OnInit {
  // readonly dialogRef!: MatDialogRef<AssignmentComponent>
  AssignProductForm!: FormGroup
  familyMemberForm!: FormGroup
  employeeForm!: FormGroup
  role = ""

  // doctorForm!: FormGroup // Temporarily disabled

  // filteredEmployeesOptions y filteredDoctorsOptions ahora se heredan de BaseAssignmentLogic
  // No es necesario declararlos aquí nuevamente.
  // private authService = inject(AuthService)

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AssignmentComponent>,
    public  authService: AuthService,
    protected override  formBuilder: FormBuilder,
    protected override swalService: SwalService,
    protected override assignmentService: AssignmentService,
  ) {
    super(formBuilder, swalService, assignmentService) // Llama al constructor de la clase base

    // this.dialogRef = formBuilder as unknown as MatDialogRef<AssignmentComponent> // Inyección de MatDialogRef

    this.buildAssignmentForm() // Construye el formulario en el componente

    this.familyMemberForm = this.formBuilder.group({
      name: ["", Validators.required],
      documentId: [null, [Validators.maxLength(10)]],
    })

    this.employeeForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200)]],
      cedula: ["", [Validators.required, Validators.maxLength(10)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })

    // doctorForm is commented out as per user request
    // this.doctorForm = this.formBuilder.group({
    //   name: ["", [Validators.required, Validators.maxLength(200)]],
    //   email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
    // });
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

      await this.loadInitialData() // Llama al método de la clase base
      this.setupFormDynamics() // Llama al método de la clase base
    }
  }

  // Implementaciones de métodos abstractos de BaseAssignmentLogic
  protected buildAssignmentForm() {
    this.AssignProductForm = this.formBuilder.group({
      recipient: ["employee", Validators.required],
      name: ["", [Validators.required, Validators.minLength(0), Validators.maxLength(100)]],
      products: [
        0,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.min(1),
          Validators.max(3), // Initial max for 'employee' type
        ],
      ],
      employee: ["", []], // Validators set dynamically
      medico: ["", []], // Validators set dynamically
      family: [{ value: null, disabled: true }, []],
      type: ["", [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      observation: ["", [Validators.maxLength(200)]],
    })

/*     this.AssignProductForm.controls["name"].disable()
    this.AssignProductForm.patchValue({
      name: this.selectedProduct?.name,
    }) */

    // Mover la inicialización del autocompletado aquí
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

  // Métodos específicos del componente
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
      // El reset y closeDialog se manejan en el complete del subscribe de assignProduct en la clase base
      // Si quieres que se resetee y cierre SIEMPRE, incluso si el subscribe no se completa,
      // puedes moverlos aquí, pero lo ideal es que sea después de una asignación exitosa.
      // Por ahora, se mantienen en el complete del subscribe en la clase base.
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
        this.disableButton = false */
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

  // Sobrescribir saveFamilyMember y saveEmployee para usar las propiedades del componente
  override saveFamilyMember(): void {
    super.saveFamilyMember(this.familyMemberForm, this.controlEmployee.value.id, this.controlFamily)
  }

  override saveEmployee(): void {
    // Pasa 'this.filteredEmployeesOptions' para que la clase base pueda actualizarlo
    super.saveEmployee(this.employeeForm, this.controlEmployee, this.filteredEmployeesOptions)
  }

  // Métodos de cancelación para los formularios anidados
  cancelFamilyMember(): void {
    this.showNewFamilyMemberForm = false
    this.familyMemberForm.reset()
  }

  cancelEmployee(): void {
    this.showNewEmployeeForm = false
    this.employeeForm.reset()
  }


}



/*import { CommonModule } from '@angular/common';


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

@Component({
  selector: 'app-assignment',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.scss'
})

export class AssignmentComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AssignmentComponent>);
  AssignProductForm!: FormGroup;
  familyMemberForm!: FormGroup;
  employeeForm!: FormGroup;
  selectedProduct!: IProduct;
  disableButton: boolean = false;
  options: IEmployee[] = [];
  employees: IEmployee[] = []
  listFamily: IEmployeeFamily[] = [];
  listTypesAssignment: ITypesAssignment[] = [];
  
  showNewFamilyMemberForm = false;
  showNewEmployeeForm = false;
  checked_addFamily = model(false);
  
  doctors: IUser[] = [] // List of doctors
  filteredOptions!: Observable<IEmployee[]>;
  filteredEmployeesOptions!: Observable<IEmployee[]>
  filteredDoctorsOptions!: Observable<IUser[]>

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private assignmentService = inject(AssignmentService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any){
    this.buildEditUserForm();

    this.familyMemberForm = this.formBuilder.group({
      name: ["", Validators.required],
      documentId: [null ,[Validators.maxLength(10)]],
    });

    this.employeeForm = this.formBuilder.group({
      name: ["", [
        Validators.required,
        Validators.maxLength(200),
      ]],
      cedula: ["", [
        Validators.required, 
        Validators.maxLength(10)
      ]],
      email: ["", [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100),
      ]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }
  
  async ngOnInit() {  
    this.selectedProduct = this.data; 
    console.log("Producto seleccionado: " , this.selectedProduct)
    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined) {
      return true;
    }
    console.log("Falta el id del producto seleccionado");
    return false;
  }

  get controlEmployee() {
    return this.AssignProductForm.controls['employee'];
  }

  buildEditUserForm() {
    this.AssignProductForm = this.formBuilder.group({
      //nuevo:
      recipient: ["employee", Validators.required], // Destinatario de la asignación: Inicia en 'employee'
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(100),
        ],
      ],
      products: [
        0,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(1),
          Validators.min(1),
          Validators.max(3)
        ],
      ],
      employee: [//su valor es un objeto del empleado seleccioando
        '',
        [
          Validators.required,
          Validators.minLength(1),
          // Validators.maxLength(200),
        ],
      ],
      //nuevo:
      medico: [
        // "",
        null,
        [], 
      ],
      family: [//su valor es el id del familiar seelccionado
        { value: '', disabled: true },
        [
          Validators.maxLength(10),
        ]
      ],
      type: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30),
        ],
      ],
      observation: [
        '',
        [
          Validators.maxLength(200),
        ],
      ],
      checked_addFamily:[false]
    });

  }

  setForm() {
    this.AssignProductForm.controls['name'].disable();

      this.AssignProductForm.patchValue({
        name: this.selectedProduct?.name,
      });

      //Empleados
      this.assignmentService.getEmployees().subscribe((employees: IEmployee[]) => {
        this.options = employees;
        console.log('lista empleados:', this.options); 
        
        //autocomplete
        this.filteredOptions = this.controlEmployee.valueChanges.pipe(
          startWith(''),
          map(value => typeof value === 'string' ? this._filter(value) : this._filter(value?.name || '')),
        );
      });

      //Familiares por empleado
      this.familiares();
            
      //Tipos de asignacion
      this.assignmentService.getAllTypesAssignment().subscribe((listTypesAssignment: ITypesAssignment[]) => this.listTypesAssignment = listTypesAssignment );
  }

  familiares() {
    this.AssignProductForm.get('employee')?.valueChanges.pipe(
      switchMap((empleadoSeleccionado: IEmployee) => {
        console.log("empleadoSeleccionado *" , empleadoSeleccionado)
        this.AssignProductForm.get('family')?.disable(); // Deshabilita el select de familiares al cambiar de empleado
        this.listFamily = []; // Limpia los familiares al cambiar de empleado

        if (empleadoSeleccionado?.id) {
          // Servicio para obtener los familiares del empleado seleccionado
          return this.assignmentService.getFamiliesByEmployee(empleadoSeleccionado.id);
        } else {
          this.showNewFamilyMemberForm = false
          return of([]); // Si no se cumple la condición, emite un array vacío
        }
      })
    ).subscribe(familiares => {
      this.listFamily = familiares; console.log("familiares " , familiares)
      if (this.listFamily.length > 0) {
        this.AssignProductForm.get('family')?.enable();
      }
    });
  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save() {
    if (this.checkPropId) {
      return this.assignProductToEmployee();
    }
  }

  //autocomplete
/*   displayFn(employee: IEmployee): string {
    return employee && employee.name ? employee.name : '';
  } * /
  //nuevo:
  displayFn(target: IEmployee | IUser): string {
    if (!target) return ""
    if ("cedula" in target) {
      // It's an IEmployee
      return `${target.name} - ${target.cedula}`
    } else if ("email" in target) {
      // It's an IUser (Doctor)
      return `${target.name} - ${target.email}`
    }
    return ""
  }
  
  private _filter(value: any): IEmployee[] {
    let filterValue = '';
  
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (typeof value === 'object' && value !== null && value.name) {
      filterValue = value.name.toLowerCase();
    } else {
      return this.options.slice(); // Si no es string ni objeto con nombre, devolvemos todas las opciones sin filtrar
    }
  
    return this.options.filter(option =>
      option.name.toLowerCase().includes(filterValue) ||
      option.cedula.toLowerCase().includes(value)
    );
  }
  
  private assignProductToEmployee() { 
    this.swalService.loading();
    this.disableButton = true;
    if (this.AssignProductForm.invalid) { 
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }

    const { products,employee,family,type,observation} = this.AssignProductForm.value;
    const productId = this.selectedProduct.id;
    console.log("Formulario " , this.AssignProductForm.value)
    let obj:any= {
      employeeId: employee.id,
      type: type.id,
      observation: observation,
      productId: productId,
      products: products,
    };
    if(family){ obj.familyId = family }

    console.log("Objeto para guardar: ", obj);
 
     this.assignmentService
      .createAssignment(obj)
      .subscribe({
        complete: () => {
          this.AssignProductForm.reset();
          toast.success("Asignación de producto realizado con éxito.");
          this.closeDialog();
        },
        error: (error) => {
          this.swalService.closeload();
          this.disableButton = false;
          toast.error(error);
          console.error('Error al crear la asignacion de producto', error);
        }
      }); 
  }

  toggleNewFamilyMemberForm(): void {
    this.showNewFamilyMemberForm = !this.showNewFamilyMemberForm;
    this.showNewEmployeeForm = false;
    if (!this.showNewFamilyMemberForm) {
      this.familyMemberForm.reset()
    }
  }

  toggleNewEmployeeForm(): void {
    this.showNewEmployeeForm = !this.showNewEmployeeForm;
    this.showNewFamilyMemberForm = false;
    if (!this.showNewEmployeeForm) {
      this.employeeForm.reset()
    }
  }
  
  saveFamilyMember(): void {
    if (this.familyMemberForm.valid && this.controlEmployee.value.id) {
      const  {name,documentId } = this.familyMemberForm.value;
      const newFamilyMember:ICreateFamily = {
        employeeId: this.controlEmployee.value.id,
        name,
        cedula: documentId,
      }; 
      this.assignmentService.addFamilyMember(newFamilyMember).subscribe(savedMember => {
        this.listFamily.push(savedMember);
        console.log(" listFamily ", this.listFamily);
        this.AssignProductForm.get("family")?.setValue(savedMember.familyId);
        this.showNewFamilyMemberForm = false;
        this.familyMemberForm.reset();
        toast.success("Familiar agregado correctamente.");
        if (this.listFamily.length > 0) {
          this.AssignProductForm.get('family')?.enable();
        }
      })
    }
  }

  saveEmployee(): void {
    if (this.employeeForm.valid) {
      const newEmployee = {
        ...this.employeeForm.value,
      }
      console.log("newEmployee " , newEmployee)
      this.assignmentService.addEmployee(newEmployee).subscribe((savedEmployee) => {
        // this.employees = [...this.employees, savedEmployee]
        // this.employees.push(savedEmployee)
        this.options.push(savedEmployee);
        // this.AssignProductForm.get("employee")?.setValue(savedEmployee.id);
        this.AssignProductForm.get("employee")?.setValue(savedEmployee);
        this.filteredOptions = this.controlEmployee.valueChanges.pipe(
          startWith(savedEmployee),
          map(value => typeof value === 'string' ? this._filter(value) : this._filter(value?.name || '')),
        );
        this.showNewEmployeeForm = false;
        this.employeeForm.reset();
        toast.success("Empleado guardado.");
      })
    }
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
*/