import { Component, EventEmitter, Input, Output, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DomSanitizer, type SafeUrl } from "@angular/platform-browser"
import { MaterialModule } from "../material/material.module"
import { toast } from "ngx-sonner"

export interface ImageFile {
  file: File;
  preview: SafeUrl;

  isRemote?: boolean; // Keep these for distinguishing
  remoteUrl?: string; // Keep these for distinguishing
}

@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.scss"],
})
export class ImageUploadComponent {
  @Input() maxImages = 10
  @Input() maxSizeInMB = 5
  @Input() images: ImageFile[] = []
  @Input() show_uploadImageIcon = true

  @Output() imagesChange = new EventEmitter<ImageFile[]>()

  private sanitizer = inject(DomSanitizer)

  // Método para abrir el selector de archivos
  openFileSelector() {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.multiple = true

    fileInput.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        this.handleSelectedFiles(files)
      }
    }
    fileInput.click();
  }

  // Método para manejar los archivos seleccionados
  handleSelectedFiles(files: FileList) {
    // Verificar si se excede el límite de imágenes
    if (this.images.length + files.length > this.maxImages) {
      this.showError(`Solo puedes subir un máximo de ${this.maxImages} imágenes`)
      return
    }

    // Procesar cada archivo
    const newImages = [...this.images]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Verificar el tamaño del archivo
      const sizeInMB = file.size / (1024 * 1024)
      if (sizeInMB > this.maxSizeInMB) {
        this.showError(`La imagen "${file.name}" excede el tamaño máximo de ${this.maxSizeInMB}MB`)
        continue
      }
      // Crear vista previa
      const preview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
      // Añadir a la lista de imágenes seleccionadas
      newImages.push({ file, preview })
    }

    this.images = newImages
    this.imagesChange.emit(this.images)
  }

  // Método para eliminar una imagen
  removeImage(index: number) {
    const newImages = [...this.images]
    newImages.splice(index, 1)
    this.images = newImages
    this.imagesChange.emit(this.images)
  }

  // Método para mostrar errores (puedes reemplazarlo con tu sistema de notificaciones)
  private showError(message: string) {
    console.error(message);
    toast.error(message);
  }
}