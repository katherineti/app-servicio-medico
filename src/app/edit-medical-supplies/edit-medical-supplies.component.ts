import { Component, Inject, inject, SecurityContext, signal } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { IProduct } from '../medical-supplies/interfaces/medical-supplies.interface';
import { MedicalSuppliesService } from '../medical-supplies/services/medical-supplies.service';
import { DomSanitizer } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import { API_URL } from '../../../environment';

@Component({
  selector: 'app-edit-medical-supplies',
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-medical-supplies.component.html',
  styleUrl: './edit-medical-supplies.component.scss'
})

export class EditMedicalSuppliesComponent {
  readonly dialogRef = inject(MatDialogRef<EditMedicalSuppliesComponent>);
  editProdFormGroup!: FormGroup;
  imageField?: File;
  disableButton: boolean = false;
  selectedProduct!: IProduct;

  imgBase64 = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedFile: File | null = null;

  API_URL= API_URL;
  edit:boolean | undefined;
  imageError = false;

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private medicalSuppliesService = inject(MedicalSuppliesService);

  constructor( 
      @Inject(MAT_DIALOG_DATA) 
      public data: IProduct,
      private readonly sanitizer: DomSanitizer,
    ){
    this.buildForm();
  }

  async ngOnInit() {

    this.selectedProduct = this.data;   console.log("selectedProduct ", this.selectedProduct );
    this.edit = this.data.actionEdit; 

    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedProduct?.id !== null && this.selectedProduct?.id !== undefined) {
      return true;
    }
    console.log("falta id")
    return false;
  }

  buildForm() {
    this.editProdFormGroup = this.formBuilder.group({
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
      status: [
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

  setForm() {
    if(!this.edit){
      this.editProdFormGroup.controls['name'].disable();
      this.editProdFormGroup.controls['description'].disable();
      this.editProdFormGroup.controls['category'].disable();
      this.editProdFormGroup.controls['type'].disable();
      this.editProdFormGroup.controls['stock'].disable();
      this.editProdFormGroup.controls['status'].disable();
    }

    this.editProdFormGroup.controls['code'].disable();

    this.editProdFormGroup.patchValue({
      id: this.selectedProduct?.id,
      name: this.selectedProduct?.name,
      description: this.selectedProduct?.description,
      category: this.selectedProduct?.categoryId,
      type: this.selectedProduct?.type,
      stock: this.selectedProduct?.stock,
      code: this.selectedProduct?.code,
      date_entry: this.selectedProduct?.createdAt,
      url_image:this.selectedProduct?.url_image,
      status:this.selectedProduct?.statusId,
      });

      if (this.selectedProduct.url_image) {
        this.imgBase64.set( API_URL+'uploads'+ this.selectedProduct?.url_image);
      }
  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save(){
    if (this.checkPropId) {
      // return this.updateProduct();
      return this.guardarProducto();
    }
  }

  removeImage(): void {
    this.imgBase64.set(null)
    this.editProdFormGroup.patchValue({
      url_image: null,
    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      this.selectedFile = null; // Resetear si no se selecciona archivo
      this.editProdFormGroup.patchValue({ url_image: null });
      return;
    }

    const file = input.files[0];
    this.selectedFile = file; // Guarda el archivo original

    // Validar tipo de archivo
    if (!file.type.match(/image\/(jpeg|png)/)) {
      this.errorMessage.set("Solo se permiten imágenes JPG o PNG");
      toast.error("Solo se permiten imágenes JPG o PNG");
      this.selectedFile = null;
      this.editProdFormGroup.patchValue({ url_image: null });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set("La imagen no debe superar los 5MB");
      toast.error("La imagen no debe superar los 5MB");
      this.selectedFile = null;
      this.editProdFormGroup.patchValue({ url_image: null });
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

  guardarProducto(): void {console.log(this.editProdFormGroup.value)
    if (this.editProdFormGroup.invalid ) {
      toast.error("Por favor, completa el formulario correctamente.");
      return;
    }

    this.isLoading.set(true);
    const formData = new FormData();

    // Agregar los campos del formulario al FormData
    Object.keys(this.editProdFormGroup.value).forEach(key => {
      if (key !== 'url_image') { // No agregamos la cadena Base64 aquí
        formData.append(key, this.editProdFormGroup.get(key)?.value);
      }
    });

    // Agregar el archivo de la imagen al FormData
    if (this.selectedFile) {
      formData.append('url_image', this.selectedFile, this.selectedFile.name);
    }
    for (const entry of formData.entries()) {
      console.log(`${entry[0]}: ${entry[1]}`);
    }
    const id = this.selectedProduct.id;

     this.medicalSuppliesService
      .updateProduct(id, formData)
      .subscribe({
        complete: () => {
          toast.success('Producto editado.');
          this.isLoading.set(false);
          this.editProdFormGroup.reset();
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

  handleImageError() {
    this.imageError = true;
    this.imgBase64.set( '../../assets/images/products/default_product_image.png');
  }

}