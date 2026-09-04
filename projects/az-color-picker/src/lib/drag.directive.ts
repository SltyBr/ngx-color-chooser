import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
} from '@angular/core';
import { drag$ } from './helpers/drag.observable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface AzDragEvent {
  left: number;
  top: number;
  elRect: { width: number; height: number };
}

@Directive({
  selector: '[azDragContainer]',
  standalone: true,
})
export class DragContainer {
  el: ElementRef<HTMLElement> = inject(ElementRef);
  azDragContainer: InputSignal<{ topCoef: number; leftCoef: number }> = input({
    leftCoef: 0,
    topCoef: 0,
  });
  azDrag = output<AzDragEvent>();

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender({
      read: () => {
        drag$(this.el.nativeElement, this.azDragContainer()).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(({ top, left, containerRect: { width, height } }) => {
          this.azDrag.emit({ left, top, elRect: { width, height } });
        });
      },
    });
  }
}
