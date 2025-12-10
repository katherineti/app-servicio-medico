import { Component, Input, inject, ViewChild, ElementRef } from '@angular/core';
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
  isUploading: boolean = false; 
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; 
  private backupService = inject(BackupService);
  private snackBar = inject(MatSnackBar);

  onDownloadDbClick(): void {
    if (this.isDownloading || this.isUploading || (this.userRole !== 'admin' && this.userRole !== 'auditor')) return;
    this.isDownloading = true;
    this.snackBar.open('Iniciando descarga de la base de datos...', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
    this.backupService.downloadDatabaseBackup().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `db_backup_${dateStr}.sql`; 
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
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.toLowerCase().endsWith('.sql')) {
          this.uploadFile(file);
      } else {
          this.snackBar.open('❌ Error: Solo se permiten archivos .sql', 'Cerrar', { duration: 5000 });
          input.value = ''; 
      }
    }
  }
  uploadFile(file: File) {
    if(this.userRole !== 'admin'){
      this.snackBar.open('Acción no autorizada para restauración.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isUploading = true;
    this.snackBar.open('⏳ Iniciando restauración de la base de datos. Esto puede tardar varios segundos...', 'Cerrar');
    this.backupService.uploadDatabaseBackup(file).subscribe({
      next: (response: any) => {
        this.snackBar.open(`✅ ${response.message || 'Restauración completada con éxito.'}`, 'Cerrar', { 
            duration: 8000, 
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'] 
        });
        this.isUploading = false;
      },
      error: (err: HttpErrorResponse) => {
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
          if(this.fileInput.nativeElement){
            this.fileInput.nativeElement.value = ''; 
          }
      }
    });
  }
}