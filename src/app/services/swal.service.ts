import { inject, Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class SwalService {
  private readonly spinner = inject(NgxSpinnerService);

  close() {
    Swal.close();
  }

  success() {
    Swal.fire({
      title: 'Acción realizada con éxito',
      icon: 'success',
      // html: '<b class="text-success">La acción se ha llevado a cabo exitosamente.</b>',
      html: '<br>',
      showConfirmButton: false,
    });
  }

  successDownload() {
    Swal.fire({
      title: 'La descarga comenzará en breve',
      icon: 'success',
      html: '<b class="text-success">La descarga comenzará en unos momentos</b>',
      showConfirmButton: false,
    });
  }

  error(titulo: string, msj: string) {
    Swal.fire({
      title: titulo,
      icon: 'error',
      html: '<b class="text-danger">' + msj + '</b>',
      showConfirmButton: false,
    });
  }

  confirm(text: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: '¿Está seguro de realizar la acción de ' + text + '?',
      text: 'Este proceso no puede ser revertido!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(93, 135, 255)',
      cancelButtonColor: 'rgb(250, 137, 107)',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
  }
  confirmReportMedical(): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: '¿Está seguro de finalizar?',  
      text: ' Una vez que guarde, ya no podrá editar',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(93, 135, 255)',
      cancelButtonColor: 'rgb(250, 137, 107)',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
  }

  expiredSession() {
    Swal.fire({
      title: 'La sesión ha expirado',
      icon: 'warning',
      html: '<b class="text-warning">Intente ingresar nuevamente.</b>',
      showConfirmButton: false,
    });
  }

  warningEdit(titulo: string, msj: string) {
    Swal.fire({
      title: titulo,
      icon: 'warning',
      html: '<b class="text-warning">' + msj + '</b>',
      showConfirmButton: false,
    });
  }

  successEdit(titulo: string, msj: string, showConfirmButton=null) {
    if(!showConfirmButton){
      return Swal.fire({
        title: titulo,
        icon: 'success',
        html: '<b class="text-sucess">' + msj + '</b>',
      });
    }

    return Swal.fire({
      title: titulo,
      icon: 'success',
      html: '<b class="text-sucess">' + msj + '</b>',
      showConfirmButton: true,
    });
  }

  loadingSwal() {
    Swal.fire({
      title: 'Cargando...',
      html: '<i class="text-primary fa fa-spinner fa-spin fa-3x"></i>',
      showConfirmButton: false,
    });
  }

  closeloadSwal() {
    Swal.hideLoading();
    Swal.close();
  }

   loading() {
    this.spinner.show();
  }

  closeload() {
    this.spinner.hide();
  }
}