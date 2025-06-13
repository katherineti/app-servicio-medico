import { Component, inject, signal } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { Category, MedicalSuppliesService } from '../../services/medical-supplies.service';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, Observable, startWith, Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../services/date-format.service';
import { AuthService } from '../../../services/auth.service';
import { ProvidersService } from '../../services/providers.service';
import { Provider, ProvidersAll } from '../../interfaces/providers.interface';

@Component({
  selector: 'app-create-medical-supplies',
  templateUrl: './create-medical-supplies.component.html',
  styleUrl: './create-medical-supplies.component.scss',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-VE' }, // Configura el locale directamente aquí
  ],
})
export class CreateMedicalSuppliesComponent {
  createProdFormGroup!: FormGroup;           categories: any[] = [];  private categoriesSubscription: Subscription | undefined;
  role:string='';
  imageField?: File;
  disableButton: boolean = false;

  imgBase64 = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  selectedFile: File | null = null;

  // Signal para controlar la visibilidad de las opciones 3 y 4 del estado
  showExpirationStatusOptions = signal(false);

  private _allProviders = new BehaviorSubject<Provider[]>([]);
  providers: Observable<Provider[]> = this._allProviders.asObservable();
  displayFn: (providerId: number | null) => string; 
  filteredProviders!: Observable<Provider[]>; // Observable para proveedores filtrados
  private providerSubscription: Subscription | undefined;
  showAddProviderForm = false;
  providerForm!: FormGroup;

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);
  private providersService = inject(ProvidersService);

  constructor( 
    public dialogRef: MatDialogRef<CreateMedicalSuppliesComponent>,
    ){
    this.buildProdForm();
    this.loadCategories();
    this.createProdFormGroup.patchValue({
      status: 1,
    });

    // Esto asegura que 'this' dentro de displayFn siempre apunte a la instancia de CreateMedicalSuppliesComponent.
    this.displayFn = this._displayProviderName.bind(this);
  }


  async ngOnInit() {
    this.role = await this.authService.getRol();
    this.subscribeToExpirationDateChanges();
    this.loadProvidersAndSetupAutocomplete();
  }

  buildProdForm() {
    this.createProdFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      providerId: [
        null,
        [
          Validators.required,
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      category: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      type: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      stock: [
        0,
        [
          Validators.required,
          Validators.maxLength(3),
          Validators.max(100)
        ],
      ],
      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      expirationDate: [
        '',
        [
          // Validators.required,
          Validators.maxLength(50),
        ],
      ],
      status: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      url_image: [null],
    });

    this.providerForm = this.formBuilder.group({
      name: ["", [Validators.required, Validators.maxLength(200)]],
      cedula: ["", [Validators.required, Validators.maxLength(10)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ["", [Validators.required, Validators.maxLength(50)]],
    });
  }

  /**
   * Suscribe a los cambios en el campo de fecha de vencimiento
   */
  private subscribeToExpirationDateChanges(): void {
    this.createProdFormGroup.get('expirationDate')?.valueChanges
      .pipe(
        debounceTime(300), // Espera 300ms después del último cambio para evitar cálculos excesivos
        distinctUntilChanged() // Solo emite si el valor es diferente al anterior
      )
      .subscribe((date: Date | null) => {
        this.checkExpirationStatus(date);
      });
  }
  /**
   * Calcula los días restantes hasta la fecha de vencimiento y actualiza la visibilidad de las opciones de estado.
   * @param expirationDate La fecha de vencimiento ingresada en el formulario.
   */
  private checkExpirationStatus(expirationDate: Date | null): void {
    const statusControl = this.createProdFormGroup.get('status');
    if (!statusControl) return;

    if (!expirationDate) { // Si no hay fecha de vencimiento
      this.showExpirationStatusOptions.set(false);// Esto oculta las opciones de "Próximo a vencerse" y "Caducado".
      if (statusControl.value === 3 || statusControl.value === 4) {
        statusControl.patchValue(1); // Restablecer a 'Disponible'
      }
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    const expiration = new Date(expirationDate);
    expiration.setHours(0, 0, 0, 0); // Normalizar a inicio del día

    // Calcula la diferencia en milisegundos y luego en días
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Lógica para mostrar las opciones 3 y 4:
    // Solo se muestran si faltan 90 días o menos (o ya ha expirado).
    this.showExpirationStatusOptions.set(diffDays <= 90);

    // Lógica para cambiar el valor del campo 'status' automáticamente:
    // Asegurarse de que el tipo de producto es relevante para la fecha de vencimiento
    const productType = this.createProdFormGroup.get('type')?.value;
    const isMedicalProduct = productType == 1 ; 

    if (isMedicalProduct) {
          if (diffDays <= 0) { // Si la fecha de vencimiento es hoy o ya pasó (0 días o menos)
              // Solo cambiar si el rol es admin o almacen, y el status actual no es ya 4 (Caducado)
              if ((this.role === 'admin' || this.role === 'almacen') && statusControl.value !== 4) {
                  statusControl.patchValue(4); // Cambiar a 'Caducado'
                  toast.info('El producto ha caducado o vence hoy. El estado se ha actualizado a "Caducado".');
              }
          } else if (diffDays <= 90) { // Si faltan 90 días o menos para expirar 
              // Solo cambiar si el rol es admin o almacen, y el status actual no es 3 (Próximo a vencerse)
              if ((this.role === 'admin' || this.role === 'almacen') && statusControl.value !== 3) {
                  statusControl.patchValue(3); // Cambiar a 'Próximo a vencerse'
                  toast.info('El producto está próximo a vencerse. El estado se ha actualizado a "Próximo a Vencerse".');
              }
          } else {
              // Si el producto tiene más de 90 días para vencer y el estado fue cambiado automáticamente a 3 o 4,
              // lo reiniciamos a 1 (Disponible) si el rol lo permite.
              // Esto solo aplica si el usuario no lo cambió manualmente a 1 o 2.
              if ((this.role === 'admin' || this.role === 'almacen') && (statusControl.value === 3 || statusControl.value === 4)) {
                statusControl.patchValue(1); // Resetear a 'Disponible'
                toast.info('El producto tiene más de 90 días para vencer. El estado se ha restablecido a "Disponible".');
              }
          }
    }

  }

  /**
   * Maneja la selección de archivos y convierte la imagen a base64
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      this.selectedFile = null; // Resetear si no se selecciona archivo
      this.createProdFormGroup.patchValue({ url_image: null });
      return;
    }

    const file = input.files[0];
    this.selectedFile = file; // Guarda el archivo original

    // Validar tipo de archivo
    if (!file.type.match(/image\/(jpeg|png)/)) {
      this.errorMessage.set("Solo se permiten imágenes JPG o PNG");
      toast.error("Solo se permiten imágenes JPG o PNG");
      this.selectedFile = null;
      this.createProdFormGroup.patchValue({ url_image: null });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set("La imagen no debe superar los 5MB");
      toast.error("La imagen no debe superar los 5MB");
      this.selectedFile = null;
      this.createProdFormGroup.patchValue({ url_image: null });
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    // Convertir a base64 para la previsualización (opcional)
    const reader = new FileReader();
    reader.onload = () => {
      this.imgBase64.set(reader.result as string);
      this.isLoading.set(false);
    };
    reader.onerror = () => {
      this.errorMessage.set("Error al procesar la imagen");
      toast.error("Error al procesar la imagen");
      this.isLoading.set(false);
    };
    reader.readAsDataURL(file);
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
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save() {
    if (this.createProdFormGroup) {
      return this.guardarProducto();
    }
  }

  guardarProducto(): void {console.log(this.createProdFormGroup.value)

    if (this.createProdFormGroup.invalid ) {
      toast.error("Por favor, completa el formulario correctamente.");
      return;
    }

    this.isLoading.set(true);
    const formData = new FormData();


    Object.keys(this.createProdFormGroup.value).forEach(key => {
      if (key !== 'url_image') { 
        formData.append(key, this.createProdFormGroup.get(key)?.value);
      }
    });

    // Agregar el archivo de la imagen al FormData
    if (this.selectedFile) {
      formData.append('url_image', this.selectedFile, this.selectedFile.name);
    }

    for (const entry of formData.entries()) {
      console.log(`${entry[0]}: ${entry[1]}`);
    }

     this.medicalSuppliesService
      .createProduct(formData)
      .subscribe({
        complete: () => {
          toast.success('Producto creado exitosamente');
          this.isLoading.set(false);
          this.createProdFormGroup.reset();
          this.imgBase64.set(null);
          this.selectedFile = null;
          this.closeDialog();
        },
        error: (error) => {
          this.swalService.closeload();
          this.disableButton = false;
          this.errorMessage.set('Error al crear el producto.');
          this.isLoading.set(false);
          console.error('Error al crear el producto', error);
          if (error.status === 413) {
            toast.error('La imagen es demasiado grande. Por favor, selecciona una imagen más pequeña.');
          } else {
            toast.error('Error al crear el producto. Por favor, inténtalo de nuevo.');
          }
        }
      });
  }

  loadCategories(): void {
    this.categoriesSubscription = this.medicalSuppliesService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error al cargar las categorías:', error);
      }
    );
  }

  // Métodos para el autocompletado de proveedores
  loadProvidersAndSetupAutocomplete(): void {
    this.providerSubscription = this.providersService.get().subscribe({
      next: (data: ProvidersAll) => {
        this._allProviders.next(data.list); // <-- Actualiza el BehaviorSubject con la lista de proveedores
        console.log("providers cargados (via BehaviorSubject):", data.list);

        // Corrección del error de TypeScript: Solo intenta acceder a data.list[0] si hay elementos.
        console.log("Tipo del primer ID cargado:", data.list.length > 0 ? typeof data.list[0].id : 'N/A (array vacío)');

        // Ahora, configuramos `filteredProviders` usando el BehaviorSubject
        this.filteredProviders = this.createProdFormGroup.get('providerId')!.valueChanges.pipe(
          startWith(''),
          debounceTime(300),
          map(value => {
            const currentProviders = this._allProviders.getValue(); // Obtiene la última lista del BehaviorSubject
            const filterValue = typeof value === 'string' ? value : value?.name; // 'value' puede ser string o el objeto Provider
            return filterValue ? this._filterProviders(filterValue, currentProviders) : currentProviders.slice();
          })
        );
      },
      error: (error: any) => {
        console.error('Error al cargar los proveedores:', error);
        toast.error('Error al cargar los proveedores. Por favor, inténtalo de nuevo.');
      },
      complete: () => {
        console.log('Carga de proveedores completada.');
      }
    });
  }

 private _displayProviderName(providerId: number | null): string {
    console.log('--- _displayProviderName llamado ---');
    console.log('providerId recibido:', providerId);
    console.log('Tipo de providerId recibido:', typeof providerId);

    if (!providerId) {
      console.log('providerId es nulo o indefinido. Retornando cadena vacía.');
      return '';
    }

    // Ya no debería ser undefined aquí si se enlazó correctamente
    // y el BehaviorSubject se inicializó.
    const currentProviders = this._allProviders.getValue(); // <-- AHORA SÍ DEBERÍA FUNCIONAR

    if (!currentProviders || currentProviders.length === 0) {
      console.log('this._allProviders.getValue() está vacío o no cargado aún. Retornando cadena vacía.');
      return '';
    }

    console.log('Primer elemento en currentProviders:', currentProviders[0]);
    console.log('Tipo de ID del primer proveedor en currentProviders:', typeof currentProviders[0].id);

    const selectedProvider = currentProviders.find(provider => provider.id === Number(providerId));

    console.log('Proveedor encontrado por _displayProviderName:', selectedProvider);

    return selectedProvider ? selectedProvider.name : '';
  }

  // CAMBIO CLAVE: `_filterProviders` ahora toma la lista como argumento
  private _filterProviders(value: string, providersList: Provider[]): Provider[] {
    const filterValue = value.toLowerCase();
    // providersList ya es el array que viene del BehaviorSubject, podría estar vacío.
    return providersList.filter(provider => provider.name.toLowerCase().includes(filterValue));
  }


  toggleAddProviderForm(): void {
    this.showAddProviderForm = !this.showAddProviderForm;

    if (!this.showAddProviderForm) {
      this.providerForm.reset();
    }
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
    this.providerSubscription?.unsubscribe();
    this._allProviders.complete(); // IMPORTANTE: Completar el BehaviorSubject al destruir
  }

}