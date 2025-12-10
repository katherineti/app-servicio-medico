import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
interface DatosPersistentes {
  configuracionUsuario?: { tema: string; notificaciones: boolean };
  ultimaPaginaVisitada?: string;
}
@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private claveAlmacenamiento = 'datosPersistentesApp';
  private _datos = new BehaviorSubject<DatosPersistentes | null>(null);
  readonly datos$: Observable<DatosPersistentes | null> = this._datos.asObservable();
  constructor() {
    this.cargarDatosIniciales();
  }
  private cargarDatosIniciales() {
    const datosGuardados = localStorage.getItem(this.claveAlmacenamiento); 
    if (datosGuardados) {
      this._datos.next(JSON.parse(datosGuardados));
    }
  }
  setDatos(nuevosDatos: DatosPersistentes) {
    this._datos.next(nuevosDatos);
  }
  getDatosActuales(): DatosPersistentes | null {
    return this._datos.getValue();
  }
  limpiarDatos() {
    this._datos.next(null);
    localStorage.removeItem(this.claveAlmacenamiento);
  }
}