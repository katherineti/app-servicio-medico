import { Component, inject, signal } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { AbstractControl, FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms"
import { MatDialogRef } from "@angular/material/dialog"
import { SwalService } from "../../../services/swal.service"
import { type Category, MedicalSuppliesService } from "../../services/medical-supplies.service"
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  type Observable,
  startWith,
  type Subscription,
} from "rxjs"
import { toast } from "ngx-sonner"
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from "@angular/material/core"
import { MY_DATE_FORMATS } from "../../../services/date-format.service"
import { AuthService } from "../../../services/auth.service"
import { ProvidersService } from "../../services/providers.service"
import type { Provider, ProvidersAll } from "../../interfaces/providers.interface"
import { providerPatternValidator } from "../../../utils/providers-custom-validators"
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const expirationDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (expirationDate < today) {
      return { 'pastDate': true };
    }
    return null;
  };
}

@Component({
  selector: "app-create-medical-supplies",
  templateUrl: "./create-medical-supplies.component.html",
  styleUrl: "./create-medical-supplies.component.scss",
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es-VE" },
  ],
})
export class CreateMedicalSuppliesComponent {
  createProdFormGroup!: FormGroup
  categories: any[] = []
  private categoriesSubscription: Subscription | undefined
  role = ""
  imageField?: File
  disableButton = false
  imgBase64 = signal<string | null>(null)
  isLoading = signal(false)
  errorMessage = signal<string | null>(null)
  selectedFile: File | null = null
  image_fileSizeMB = 10;
  showExpirationStatusOptions = signal(false)
  private _allProviders = new BehaviorSubject<Provider[]>([])
  providers: Observable<Provider[]> = this._allProviders.asObservable()
  displayFn: (providerId: number | null) => string
  filteredProviders!: Observable<Provider[]>
  private providerSubscription: Subscription | undefined
  showAddProviderForm = false
  providerForm!: FormGroup
  canCreateUniforms: boolean = false;
  private authService = inject(AuthService)
  private formBuilder = inject(FormBuilder)
  private swalService = inject(SwalService)
  private medicalSuppliesService = inject(MedicalSuppliesService)
  private providersService = inject(ProvidersService)

  constructor(public dialogRef: MatDialogRef<CreateMedicalSuppliesComponent>) {
    this.buildProdForm()
    this.loadCategories()
    this.createProdFormGroup.patchValue({
      status: 1,
    })
    this.displayFn = this._displayProviderName.bind(this)
  }

  async ngOnInit() {
    this.role = await this.authService.getRol()
    const ROL_ADMIN_RRHH = 'admin RRHH';
    const ROL_ADMIN = 'admin';
    this.canCreateUniforms = this.role === ROL_ADMIN_RRHH || this.role === ROL_ADMIN ;
    this.subscribeToExpirationDateChanges()
    this.loadProvidersAndSetupAutocomplete()
  }

  buildProdForm() {
    this.createProdFormGroup = this.formBuilder.group({
      name: [
        "", [
          Validators.required, 
          Validators.maxLength(50), 
          Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)
        ]
      ],
      providerId: [null, [
            Validators.required, 
            Validators.maxLength(50),
            providerPatternValidator()
      ]],
      description: ["", [Validators.required, Validators.maxLength(50)]],
      category: ["", [Validators.required, Validators.maxLength(50)]],
      type: ["", [Validators.required, Validators.maxLength(50)]],
      stock: [0, [
        Validators.required, 
        Validators.max(100),
        Validators.min(0),
        Validators.pattern(/^[0-9]*$/)
       ]
      ],
      code: ["", [
        Validators.required, 
        Validators.maxLength(50),
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9.\-\s]*$/)
      ]],
      expirationDate: ["", [
        Validators.maxLength(50),
        futureDateValidator()
      ]],
      status: ["", [Validators.required, Validators.maxLength(50)]],
      url_image: [null],
    })

    this.providerForm = this.formBuilder.group({
      name: ["", [
        Validators.required, 
        Validators.maxLength(200),
        providerPatternValidator()
      ]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }
  private subscribeToExpirationDateChanges(): void {
    this.createProdFormGroup
      .get("expirationDate")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((date: Date | null) => {
        this.checkExpirationStatus(date)
      })
  }
  private checkExpirationStatus(expirationDate: Date | null): void {
    const statusControl = this.createProdFormGroup.get("status")
    if (!statusControl) return

    if (!expirationDate) {
      this.showExpirationStatusOptions.set(false)
      if (statusControl.value === 3 || statusControl.value === 4) {
        statusControl.patchValue(1)
      }
      return
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiration = new Date(expirationDate)
    expiration.setHours(0, 0, 0, 0)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    this.showExpirationStatusOptions.set(diffDays <= 90)
    const productType = this.createProdFormGroup.get("type")?.value
    const isMedicalProduct = productType == 1
    if (isMedicalProduct) {
      if (diffDays <= 0) {
        if ((this.role === "admin" || this.role === "admin RRHH" || this.role === "almacen") && statusControl.value !== 4) {
          statusControl.patchValue(4)
          toast.info('El producto ha caducado o vence hoy. El estado se ha actualizado a "Caducado".')
        }
      } else if (diffDays <= 90) {
        if ((this.role === "admin" || this.role === "admin RRHH" || this.role === "almacen") && statusControl.value !== 3) {
          statusControl.patchValue(3)
          toast.info('El producto está próximo a vencerse. El estado se ha actualizado a "Próximo a Vencerse".')
        }
      } else {
        if (
          (this.role === "admin" || this.role === "admin RRHH" || this.role === "almacen") &&
          (statusControl.value === 3 || statusControl.value === 4)
        ) {
          statusControl.patchValue(1)
          toast.info('El producto tiene más de 90 días para vencer. El estado se ha restablecido a "Disponible".')
        }
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    console.log("Si no existe longitud entonces imagen es null. input.files?.length:" ,input.files?.length)
    if (!input.files?.length) {
      this.selectedFile = null
      this.createProdFormGroup.patchValue({ url_image: null })
      return
    }
    const file = input.files[0]
    this.selectedFile = file
    if (!file.type.match(/image\/(jpeg|png)/)) {
      this.errorMessage.set("Solo se permiten imágenes JPG o PNG")
      toast.error("Solo se permiten imágenes JPG o PNG")
      this.selectedFile = null
      this.createProdFormGroup.patchValue({ url_image: null })
      return
    }
    if (file.size > this.image_fileSizeMB * 1024 * 1024) {
      this.errorMessage.set(`La imagen no debe superar los ${this.image_fileSizeMB}MB`)
      toast.error(`La imagen no debe superar los ${this.image_fileSizeMB}MB`)
      this.selectedFile = null
      this.createProdFormGroup.patchValue({ url_image: null })
      return
    }
    this.errorMessage.set(null)
    this.isLoading.set(true)
    const reader = new FileReader()
    reader.onload = () => {
      this.imgBase64.set(reader.result as string)
      this.isLoading.set(false)
    }
    reader.onerror = () => {
      this.errorMessage.set("Error al procesar la imagen")
      toast.error("Error al procesar la imagen")
      this.isLoading.set(false)
    }
    reader.readAsDataURL(file)
  }

  removeImage(): void {
    this.imgBase64.set(null)
    this.createProdFormGroup.patchValue({
      url_image: null,
    })
  }
  cancel() {
    this.closeDialog()
  }
  closeDialog(): void | null {
    this.dialogRef.close({ event: "Cancel" })
  }
  save() {
    if (this.createProdFormGroup) {
      return this.saveProduct()
    }
  }
  saveProduct(): void {
    if (this.createProdFormGroup.invalid) {
      toast.error("Por favor, completa el formulario correctamente.")
      return
    }
    this.isLoading.set(true)
    const formData = new FormData()
    Object.keys(this.createProdFormGroup.value).forEach((key) => {
      if (key !== "url_image") {
        formData.append(key, this.createProdFormGroup.get(key)?.value)
      }
    })
    if (this.selectedFile) {
      formData.append("url_image", this.selectedFile, this.selectedFile.name)
    }
    for (const entry of formData.entries()) {
      console.log(`${entry[0]}: ${entry[1]}`)
    }
    this.medicalSuppliesService.createProduct(formData).subscribe({
      complete: () => {
        toast.success("Producto creado exitosamente")
        this.isLoading.set(false)
        this.createProdFormGroup.reset()
        this.imgBase64.set(null)
        this.selectedFile = null
        this.closeDialog()
      },
      error: (error) => {
        this.swalService.closeload()
        this.disableButton = false
        this.errorMessage.set("Error al crear el producto.")
        this.isLoading.set(false)
        console.error("Error al crear el producto", error)
        if (error.status === 413) {
          toast.error("La imagen es demasiado grande. Por favor, selecciona una imagen más pequeña.")
        } else if (typeof error === 'string' && error!='' ) {
          toast.error(error)
        } else {
          toast.error("Error al crear el producto. Por favor, inténtalo de nuevo.")
        }
      },
    })
  }
  loadCategories(): void {
    this.categoriesSubscription = this.medicalSuppliesService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data
      },
      (error) => {
        console.error("Error al cargar las categorías:", error)
      },
    )
  }
  loadProvidersAndSetupAutocomplete(): void {
    console.log("=== CARGANDO PROVEEDORES INICIALES ===")

    this.providerSubscription = this.providersService.get().subscribe({
      next: (data: ProvidersAll) => {
        console.log("Datos recibidos de la API:", data)
        console.log("Lista de proveedores de la API:", data.list)
        console.log("Cantidad de proveedores de la API:", data.list.length)
        this._allProviders.next(data.list)
        const savedProviders = this._allProviders.getValue()
        console.log("Proveedores guardados en BehaviorSubject:", savedProviders)
        console.log("Cantidad guardada en BehaviorSubject:", savedProviders.length)
        console.log("Tipo del primer ID cargado:", data.list.length > 0 ? typeof data.list[0].id : "N/A (array vacío)")
        this.filteredProviders = this.createProdFormGroup.get("providerId")!.valueChanges.pipe(
          startWith(""),
          debounceTime(300),
          map((value) => {
            const currentProviders = this._allProviders.getValue()
            console.log("Filtrado - Proveedores actuales:", currentProviders.length)
            console.log("Filtrado - Valor recibido:", value, "Tipo:", typeof value)
            let filterValue = ""
            let isTyping = false
            if (typeof value === "string") {
              filterValue = value.toLowerCase().trim()
              isTyping = true
              console.log("Filtrado - Usuario escribiendo:", filterValue)
            } else if (typeof value === "number") {
              console.log("Filtrado - ID seleccionado:", value, "- Mostrando todos los proveedores")
              return currentProviders.slice()
            } else {
              console.log("Filtrado - Valor vacío - Mostrando todos los proveedores")
              return currentProviders.slice()
            }
            if (isTyping && filterValue) {
              const filtered = this._filterProviders(filterValue, currentProviders)
              console.log("Filtrado - Resultados filtrados:", filtered.length)
              return filtered
            } else {
              console.log("Filtrado - Mostrando todos:", currentProviders.length)
              return currentProviders.slice()
            }
          }),
        )

        console.log("=== FIN CARGA PROVEEDORES INICIALES ===")
      },
      error: (error: any) => {
        console.error("Error al cargar los proveedores:", error)
        toast.error("Error al cargar los proveedores. Por favor, inténtalo de nuevo.")
      },
      complete: () => {
        console.log("Carga de proveedores completada.")
      },
    })
  }
  private _displayProviderName(providerId: number | null): string {
    console.log("_displayProviderName - providerId", providerId)
    if (providerId === null || providerId === undefined) {
      return ""
    }
    if (typeof providerId === "object" && providerId !== null && "name" in providerId) {
      return (providerId as Provider).name
    }
    const currentProviders = this._allProviders.getValue()
    if (!currentProviders || currentProviders.length === 0) {
      return ""
    }
    const providerIdNumber = typeof providerId === "string" ? Number.parseInt(providerId, 10) : Number(providerId)
    const selectedProvider = currentProviders.find((provider) => provider.id === providerIdNumber)
    return selectedProvider ? selectedProvider.name : ""
  }
  private _filterProviders(value: string, providersList: Provider[]): Provider[] {
    const filterValue = value.toLowerCase()
    return providersList.filter((provider) => provider.name.toLowerCase().includes(filterValue))
  }
  toggleAddProviderForm(event?: Event): void {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.showAddProviderForm = !this.showAddProviderForm
    if (!this.showAddProviderForm) {
      this.providerForm.reset()
    }
  }
  cancelFormProvider(): void {
    this.showAddProviderForm = false
    this.providerForm.reset()
  }
  saveProvider(): void {
    if (this.providerForm.valid) {
      const newProvider = {
        ...this.providerForm.value,
      }
      this.providersService.create(newProvider).subscribe({
        next: (response: any) => {
          console.log("Respuesta completa del servidor:", response)
          let savedProvider: Provider
          if (response && response.data) {
            savedProvider = response.data
          } else if (response && response.id) {
            savedProvider = response
          } else if (response && response.provider) {
            savedProvider = response.provider
          } else {
            console.error("Estructura de respuesta inesperada:", response)
            toast.error("Error: Respuesta del servidor no válida")
            return
          }
          console.log("Proveedor guardado procesado:", savedProvider)
          if (!savedProvider.id) {
            console.error("El proveedor guardado no tiene ID:", savedProvider)
            toast.error("Error: El proveedor no se guardó correctamente")
            return
          }
          const currentProviders = this._allProviders.getValue()
          console.log("=== DEBUGGING PROVIDERS ===")
          console.log("Proveedores actuales en BehaviorSubject:", currentProviders)
          console.log("Cantidad de proveedores actuales:", currentProviders.length)
          console.log("Nuevo proveedor a agregar:", savedProvider)
          const providerExists = currentProviders.some((provider) => provider.id === savedProvider.id)
          console.log("¿El proveedor ya existe?", providerExists)
          let updatedProviders: Provider[]
          if (providerExists) {
            const otherProviders = currentProviders.filter((provider) => provider.id !== savedProvider.id)
            updatedProviders = [savedProvider, ...otherProviders]
          } else {
            updatedProviders = [savedProvider, ...currentProviders]
          }
          this._allProviders.next(updatedProviders)
          const verifyProviders = this._allProviders.getValue()
          this.createProdFormGroup.patchValue({
            providerId: savedProvider.id,
          })
          const providerFormControl = this.createProdFormGroup.get("providerId")
          if (providerFormControl) {
            providerFormControl.updateValueAndValidity()
            providerFormControl.markAsTouched()
            providerFormControl.markAsDirty()
          }
          const displayName = this._displayProviderName(savedProvider.id)
          this.showAddProviderForm = false
          this.providerForm.reset()
          toast.success(`Proveedor "${savedProvider.name}" guardado y seleccionado correctamente.`)
        },
        error: (error) => {
          if(error==='El correo del proveedor ya existe.' || error==='El nombre del proveedor ya existe.'){
            toast.error(error);
            return
          }
          console.error("Error completo al guardar el proveedor:", error)
          console.error("Error status:", error.status)
          console.error("Error message:", error.message)
          console.error("Error body:", error.error)

          toast.error("Error al guardar el proveedor. Por favor, inténtalo de nuevo.")
        },
      })
    } else {
      toast.error("Por favor, completa todos los campos requeridos del proveedor.")
    }
  }
  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe()
    this.providerSubscription?.unsubscribe()
    this._allProviders.complete()
  }
}
