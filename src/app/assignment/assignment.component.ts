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
  selectedProduct!: IProduct;
  disableButton: boolean = false;
  options: IEmployee[] = [];
  filteredOptions!: Observable<IEmployee[]>;
  checked_addFamily = model(false);
  listFamily: IEmployeeFamily[] = [];
  listTypesAssignment: ITypesAssignment[] = [];

  showNewFamilyMemberForm = false

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private assignmentService = inject(AssignmentService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any){
    this.buildEditUserForm();
    this.familyMemberForm = this.formBuilder.group({
      name: ["", Validators.required],
      documentId: [""],
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
      employee: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      family: [
        { value: '', disabled: true },
        [
          Validators.minLength(1),
          Validators.maxLength(50),
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
          Validators.maxLength(100),
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
  displayFn(employee: IEmployee): string {
    return employee && employee.name ? employee.name : '';
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
          toast.error("Error al crear la asignacion de producto.");
          console.error('Error al crear la asignacion de producto', error);
        }
      }); 
  }

  toggleNewFamilyMemberForm(): void {
    this.showNewFamilyMemberForm = !this.showNewFamilyMemberForm
    if (!this.showNewFamilyMemberForm) {
      this.familyMemberForm.reset()
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
      console.log("newFamilyMember " , newFamilyMember)
      this.assignmentService.addFamilyMember(newFamilyMember).subscribe(savedMember => {
        this.listFamily.push(savedMember)
        console.log(" listFamily ", this.listFamily)
        console.log(" id del familiar  ", savedMember.familyId)
        this.AssignProductForm.get("family")?.setValue(savedMember.familyId)
        this.showNewFamilyMemberForm = false
        this.familyMemberForm.reset()
        toast.success("Familiar agregado correctamente.");
        if (this.listFamily.length > 0) {
          this.AssignProductForm.get('family')?.enable();
        }
      })
    }
  }
  cancelFamilyMember(): void {
    this.showNewFamilyMemberForm = false
    this.familyMemberForm.reset()
  }
}