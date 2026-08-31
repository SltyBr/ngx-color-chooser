import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { isValidHex } from '../helpers/utils';

export function hexColorValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (isValidHex(value)) {
      return null;
    }

    return { invalidHex: true };
  };
}