import { Component, Input, inject, ViewChild, ElementRef } from '@angular/core'; // ✅ Añadidos ViewChild y ElementRef
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { BackupService } from './backup.service';

@Component({
  selector: 'app-db-backup-action',
  standalone: true,
  imports: [CommonModule, MaterialModule, FeatherIconsModule],
  templateUrl: './db-backup-action.component.html',
  styleUrl: './db-backup-action.component.css',
})
export class DbBackupActionComponent {
  @Input() userRole: string | null = null;
  
  isDownloading: boolean = false;
  // ✅ NUEVA PROPIEDAD: Estado para el proceso de restauración
  isUploading: boolean = false; 

  // ✅ NUEVA REFERENCIA: Referencia al input de archivo oculto
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; 

  private backupService = inject(BackupService);
  private snackBar = inject(MatSnackBar);

  /**
   * Maneja el evento de clic para iniciar la descarga de la base de datos.
   */
  onDownloadDbClick(): void {
    // Si el rol no es admin o auditor, O ESTÁ SUBIENDO, o ya se está descargando, no hacer nada.
    if (this.isDownloading || this.isUploading || (this.userRole !== 'admin' && this.userRole !== 'auditor')) return;

    this.isDownloading = true;
    
    // Muestra una notificación inicial
    this.snackBar.open('Iniciando descarga de la base de datos...', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });

    this.backupService.downloadDatabaseBackup().subscribe({
      next: (blob: Blob) => {
        // 1. Crear una URL local temporal para el Blob
        const url = window.URL.createObjectURL(blob);
        
        // 2. Crear un elemento <a> invisible para forzar la descarga
        const a = document.createElement('a');
        a.href = url;
        
        // Asignar un nombre de archivo dinámico
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        a.download = `db_backup_${dateStr}.sql`; 
        
        // 3. Simular el clic y limpiar
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        this.isDownloading = false;
        this.snackBar.open('Descarga completada.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isDownloading = false;
        let errorMessage = 'Error desconocido al descargar la base de datos.';
        if (err.status === 401 || err.status === 403) {
            errorMessage = 'Acceso no autorizado para realizar el backup.';
        } else if (err.status === 500) {
            errorMessage = 'Error del servidor al generar el archivo de backup.';
        }

        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        
        console.error(`Error al descargar la base de datos:`, err);
      }
    }); 
  }

  // ===================================================================
  // ✅ NUEVA LÓGICA: Manejo de la restauración
  // ===================================================================

  /**
   * Captura el evento cuando se selecciona un archivo SQL y lo procesa.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Verifica que sea un archivo .sql antes de subir
      if (file.name.toLowerCase().endsWith('.sql')) {
          this.uploadFile(file);
      } else {
          this.snackBar.open('❌ Error: Solo se permiten archivos .sql', 'Cerrar', { duration: 5000 });
          input.value = ''; // Limpiar el input para permitir la re-selección
      }
    }
  }

  /**
   * Ejecuta la subida del archivo al backend para su restauración.
   */
  uploadFile(file: File) {
    // Bloquear si el rol no es 'admin' (La restauración es una operación de alta criticidad)
    if(this.userRole !== 'admin'){
        this.snackBar.open('Acción no autorizada para restauración.', 'Cerrar', { duration: 3000 });
        return;
    }

    this.isUploading = true;
    this.snackBar.open('⏳ Iniciando restauración de la base de datos. Esto puede tardar varios segundos...', 'Cerrar');

    // Suponiendo que el BackupService tiene un método 'uploadDatabaseBackup'
    // que envía el archivo al backend (ej: a un endpoint POST /db-backup/restore)
    this.backupService.uploadDatabaseBackup(file).subscribe({
      next: (response: any) => { // response puede ser { message: string }
        this.snackBar.open(`✅ ${response.message || 'Restauración completada con éxito.'}`, 'Cerrar', { 
            duration: 8000, 
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'] 
        });
        this.isUploading = false;
      },
      error: (err: HttpErrorResponse) => {
        // Mostrar mensaje de error del backend (si existe)
        const message = err.error?.message || 'Error desconocido al intentar restaurar la DB. Verifique el formato SQL y los permisos.';
        this.snackBar.open(`❌ Fallo en la restauración: ${message}`, 'Cerrar', { 
            duration: 10000, 
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'] 
        });
        this.isUploading = false;
      },
      complete: () => {
          // Limpiar el input de archivo siempre al terminar (éxito o error)
          if(this.fileInput.nativeElement){
            this.fileInput.nativeElement.value = ''; 
          }
      }
    });
  }
}