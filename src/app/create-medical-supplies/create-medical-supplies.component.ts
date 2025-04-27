import { Component, inject, signal } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { Category, MedicalSuppliesService } from '../medical-supplies/services/medical-supplies.service';
import { Subscription, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-create-medical-supplies',
  templateUrl: './create-medical-supplies.component.html',
  styleUrl: './create-medical-supplies.component.scss',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
})
export class CreateMedicalSuppliesComponent {
  createProdFormGroup!: FormGroup;
  imageField?: File;
  disableButton: boolean = false;

  imgBase64 = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  selectedFile: File | null = null;

  categories: any[] = [];
  private categoriesSubscription: Subscription | undefined;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);

  constructor( 
    public dialogRef: MatDialogRef<CreateMedicalSuppliesComponent>,
    ){
    this.buildAddUserForm();
    this.loadCategories();
  }

  buildAddUserForm() {
    this.createProdFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      category: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      type: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      stock: [
        0,
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(3),
          Validators.max(100)
        ],
      ],
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
        ],
      ],
      url_image: [null],
    });

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