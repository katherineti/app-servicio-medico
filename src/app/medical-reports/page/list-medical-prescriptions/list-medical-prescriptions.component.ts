import { Component, inject } from '@angular/core';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material/material.module';
import { FeatherIconsModule } from '../../../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MedicalReportsDialogComponent } from './../../components/medical-reports-dialog/medical-reports-dialog.component';
import { SwalService} from '../../../services/swal.service';
import { MedicalReportsCreateComponent } from './../../components/medical-reports-create/medical-reports-create.component';
import { HeaderTitleComponent } from '../../../header-title/header-title.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MedicalReportsService } from './../../services/medical-reports.service';
import { ISearchMedicalPrescription, IUser, IMedicalReports, IMedicalPrescriptioPagination, IMedicalPrescriptios } from './../../interfaces/medical-reports.interface';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicalPrescriptionService } from '../../services/medical-prescription.service';

/**
* @title pagination table medical prescriptions: Recipes
*/
@Component({
  selector: 'app-list-medical-prescriptions',
  templateUrl: './list-medical-prescriptions.component.html',
  styleUrl: './list-medical-prescriptions.component.scss',
imports: [
  CommonModule,
  FeatherIconsModule,
  MaterialModule,
  MatIconModule,
  HeaderTitleComponent,
  ReactiveFormsModule 
],
providers:[MedicalReportsService]
})
export class ListMedicalPrescriptionsComponent {
  medicalReportId: string | null = null
  role:string= '';
  displayedColumns = [ 'doctorName','patientName','apsCenter','insurance','createdAt','action'];
  dataSource: any = new MatTableDataSource<IUser>();
/*   searhMedico = new FormControl();
  searhPatient = new FormControl();
  searhDate = new FormControl(); */
  pageSize: number = 5;
  pageIndex = 0;
  isGeneratingPdf = false;

  private medicalPrescriptionService = inject(MedicalPrescriptionService)
  public dialog = inject(MatDialog);
  private readonly paginatorIntl = inject(MatPaginatorIntl);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  private router = inject(Router)
  private snackBar = inject(MatSnackBar);
  private activatedRoute = inject(ActivatedRoute)

  constructor() {

    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'doctorName', 'patientName', 'recipeContent', 'createdAt', 'expirationDate', 'action']
    : [ 'doctorName', 'patientName', 'recipeContent', 'createdAt', 'expirationDate', 'action'];
    });

    this.dataSource['length'] = 0;
    this.paginatorIntl.itemsPerPageLabel = 'Registros por página';
  }
  
  async ngOnInit(){
    this.medicalReportId = this.activatedRoute.snapshot.paramMap.get("reportId");
    this.getAllMedicalPrescriptions(this.pageIndex, this.pageSize);
    console.log("Parametro medical Report Id:  " , this.medicalReportId, typeof this.medicalReportId )

    this.role = await this.authService.getRol();
  }

/*   get SearhMedico() {
    return this.searhMedico.value;
  }

  get SearchPatient() {
    return this.searhPatient.value;
  }

  get SearhDate() {
    return this.searhDate.value;
  } */

  openDialogCreateMedicalPrescription(data?: any): void {
    console.log("seleccionado",data)
    data.actionEdit=false;
    const ref = this.dialog.open(MedicalReportsDialogComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalPrescriptions(this.pageIndex, this.pageSize);
    });
  }

   /**
   * Navega a la página de creación de recetas médicas, pasando el ID del informe.
   * @param medicalReport El informe médico para el cual se creará la receta.
   */
  navigateToCreateMedicalPrescription(medicalReport: IMedicalReports): void {
    console.log("seleccionado ", medicalReport)
    this.router.navigate(["/medical-prescriptions/create", medicalReport.id])
  }

  openDialogCreate(data?: any): void {
    const ref = this.dialog.open(MedicalReportsCreateComponent, {
      data: data || null,
      disableClose: true
    });

    ref.afterClosed().subscribe(() => {
      this.getAllMedicalPrescriptions(this.pageIndex, this.pageSize);
    });
  }

  getAllMedicalPrescriptions(page: number, take: number) {
    const parms: ISearchMedicalPrescription = {
      page: page + 1, //page del paginador inicia en 0
      take: take,
      medicalReportId: Number(this.medicalReportId)
    };
    this.medicalPrescriptionService.getAllMedicalPrescription(parms).subscribe((data: IMedicalPrescriptioPagination) => {
      this.dataSource = new MatTableDataSource<IMedicalPrescriptios>(data.list);
      this.dataSource.length = data.total;
    });
  }
  handlePageEvent(event: PageEvent) {
    this.getAllMedicalPrescriptions(event.pageIndex, event.pageSize);
  }

  // PDF
  generatePdf(element: any): void {
    if (!element.id || this.isGeneratingPdf) {
      return
    }

    this.isGeneratingPdf = true

    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open("Generando PDF de receta médica...", "", {
      duration: undefined,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    })

    this.medicalPrescriptionService.generateRecipePdf(element.id).subscribe({
      next: (pdfBlob: Blob) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss()
        this.isGeneratingPdf = false

        // Crear URL del blob y descargar el archivo
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `receta-medica-${element.patientName || "paciente"}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // Mostrar mensaje de éxito
        this.snackBar.open("PDF de receta médica generado correctamente", "Cerrar", {
          duration: 3000,
          horizontalPosition: "end",
          verticalPosition: "top",
        })
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss()
        this.isGeneratingPdf = false

        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar el PDF: ${err.message || "Error desconocido"}`, "Cerrar", {
          duration: 5000,
          horizontalPosition: "end",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        })

        console.error("Error al generar el PDF:", err)
      },
    })
  }

  //previewPdf() no esta en uso
  previewPdf(element: any): void {
    if (!element.id || this.isGeneratingPdf) {
      return
    }

    this.isGeneratingPdf = true

    // Mostrar indicador de carga
    const loadingToast = this.snackBar.open("Generando vista previa...", "", {
      duration: undefined,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    })

    this.medicalPrescriptionService.previewRecipePdf(element.id).subscribe({
      next: (pdfBlob: Blob) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss()
        this.isGeneratingPdf = false

        // Crear URL del blob y abrir en nueva ventana
        const url = window.URL.createObjectURL(pdfBlob)
        const newWindow = window.open(url, "_blank")

        if (!newWindow) {
          // Si el popup fue bloqueado, mostrar mensaje
          this.snackBar.open("Por favor, permite ventanas emergentes para ver la vista previa", "Cerrar", {
            duration: 5000,
            horizontalPosition: "end",
            verticalPosition: "top",
          })
        }

        // Limpiar URL después de un tiempo
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 10000)
      },
      error: (err) => {
        // Cerrar el indicador de carga
        loadingToast.dismiss()
        this.isGeneratingPdf = false

        // Mostrar mensaje de error
        this.snackBar.open(`Error al generar la vista previa: ${err.message || "Error desconocido"}`, "Cerrar", {
          duration: 5000,
          horizontalPosition: "end",
          verticalPosition: "top",
          panelClass: ["error-snackbar"],
        })

        console.error("Error al generar la vista previa:", err)
      },
    })
  }
}