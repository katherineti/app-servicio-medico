import { Component, EventEmitter, Input, Output, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DomSanitizer, type SafeUrl } from "@angular/platform-browser"
import { MaterialModule } from "../material/material.module"
import { toast } from "ngx-sonner"
export interface ImageFile {
  file: File;
  preview: SafeUrl;
  isRemote?: boolean;
  remoteUrl?: string;
}
@Component({
  selector: "app-image-upload",
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: "./image-upload.component.html",
  styleUrls: ["./image-upload.component.scss"],
})
export class ImageUploadComponent {
  private sanitizer = inject(DomSanitizer)
  @Input() maxImages = 10
  @Input() maxSizeInMB = 5
  @Input() images: ImageFile[] = []
  @Input() show_uploadImageIcon = true
  @Output() imagesChange = new EventEmitter<ImageFile[]>()
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
  handleSelectedFiles(files: FileList) {
    if (this.images.length + files.length > this.maxImages) {
      this.showError(`Solo puedes subir un máximo de ${this.maxImages} imágenes`)
      return
    }
    const newImages = [...this.images]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const sizeInMB = file.size / (1024 * 1024)
      if (sizeInMB > this.maxSizeInMB) {
        this.showError(`La imagen "${file.name}" excede el tamaño máximo de ${this.maxSizeInMB}MB`)
        continue
      }
      const preview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
      newImages.push({ file, preview })
    }
    this.images = newImages
    this.imagesChange.emit(this.images)
  }
  removeImage(index: number) {
    const newImages = [...this.images]
    newImages.splice(index, 1)
    this.images = newImages
    this.imagesChange.emit(this.images)
  }
  private showError(message: string) {
    console.error(message);
    toast.error(message);
  }
}