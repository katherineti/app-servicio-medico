import { Component, inject, signal } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { FormBuilder, type FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
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

  // Signal para controlar la visibilidad de las opciones 3 y 4 del estado
  showExpirationStatusOptions = signal(false)

  private _allProviders = new BehaviorSubject<Provider[]>([])
  providers: Observable<Provider[]> = this._allProviders.asObservable()
  displayFn: (providerId: number | null) => string
  filteredProviders!: Observable<Provider[]>
  private providerSubscription: Subscription | undefined
  showAddProviderForm = false
  providerForm!: FormGroup

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
    this.subscribeToExpirationDateChanges()
    this.loadProvidersAndSetupAutocomplete()
  }

  buildProdForm() {
    this.createProdFormGroup = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(50)]],
      providerId: [null, [Validators.required]],
      description: ["", [Validators.required, Validators.maxLength(50)]],
      category: ["", [Validators.required, Validators.maxLength(50)]],
      type: ["", [Validators.required, Validators.maxLength(50)]],
      stock: [0, [Validators.required, Validators.maxLength(3), Validators.max(100)]],
      code: ["", [Validators.required, Validators.maxLength(50)]],
      expirationDate: ["", [Validators.maxLength(50)]],
      status: ["", [Validators.required, Validators.maxLength(50)]],
      url_image: [null],
    })

    this.providerForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    })
  }

  /**
   * Suscribe a los cambios en el campo de fecha de vencimiento
   */
  private subscribeToExpirationDateChanges(): void {
    this.createProdFormGroup
      .get("expirationDate")
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((date: Date | null) => {
        this.checkExpirationStatus(date)
      })
  }

  /**
   * Calcula los días restantes hasta la fecha de vencimiento y actualiza la visibilidad de las opciones de estado.
   */
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
        if ((this.role === "admin" || this.role === "almacen") && statusControl.value !== 4) {
          statusControl.patchValue(4)
          toast.info('El producto ha caducado o vence hoy. El estado se ha actualizado a "Caducado".')
        }
      } else if (diffDays <= 90) {
        if ((this.role === "admin" || this.role === "almacen") && statusControl.value !== 3) {
          statusControl.patchValue(3)
          toast.info('El producto está próximo a vencerse. El estado se ha actualizado a "Próximo a Vencerse".')
        }
      } else {
        if (
          (this.role === "admin" || this.role === "almacen") &&
          (statusControl.value === 3 || statusControl.value === 4)
        ) {
          statusControl.patchValue(1)
          toast.info('El producto tiene más de 90 días para vencer. El estado se ha restablecido a "Disponible".')
        }
      }
    }
  }

  /**
   * Maneja la selección de archivos y convierte la imagen a base64
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement

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

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set("La imagen no debe superar los 5MB")
      toast.error("La imagen no debe superar los 5MB")
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

  /**
   * Elimina la imagen seleccionada
   */
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
    console.log(this.createProdFormGroup.value)

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

        // Verificar que se guardaron correctamente en el BehaviorSubject
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

          // 1. DEBUGGING: Verificar el estado actual del BehaviorSubject
          const currentProviders = this._allProviders.getValue()
          console.log("=== DEBUGGING PROVIDERS ===")
          console.log("Proveedores actuales en BehaviorSubject:", currentProviders)
          console.log("Cantidad de proveedores actuales:", currentProviders.length)
          console.log("Nuevo proveedor a agregar:", savedProvider)

          // 2. Verificar si el proveedor ya existe (evitar duplicados)
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

          // 3. Actualizar el BehaviorSubject
          this._allProviders.next(updatedProviders)

          // 4. Verificar que el BehaviorSubject se actualizó correctamente
          const verifyProviders = this._allProviders.getValue()
          console.log("Verificación - Proveedores después de actualizar BehaviorSubject:", verifyProviders)
          console.log("Verificación - Cantidad después de actualizar:", verifyProviders.length)

          // 5. Autoseleccionar el nuevo proveedor
          console.log("Autoseleccionando proveedor con ID:", savedProvider.id)

          this.createProdFormGroup.patchValue({
            providerId: savedProvider.id,
          })

          // 6. Forzar la actualización del control
          const providerFormControl = this.createProdFormGroup.get("providerId")
          if (providerFormControl) {
            providerFormControl.updateValueAndValidity()
            providerFormControl.markAsTouched()
            providerFormControl.markAsDirty()

            // Verificar el valor después de la actualización
            console.log("Valor del control después de patchValue:", providerFormControl.value)
          }

          // 7. Verificar que displayFn funcione correctamente
          const displayName = this._displayProviderName(savedProvider.id)
          console.log("Display name para el nuevo proveedor:", displayName)

          // 8. Cerrar el formulario y limpiar
          this.showAddProviderForm = false
          this.providerForm.reset()

          console.log("=== FIN DEBUGGING PROVIDERS ===")
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
      console.log("Formulario de proveedor inválido:", this.providerForm.errors)
      toast.error("Por favor, completa todos los campos requeridos del proveedor.")
    }
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe()
    this.providerSubscription?.unsubscribe()
    this._allProviders.complete()
  }
}
