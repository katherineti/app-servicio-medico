import { Component, Input, Output, EventEmitter, type OnInit, forwardRef, inject } from "@angular/core"
import { FormControl, type ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms"
import type { Observable } from "rxjs"
import { map, startWith } from "rxjs/operators"
import { COMMA, ENTER } from "@angular/cdk/keycodes"
import type { MatChipInputEvent } from "@angular/material/chips"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { AuditoresService } from "../../services/auditores.service"
import type { TokenAuth } from "../../../authentication/models/token-auth.model"
import { AuthService } from "../../../services/auth.service"
import type { Auditor } from "../../interfaces/reports.interface"

@Component({
  selector: "app-auditor-multi-select",
  templateUrl: "./auditor-multi-select.component.html",
  styleUrls: ["./auditor-multi-select.component.css"],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuditorMultiSelectComponent),
      multi: true,
    },
  ],
})
export class AuditorMultiSelectComponent implements OnInit, ControlValueAccessor {
  @Input() label = "Auditores Adicionales"
  @Input() placeholder = "Buscar auditores..."
  @Input() required = false
  @Input() disabled = false
  @Input() disabledFieldAdditionalAuditors = false
  @Output() auditorsChange = new EventEmitter<Auditor[]>()

  separatorKeysCodes: number[] = [ENTER, COMMA]
  auditorCtrl = new FormControl("")
  filteredAuditors: Observable<Auditor[]>
  selectedAuditors: Auditor[] = []

  authService = inject(AuthService)
  private auditoresService = inject(AuditoresService)
  private token!: TokenAuth

  // Inicializar como array vacío - se llenará desde el servicio
  allAuditors: Auditor[] = []

  // ControlValueAccessor implementation
  private onChange = (value: number[]) => {}
  private onTouched = () => {}

  constructor() {
    // Inicializar filteredAuditors con un observable vacío inicialmente
    this.filteredAuditors = this.auditorCtrl.valueChanges.pipe(
      startWith(null),
      map((auditor: string | null) => (auditor ? this._filter(auditor) : this.getAvailableAuditors())),
    )

    if (this.disabledFieldAdditionalAuditors) {     this.auditorCtrl.disable()    } 
  }

  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo(await this.authService.getPlainToken())
    this.loadAuditors()
  }

  // Modificar loadAuditors para devolver una promesa
  private loadAuditors(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.auditoresService.getAllActives().subscribe({
        next: (data: any) => {
          let auditors = data.list

          // Remueve el usuario en sesion del listado de auditores y admin
          if (this.token && this.token.sub) {
            auditors = auditors.filter((auditor: Auditor) => auditor.id !== this.token.sub)
          }

          console.log("Auditores cargados:", auditors)
          this.allAuditors = auditors

          // Reinicializar filteredAuditors después de cargar los datos
          this.initializeFilteredAuditors()
          resolve()
        },
        error: (error) => {
          console.error("Error al cargar auditores:", error)
          this.allAuditors = [] // Mantener array vacío en caso de error
          resolve()
        },
      })
    })
  }

  // Método para reinicializar el observable de filtros
  private initializeFilteredAuditors(): void {
    this.filteredAuditors = this.auditorCtrl.valueChanges.pipe(
      startWith(null),
      map((auditor: string | null) => (auditor ? this._filter(auditor) : this.getAvailableAuditors())),
    )
  }

  // Modifica el método `writeValue` para manejar correctamente los valores preseleccionados:
  writeValue(value: number[]): void {
    if (value && Array.isArray(value)) {
      // Si no hay auditores cargados aún, esperar a que se carguen
      if (this.allAuditors.length === 0) {
        this.loadAuditors().then(() => {
          this.selectedAuditors = this.allAuditors.filter((auditor) => value.includes(auditor.id))
          this.refreshFilteredAuditors()
        })
      } else {
        this.selectedAuditors = this.allAuditors.filter((auditor) => value.includes(auditor.id))
        this.refreshFilteredAuditors()
      }
    } else {
      this.selectedAuditors = []
    }
  }

  registerOnChange(fn: (value: number[]) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  add(event: MatChipInputEvent): void {
    console.log("event add ", event)
    const value = (event.value || "").trim()

    const foundAuditor = this.allAuditors.find(
      (auditor) => auditor.name.toLowerCase() === value.toLowerCase() && auditor.isActivate,
    )

    if (foundAuditor && !this.selectedAuditors.find((selected) => selected.id === foundAuditor.id)) {
      this.selectedAuditors.push(foundAuditor)
      this.emitChange()
    }

    event.chipInput!.clear()
    this.auditorCtrl.setValue(null)
  }
  remove(auditor: Auditor): void {
    const index = this.selectedAuditors.indexOf(auditor)
    if (index >= 0) {
      this.selectedAuditors.splice(index, 1)
      this.emitChange()
    }
    // Forzar actualización del filtro para que el auditor eliminado vuelva a aparecer
    this.refreshFilteredAuditors()
  }
  // Método para forzar la actualización del observable filteredAuditors
  private refreshFilteredAuditors(): void {
    // Reinicializar el observable para reflejar los cambios en selectedAuditors
    this.initializeFilteredAuditors()
  }

  selected(auditor: Auditor): void {
    if (!this.selectedAuditors.find((selected) => selected.id === auditor.id)) {
      this.selectedAuditors.push(auditor)
      this.emitChange()
    }
    this.auditorCtrl.setValue(null)
    this.onTouched()
  }

  private emitChange(): void {
    const auditorIds = this.selectedAuditors.map((auditor) => auditor.id)
    this.onChange(auditorIds)
    this.auditorsChange.emit(this.selectedAuditors)
  }

  private _filter(value: any): Auditor[] {
    console.log("value ", value)
    const filterValue = value.name.toLowerCase()
    return this.getAvailableAuditors().filter(
      (auditor) =>
        auditor.name.toLowerCase().includes(filterValue) || auditor.email.toLowerCase().includes(filterValue),
    )
  }

  private getAvailableAuditors(): Auditor[] {
    return this.allAuditors.filter(
      (auditor) => auditor.isActivate && !this.selectedAuditors.find((selected) => selected.id === auditor.id),
    )
  }

  getSelectedAuditors(): Auditor[] {
    return this.selectedAuditors
  }
}