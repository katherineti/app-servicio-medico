import { Component, Inject, signal } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
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

@Component({
  selector: "app-edit-medical-supplies",
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./edit-medical-supplies.component.html",
  styleUrl: "./edit-medical-supplies.component.scss",
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es-VE" }, // Configura el locale directamente aquí
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

  private destroy$ = new Subject<void>()
  EXPIRING_PRODUCT = [3, 4]
  // Signal para controlar la visibilidad de las opciones 3 y 4 del estado
  showExpirationStatusOptions = signal(false)

  // Provider-related properties
  private _allProviders = new BehaviorSubject<Provider[]>([])
  providers: Observable<Provider[]> = this._allProviders.asObservable()
  displayFn: (providerId: number | null) => string
  filteredProviders!: Observable<Provider[]>
  private providerSubscription: Subscription | undefined
  showAddProviderForm = false
  providerForm!: FormGroup

  API_URL = API_URL

  // Usar inject() para todos los servicios
  private readonly authService = inject(AuthService)
  private readonly formBuilder = inject(FormBuilder)
  private readonly swalService = inject(SwalService)
  private readonly medicalSuppliesService = inject(MedicalSuppliesService)
  private readonly providersService = inject(ProvidersService)
  private readonly dialogRef = inject(MatDialogRef<EditMedicalSuppliesComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: IProduct) {
    this.buildForm()
    this.loadCategories()

    // Initialize provider display function
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

    // CAMBIO: Primero cargar proveedores, LUEGO configurar el formulario
    if (this.data) {
      // Cargar proveedores primero
      await this.loadProvidersAndSetupAutocomplete()

      // Después configurar el formulario con los datos
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
      name: ["", [Validators.required, Validators.maxLength(50)]],
      providerId: [null, [Validators.required]],
      description: ["", [Validators.required, Validators.maxLength(50)]],
      category: ["", [Validators.required, Validators.maxLength(50)]],
      type: ["", [Validators.required, Validators.maxLength(50)]],
      stock: [0, [Validators.required, Validators.maxLength(3), Validators.max(100)]],
      code: ["", [Validators.required, Validators.maxLength(50)]],
      expirationDate: [
        "",
        [
          // Validators.required,
          Validators.maxLength(50),
        ],
      ],
      status: ["", [Validators.required, Validators.maxLength(50)]],
      url_image: [null],
    })

    // Provider form for adding new providers
    this.providerForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }

  setForm() {
    // if (!this.edit) {
    //   this.editProdFormGroup.controls["name"].disable()
    //   this.editProdFormGroup.controls["providerId"].disable()
    //   this.editProdFormGroup.controls["description"].disable()
    //   this.editProdFormGroup.controls["category"].disable()
    //   this.editProdFormGroup.controls["type"].disable()
    //   this.editProdFormGroup.controls["stock"].disable()
    //   this.editProdFormGroup.controls["expirationDate"].disable()
    //   this.editProdFormGroup.controls["status"].disable()
    // }

    // this.editProdFormGroup.controls["code"].disable()

    if (this.selectedProduct?.expirationDate) {
      const [year, month, day] = this.selectedProduct?.expirationDate.split("-")
      const date = new Date(+year, +month - 1, +day) // Month is 0-indexed
      this.editProdFormGroup.patchValue({
        expirationDate: date,
      })
    }

    this.editProdFormGroup.patchValue({
      id: this.selectedProduct?.id,
      name: this.selectedProduct?.name,
      providerId: this.selectedProduct?.providerId, // Add provider ID
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

  /**
   * Suscribe a los cambios en el campo de fecha de vencimiento
   */
  private subscribeToExpirationDateChanges(): void {
    this.editProdFormGroup
      .get("expirationDate")
      ?.valueChanges.pipe(
        debounceTime(300), // Espera 300ms después del último cambio para evitar cálculos excesivos
        distinctUntilChanged(), // Solo emite si el valor es diferente al anterior
      )
      .subscribe((date: Date | null) => {
        this.checkExpirationStatus(date)
      })
  }

  /**
   * Calcula los días restantes hasta la fecha de vencimiento y actualiza la visibilidad de las opciones de estado.
   * @param expirationDate La fecha de vencimiento ingresada en el formulario.
   */
  private checkExpirationStatus(expirationDate: Date | null): void {
    const statusControl = this.editProdFormGroup.get("status")
    if (!statusControl) return

    if (!expirationDate) {
      // Si no hay fecha de vencimiento
      this.showExpirationStatusOptions.set(false) // Esto oculta las opciones de "Próximo a vencerse" y "Caducado".
      if (statusControl.value === 3 || statusControl.value === 4) {
        statusControl.patchValue(1) // Restablecer a 'Disponible'
      }
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalizar a inicio del día
    const expiration = new Date(expirationDate)
    expiration.setHours(0, 0, 0, 0) // Normalizar a inicio del día

    // Calcula la diferencia en milisegundos y luego en días
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Lógica para mostrar las opciones 3 y 4:
    // Solo se muestran si faltan 90 días o menos (o ya ha expirado).
    this.showExpirationStatusOptions.set(diffDays <= 90)

    // Lógica para cambiar el valor del campo 'status' automáticamente:
    // Asegurarse de que el tipo de producto es relevante para la fecha de vencimiento
    const productType = this.editProdFormGroup.get("type")?.value
    const isMedicalProduct = productType == 1

    if (isMedicalProduct) {
      if (diffDays <= 0) {
        // Si la fecha de vencimiento es hoy o ya pasó (0 días o menos)
        // Solo cambiar si el rol es admin o almacen, y el status actual no es ya 4 (Caducado)
        if ((this.role === "admin" || this.role === "almacen") && statusControl.value !== 4) {
          statusControl.patchValue(4) // Cambiar a 'Caducado'
          toast.info('El producto ha caducado o vence hoy. El estado se ha actualizado a "Caducado".')
        }
      } else if (diffDays <= 90) {
        // Si faltan 90 días o menos para expirar
        // Solo cambiar si el rol es admin o almacen, y el status actual no es 3 (Próximo a vencerse)
        if ((this.role === "admin" || this.role === "almacen") && statusControl.value !== 3) {
          statusControl.patchValue(3) // Cambiar a 'Próximo a vencerse'
          toast.info('El producto está próximo a vencerse. El estado se ha actualizado a "Próximo a Vencerse".')
        }
      } else {
        // Si el producto tiene más de 90 días para vencer y el estado fue cambiado automáticamente a 3 o 4,
        // lo reiniciamos a 1 (Disponible) si el rol lo permite.
        // Esto solo aplica si el usuario no lo cambió manualmente a 1 o 2.
        if (
          (this.role === "admin" || this.role === "almacen") &&
          (statusControl.value === 3 || statusControl.value === 4)
        ) {
          statusControl.patchValue(1) // Resetear a 'Disponible'
          toast.info('El producto tiene más de 90 días para vencer. El estado se ha restablecido a "Disponible".')
        }
      }
    }
  }

  // Provider-related methods
  loadProvidersAndSetupAutocomplete(): Promise<void> {
    console.log("=== CARGANDO PROVEEDORES INICIALES (EDIT) ===")

    return new Promise((resolve, reject) => {
      this.providerSubscription = this.providersService.get().subscribe({
        next: (data: ProvidersAll) => {
          console.log("Datos recibidos de la API:", data)
          console.log("Lista de proveedores de la API:", data.list)
          console.log("Cantidad de proveedores de la API:", data.list.length)

          this._allProviders.next(data.list)

          // Verificar que se guardaron correctamente en el BehaviorSubject
          const savedProviders = this._allProviders.getValue()
          console.log("Proveedores guardados en BehaviorSubject:", savedProviders)
          console.log("Cantidad guardada en BehaviorSubject:", savedProviders.length)

          this.filteredProviders = this.editProdFormGroup.get("providerId")!.valueChanges.pipe(
            startWith(this.selectedProduct?.providerId || ""), // CAMBIO: Iniciar con el providerId del producto
            debounceTime(300),
            map((value) => {
              const currentProviders = this._allProviders.getValue()
              console.log("Filtrado - Proveedores actuales:", currentProviders.length)
              console.log("Filtrado - Valor recibido:", value, "Tipo:", typeof value)

              // NUEVA LÓGICA DE FILTRADO
              let filterValue = ""
              let isTyping = false

              if (typeof value === "string") {
                // El usuario está escribiendo
                filterValue = value.toLowerCase().trim()
                isTyping = true
                console.log("Filtrado - Usuario escribiendo:", filterValue)
              } else if (typeof value === "number") {
                // Hay un ID seleccionado, mostrar todos los proveedores
                console.log("Filtrado - ID seleccionado:", value, "- Mostrando todos los proveedores")
                return currentProviders.slice()
              } else {
                // Valor vacío o null, mostrar todos
                console.log("Filtrado - Valor vacío - Mostrando todos los proveedores")
                return currentProviders.slice()
              }

              // Solo filtrar si el usuario está escribiendo y hay texto
              if (isTyping && filterValue) {
                const filtered = this._filterProviders(filterValue, currentProviders)
                console.log("Filtrado - Resultados filtrados:", filtered.length)
                return filtered
              } else {
                // Mostrar todos los proveedores
                console.log("Filtrado - Mostrando todos:", currentProviders.length)
                return currentProviders.slice()
              }
            }),
          )

          console.log("=== FIN CARGA PROVEEDORES INICIALES (EDIT) ===")
          resolve() // Resolver la promesa cuando los proveedores estén cargados
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
    console.log("_displayProviderName - providerId recibido:", providerId, "tipo:", typeof providerId)

    if (providerId === null || providerId === undefined) {
      console.log("_displayProviderName - providerId es null/undefined, retornando cadena vacía")
      return ""
    }

    if (typeof providerId === "object" && providerId !== null && "name" in providerId) {
      console.log("_displayProviderName - providerId es objeto con name:", (providerId as Provider).name)
      return (providerId as Provider).name
    }

    const currentProviders = this._allProviders.getValue()
    console.log("_displayProviderName - Proveedores disponibles:", currentProviders.length)

    if (!currentProviders || currentProviders.length === 0) {
      console.log("_displayProviderName - No hay proveedores disponibles")
      return ""
    }

    const providerIdNumber = typeof providerId === "string" ? Number.parseInt(providerId, 10) : Number(providerId)
    console.log("_displayProviderName - Buscando proveedor con ID:", providerIdNumber)

    const selectedProvider = currentProviders.find((provider) => provider.id === providerIdNumber)
    console.log("_displayProviderName - Proveedor encontrado:", selectedProvider)

    const result = selectedProvider ? selectedProvider.name : ""
    console.log("_displayProviderName - Resultado final:", result)

    return result
  }

  private _filterProviders(value: string, providersList: Provider[]): Provider[] {
    const filterValue = value.toLowerCase()
    return providersList.filter((provider) => provider.name.toLowerCase().includes(filterValue))
  }

  toggleAddProviderForm(event?: Event): void {
    // Prevenir que el evento se propague y active el autocomplete
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

      console.log("Enviando nuevo proveedor:", newProvider)

      this.providersService.create(newProvider).subscribe({
        next: (response: any) => {
          console.log("Respuesta completa del servidor:", response)

          // Verificar si la respuesta tiene la estructura esperada
          let savedProvider: Provider

          // Manejar diferentes estructuras de respuesta
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

          // Verificar que el proveedor tenga ID
          if (!savedProvider.id) {
            console.error("El proveedor guardado no tiene ID:", savedProvider)
            toast.error("Error: El proveedor no se guardó correctamente")
            return
          }

          // 1. Actualizar inmediatamente el BehaviorSubject con el nuevo proveedor
          const currentProviders = this._allProviders.getValue()
          console.log("Proveedores actuales antes de agregar:", currentProviders)

          // Verificar si el proveedor ya existe (evitar duplicados)
          const providerExists = currentProviders.some((provider) => provider.id === savedProvider.id)
          console.log("¿El proveedor ya existe?", providerExists)

          let updatedProviders: Provider[]

          if (providerExists) {
            // Si ya existe, reemplazarlo y mantenerlo al principio
            const otherProviders = currentProviders.filter((provider) => provider.id !== savedProvider.id)
            updatedProviders = [savedProvider, ...otherProviders]
            console.log("Proveedor reemplazado y movido al principio de la lista")
          } else {
            // Si no existe, agregarlo AL PRINCIPIO de la lista
            updatedProviders = [savedProvider, ...currentProviders]
            console.log("Proveedor agregado al PRINCIPIO de la lista")
          }

          console.log("Lista final de proveedores:", updatedProviders)
          console.log("Cantidad final de proveedores:", updatedProviders.length)

          this._allProviders.next(updatedProviders)

          // 2. Autoseleccionar el nuevo proveedor
          console.log("Autoseleccionando proveedor con ID:", savedProvider.id)

          this.editProdFormGroup.patchValue({
            providerId: savedProvider.id,
          })

          // 3. Forzar la actualización del control
          const providerFormControl = this.editProdFormGroup.get("providerId")
          if (providerFormControl) {
            providerFormControl.updateValueAndValidity()
            providerFormControl.markAsTouched()
            providerFormControl.markAsDirty()

            // Verificar el valor después de la actualización
            console.log("Valor del control después de patchValue:", providerFormControl.value)
          }

          // 4. Cerrar el formulario y limpiar
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

  /**
   * Maneja la selección de archivos y convierte la imagen a base64
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement

    if (!input.files?.length) {
      this.selectedFile = null // Resetear si no se selecciona archivo
      this.editProdFormGroup.patchValue({ url_image: null })
      return
    }

    const file = input.files[0]
    this.selectedFile = file // Guarda el archivo original

    // Validar tipo de archivo
    if (!file.type.match(/image\/(jpeg|png)/)) {
      this.errorMessage.set("Solo se permiten imágenes JPG o PNG")
      toast.error("Solo se permiten imágenes JPG o PNG")
      this.selectedFile = null
      this.editProdFormGroup.patchValue({ url_image: null })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set("La imagen no debe superar los 5MB")
      toast.error("La imagen no debe superar los 5MB")
      this.selectedFile = null
      this.editProdFormGroup.patchValue({ url_image: null })
      return
    }

    this.errorMessage.set(null)
    this.isLoading.set(true)

    // Convertir a base64 para la previsualización (opcional)
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

  /**
   * Elimina la imagen seleccionada
   */
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
    console.log(this.editProdFormGroup.value)
    if (this.editProdFormGroup.invalid) {
      toast.error("Por favor, completa el formulario correctamente.")
      return
    }

    this.isLoading.set(true)
    const formData = new FormData()

    console.log("this.editProdFormGroup.value", this.editProdFormGroup.value)
    if (this.editProdFormGroup.controls["type"].value != 1) {
      this.editProdFormGroup.patchValue({
        expirationDate: null,
      })
    }

    // Agregar los campos del formulario al FormData
    Object.keys(this.editProdFormGroup.value).forEach((key) => {
      if (key !== "url_image") {
        // No agregamos la cadena Base64 aquí
        formData.append(key, this.editProdFormGroup.get(key)?.value)
      }
    })

    // Agregar el archivo de la imagen al FormData
    if (this.selectedFile) {
      formData.append("url_image", this.selectedFile, this.selectedFile.name)
    }
    for (const entry of formData.entries()) {
      console.log(`${entry[0]}: ${entry[1]}`)
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

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.categoriesSubscription?.unsubscribe()
    this.providerSubscription?.unsubscribe()
    this._allProviders.complete()
  }
}
