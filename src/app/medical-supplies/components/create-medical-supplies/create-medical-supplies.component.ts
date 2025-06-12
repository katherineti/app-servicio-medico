import { Component, inject, signal } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { Category, MedicalSuppliesService } from '../../services/medical-supplies.service';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../services/date-format.service';
import { AuthService } from '../../../services/auth.service';

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

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);

  constructor( 
    public dialogRef: MatDialogRef<CreateMedicalSuppliesComponent>,
    ){
    this.buildAddUserForm();
    this.loadCategories();
    this.createProdFormGroup.patchValue({
      status: 1,
    });
  }

  async ngOnInit(){
    this.role = await this.authService.getRol();
    this.subscribeToExpirationDateChanges(); // Suscribirse a los cambios de fecha aquí
  }

  buildAddUserForm() {
    this.createProdFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
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

}