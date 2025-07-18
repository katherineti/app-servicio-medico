import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface DatosPersistentes {
  configuracionUsuario?: { tema: string; notificaciones: boolean };
  ultimaPaginaVisitada?: string;
  //  estructura de tus datos
}

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private claveAlmacenamiento = 'datosPersistentesApp'; // Clave para localStorage/sessionStorage

  // BehaviorSubject para mantener y emitir los datos actuales
  private _datos = new BehaviorSubject<DatosPersistentes | null>(null);
  readonly datos$: Observable<DatosPersistentes | null> = this._datos.asObservable();

  constructor() {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    const datosGuardados = localStorage.getItem(this.claveAlmacenamiento); // Usando localStorage
    // const datosGuardados = sessionStorage.getItem(this.claveAlmacenamiento); // O sessionStorage
    if (datosGuardados) {
      this._datos.next(JSON.parse(datosGuardados));
    }
  }

  // Método para actualizar y persistir los datos
  setDatos(nuevosDatos: DatosPersistentes) {
    this._datos.next(nuevosDatos);
    localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(nuevosDatos)); // Persistir
    // sessionStorage.setItem(this.claveAlmacenamiento, JSON.stringify(nuevosDatos)); // Persistir
  }

  // Método para obtener los datos actuales (sincrónicamente si es necesario)
  getDatosActuales(): DatosPersistentes | null {
    return this._datos.getValue();
  }

  // Método para limpiar los datos del servicio y del almacenamiento
  limpiarDatos() {
    this._datos.next(null);
    localStorage.removeItem(this.claveAlmacenamiento);
    // sessionStorage.removeItem(this.claveAlmacenamiento);
  }
}