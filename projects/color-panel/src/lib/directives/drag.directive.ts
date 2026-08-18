import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { drag$ } from '../utils/drag.observable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[drag]',
    standalone: true
})
export class DragDirective {
  private readonly elRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
  }
}