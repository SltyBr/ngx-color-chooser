import { Directive, ElementRef, inject, output } from '@angular/core';
import { drag$ } from '../utils/drag.observable';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[drag]'
})
export class DragDirective {
  drag = toSignal(drag$(inject(ElementRef).nativeElement));
}