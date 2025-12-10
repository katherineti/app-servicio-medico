import { Component, Inject, signal } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors, AbstractControl, ValidatorFn } from "@angular/forms"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { SwalService } from "../../../services/swal.service"
import type { IProduct } from "../../interfaces/medical-supplies.interface"
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
import { API_URL } from "../../../../../environment"
import { MY_DATE_FORMATS } from "../../../services/date-format.service"
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from "@angular/material/core"
import { AuthService } from "../../../services/auth.service"
import { takeUntil } from "rxjs/operators"
import { Subject } from "rxjs"
import { ProvidersService } from "../../services/providers.service"
import type { Provider, ProvidersAll } from "../../interfaces/providers.interface"
import { inject } from "@angular/core"
import { providerPatternValidator } from "../../../utils/providers-custom-validators"

@Component({
  selector: "app-edit-medical-supplies",
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./edit-medical-supplies.component.html",
  styleUrl: "./edit-medical-supplies.component.scss",
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es-VE" },
  ],
})
export class EditMedicalSuppliesComponent {
  editProdFormGroup!: FormGroup
  categories: any[] = []
  private categoriesSubscription: Subscription | undefined
  selectedProduct!: IProduct
  role = ""
  imageField?: File
  disableButton = false
  imgBase64 = signal<string | null>(null)
  isLoading = signal(false)
  errorMessage = signal<string | null>(null)
  selectedFile: File | null = null
  edit: boolean | undefined
  imageError = false
  image_fileSizeMB = 10; //10MB
  private destroy$ = new Subject<void>()
  EXPIRING_PRODUCT = [3, 4]
  showExpirationStatusOptions = signal(false)
  private _allProviders = new BehaviorSubject<Provider[]>([])
  providers: Observable<Provider[]> = this._allProviders.asObservable()
  displayFn: (providerId: number | null) => string
  filteredProviders!: Observable<Provider[]>
  private providerSubscription: Subscription | undefined
  showAddProviderForm = false
  providerForm!: FormGroup
  API_URL = API_URL
  private readonly authService = inject(AuthService)
  private readonly formBuilder = inject(FormBuilder)
  private readonly swalService = inject(SwalService)
  private readonly medicalSuppliesService = inject(MedicalSuppliesService)
  private readonly providersService = inject(ProvidersService)
  private readonly dialogRef = inject(MatDialogRef<EditMedicalSuppliesComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: IProduct) {
    this.buildForm()
    this.loadCategories()


    this.displayFn = this._displayProviderName.bind(this)
  }

  async ngOnInit() {
    this.role = await this.authService.getRol()

    this.selectedProduct = this.data
    console.log("selectedProduct ", this.selectedProduct)
    this.edit = this.data.actionEdit;

    if (!this.edit) {
      this.editProdFormGroup.controls["name"].disable()
      this.editProdFormGroup.controls["providerId"].disable()
      this.editProdFormGroup.controls["description"].disable()
      this.editProdFormGroup.controls["category"].disable()
      this.editProdFormGroup.controls["type"].disable()
      this.editProdFormGroup.controls["stock"].disable()
      this.editProdFormGroup.controls["expirationDate"].disable()
      this.editProdFormGroup.controls["status"].disable()
    }
    this.editProdFormGroup.controls["code"].disable()

    if (this.data) {
      await this.loadProvidersAndSetupAutocomplete()

      this.setForm()

      if (this.edit) {
        this.setupTypeChangeDetection()
      }
    }

    this.subscribeToExpirationDateChanges()
  }

  get checkPropId() {
    if (this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined) {
      return true
    }
    console.log("falta id")
    return false
  }

  buildForm() {
    this.editProdFormGroup = this.formBuilder.group({
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
          ]],
          status: ["", [Validators.required, Validators.maxLength(50)]],
          url_image: [null],
        })

    this.providerForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200), providerPatternValidator() ]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }

  setForm() {
    if (this.selectedProduct?.expirationDate) {
      const [year, month, day] = this.selectedProduct?.expirationDate.split("-")
      const date = new Date(+year, +month - 1, +day)
      this.editProdFormGroup.patchValue({
        expirationDate: date,
      })
    }

    this.editProdFormGroup.patchValue({
      id: this.selectedProduct?.id,
      name: this.selectedProduct?.name,
      providerId: this.selectedProduct?.providerId,
      description: this.selectedProduct?.description,
      category: this.selectedProduct?.categoryId,
      type: this.selectedProduct?.type,
      stock: this.selectedProduct?.stock,
      code: this.selectedProduct?.code,
      date_entry: this.selectedProduct?.createdAt,
      url_image: this.selectedProduct?.url_image,
      status: this.selectedProduct?.statusId,
    })

    if (this.selectedProduct.url_image) {
      this.imgBase64.set(API_URL + "uploads" + this.selectedProduct?.url_image)
    }

    const isExpiringProduct = this.EXPIRING_PRODUCT.includes(this.selectedProduct?.statusId || -1)
    if (this.edit && this.selectedProduct?.type != 1 && isExpiringProduct) {
      this.editProdFormGroup.patchValue({
        status: "",
      })
      toast.info(
        "El producto seleccionado de tipo Uniforme o Equipo odontológico no puede ser caducado. El estado se ha vaciado",
      )
    }
  }

  setupTypeChangeDetection(): void {
    this.editProdFormGroup
      .get("type")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newTypeValue) => {
        if (newTypeValue != 1 && newTypeValue != this.selectedProduct?.type) {
          this.editProdFormGroup.patchValue({
            status: "",
          })
        }
      })
  }
  private subscribeToExpirationDateChanges(): void {
    this.editProdFormGroup
      .get("expirationDate")
      ?.valueChanges.pipe(
        debounceTime(300), 
        distinctUntilChanged(), 
      )
      .subscribe((date: Date | null) => {
        this.checkExpirationStatus(date)
      })
  }

  private checkExpirationStatus(expirationDate: Date | null): void {
    const statusControl = this.editProdFormGroup.get("status")
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
    const productType = this.editProdFormGroup.get("type")?.value
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
  loadProvidersAndSetupAutocomplete(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.providerSubscription = this.providersService.get().subscribe({
        next: (data: ProvidersAll) => {
          this._allProviders.next(data.list)
          const savedProviders = this._allProviders.getValue()
          this.filteredProviders = this.editProdFormGroup.get("providerId")!.valueChanges.pipe(
            startWith(this.selectedProduct?.providerId || ""), 
            debounceTime(300),
            map((value) => {
              const currentProviders = this._allProviders.getValue()
              let filterValue = ""
              let isTyping = false
              if (typeof value === "string") {
                filterValue = value.toLowerCase().trim()
                isTyping = true
              } else if (typeof value === "number") {
                return currentProviders.slice()
              } else {
                return currentProviders.slice()
              }
              if (isTyping && filterValue) {
                const filtered = this._filterProviders(filterValue, currentProviders)
                return filtered
              } else {
                return currentProviders.slice()
              }
            }),
          )
          resolve() 
        },
        error: (error: any) => {
          console.error("Error al cargar los proveedores:", error)
          toast.error("Error al cargar los proveedores. Por favor, inténtalo de nuevo.")
          reject(error)
        },
        complete: () => {
          console.log("Carga de proveedores completada.")
        },
      })
    })
  }

  private _displayProviderName(providerId: number | null): string {
    if (providerId === null || providerId === undefined) {
      return ""
    }
    if (typeof providerId === "object" && providerId !== null && "name" in providerId) {
      return (providerId as Provider).name
    }
    const currentProviders = this._allProviders.getValue()
    if (!currentProviders || currentProviders.length === 0) {
      console.log("_displayProviderName - No hay proveedores disponibles")
      return ""
    }
    const providerIdNumber = typeof providerId === "string" ? Number.parseInt(providerId, 10) : Number(providerId)
    const selectedProvider = currentProviders.find((provider) => provider.id === providerIdNumber)
    const result = selectedProvider ? selectedProvider.name : ""
    return result
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
          if (!savedProvider.id) {
            console.error("El proveedor guardado no tiene ID:", savedProvider)
            toast.error("Error: El proveedor no se guardó correctamente")
            return
          }
          const currentProviders = this._allProviders.getValue()
          const providerExists = currentProviders.some((provider) => provider.id === savedProvider.id)
          let updatedProviders: Provider[]
          if (providerExists) {
            const otherProviders = currentProviders.filter((provider) => provider.id !== savedProvider.id)
            updatedProviders = [savedProvider, ...otherProviders]
            console.log("Proveedor reemplazado y movido al principio de la lista")
          } else {
            updatedProviders = [savedProvider, ...currentProviders]
          }
          this._allProviders.next(updatedProviders)
          this.editProdFormGroup.patchValue({
            providerId: savedProvider.id,
          })
          const providerFormControl = this.editProdFormGroup.get("providerId")
          if (providerFormControl) {
            providerFormControl.updateValueAndValidity()
            providerFormControl.markAsTouched()
            providerFormControl.markAsDirty()
          }
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
          toast.error("Error al guardar el proveedor. Por favor, inténtalo de nuevo.")
        },
      })
    } else {
      console.log("Formulario de proveedor inválido:", this.providerForm.errors)
      toast.error("Por favor, completa todos los campos requeridos del proveedor.")
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (!input.files?.length) {
      this.selectedFile = null 
      this.editProdFormGroup.patchValue({ url_image: null })
      return
    }
    const file = input.files[0]
    this.selectedFile = file 
    if (!file.type.match(/image\/(jpeg|png)/)) {
      this.errorMessage.set("Solo se permiten imágenes JPG o PNG")
      toast.error("Solo se permiten imágenes JPG o PNG")
      this.selectedFile = null
      this.editProdFormGroup.patchValue({ url_image: null })
      return
    }
    if (file.size > this.image_fileSizeMB * 1024 * 1024) {
      this.errorMessage.set(`La imagen no debe superar los ${this.image_fileSizeMB}MB`)
      toast.error(`La imagen no debe superar los ${this.image_fileSizeMB}MB`)
      this.selectedFile = null
      this.editProdFormGroup.patchValue({ url_image: null })
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
     this.editProdFormGroup.patchValue({
      url_image: null,
    }) 
  }
  cancel() {
    this.closeDialog()
  }
  closeDialog(): void | null {
    this.dialogRef.close({ event: "Cancel" })
  }
  save(): void {
    if (this.checkPropId) {
      return this.guardarProducto()
    }
  }
  guardarProducto(): void {
    if (this.editProdFormGroup.invalid) {
      toast.error("Por favor, completa el formulario correctamente.")
      return
    }
    this.isLoading.set(true)
    const formData = new FormData()
    if (this.editProdFormGroup.controls["type"].value != 1) {
      this.editProdFormGroup.patchValue({
        expirationDate: null,
      })
    }
    Object.keys(this.editProdFormGroup.value).forEach((key) => {
      if (key !== "url_image") {
        formData.append(key, this.editProdFormGroup.get(key)?.value)
      }
    })
    console.log("Archivo imagen seleccionado? " , this.selectedFile)
    if (this.selectedFile) {
      formData.append("url_image", this.selectedFile, this.selectedFile.name)
    }
    if (this.editProdFormGroup.get('url_image')?.value===null && !this.selectedFile) {
      formData.append("url_image", "null")
    }
    const id = this.selectedProduct.id
    this.medicalSuppliesService.updateProduct(id, formData).subscribe({
      complete: () => {
        toast.success("Producto editado.")
        this.isLoading.set(false)
        this.editProdFormGroup.reset()
        this.imgBase64.set(null)
        this.selectedFile = null
        this.closeDialog()
      },
      error: (error) => {
        this.swalService.closeload()
        this.disableButton = false
        this.errorMessage.set("Error al editar el producto.")
        this.isLoading.set(false)
        console.error("Error al editar el producto", error)
        if (error.status === 413) {
          toast.error("La imagen es demasiado grande. Por favor, selecciona una imagen más pequeña.")
        } else if (typeof error === 'string' && error!='' ) {
          toast.error(error)
        } else {
          toast.error("Error al editar el producto. Por favor, inténtalo de nuevo.")
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
  handleImageError(): void {
    this.imageError = true
    this.imgBase64.set("../../assets/images/products/default_product_image.png")
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
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.categoriesSubscription?.unsubscribe()
    this.providerSubscription?.unsubscribe()
    this._allProviders.complete()
  }
}
