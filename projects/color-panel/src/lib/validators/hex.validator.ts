import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function hexColorValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // #RRGGBB
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return null;
    }

    // #RRGGBBAA
    if (/^#[0-9A-Fa-f]{8}$/.test(value)) {
      return null;
    }

    return { invalidHex: true };
  };
}