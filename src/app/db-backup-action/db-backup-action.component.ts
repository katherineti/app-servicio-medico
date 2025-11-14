import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MaterialModule } from '../../../material/material.module';
// import { FeatherIconsModule } from '../../../feathericons/feathericons.module';
// import { BackupService } from '../../../services/backup.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { BackupService } from '../services/backup.service';

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

  private backupService = inject(BackupService);
  private snackBar = inject(MatSnackBar);

  /**
   * Maneja el evento de clic para iniciar la descarga de la base de datos.
   */
  onDownloadDbClick(): void {
    // Si el rol no es admin o auditor, o ya se está descargando, no hacer nada.
    if (this.isDownloading || (this.userRole !== 'admin' && this.userRole !== 'auditor')) return;

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
}