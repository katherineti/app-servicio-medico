import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

// Patrón de expresión regular solicitado para el nombre del proveedor
const PROVIDER_NAME_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,\-&/()]{1,100}$/;

/**
 * Validador personalizado para el campo Proveedor (mat-autocomplete).
 * Aplica el patrón solo si el valor es una cadena (el usuario está escribiendo),
 * pero lo ignora si es un número (un ID de proveedor válido ya seleccionado).
 * Esto evita que falle la validación cuando se selecciona un ID numérico.
 */
export function providerPatternValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // 1. Si el valor es un número, se asume que es un ID válido seleccionado. Se ignora la validación.
    if (typeof value === 'number') {
      return null;
    }

    // 2. Si el valor es una cadena (texto de búsqueda), se aplica el patrón.
    if (typeof value === 'string' && value.length > 0) {
      return PROVIDER_NAME_PATTERN.test(value) ? null : { 'pattern': true };
    }

    // 3. Para otros casos, se deja que Validators.required se encargue.
    return null;
  };
}