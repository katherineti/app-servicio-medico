import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

const PROVIDER_NAME_PATTERN = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,\-&/()]{1,100}$/;

export function providerPatternValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value === 'number') {
      return null;
    }

    if (typeof value === 'string' && value.length > 0) {
      return PROVIDER_NAME_PATTERN.test(value) ? null : { 'pattern': true };
    }

    return null;
  };
}