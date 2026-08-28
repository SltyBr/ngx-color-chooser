import { afterNextRender, Directive, ElementRef, inject, input, InputSignal, output } from '@angular/core';

export interface AzDragEvent {
  left: number;
  top: number;
  elRect: { width: number; height: number };
}

@Directive({
  selector: '[azDragContainer]',
  standalone: true,
  host: {
    '(mousedown)': 'onMouseDown($event)',
    '(mousemove)': 'onMouseMove($event)',
    '(mouseup)': 'onMouseUp()',
  },
})
export class DragContainer {
  el: ElementRef<HTMLElement> = inject(ElementRef);
  elRect!: DOMRect;
  isMouseDown = false;
  azDragContainer: InputSignal<{ topCoef: number; leftCoef: number }> = input({ leftCoef: 0, topCoef: 0 }); 
  azDrag = output<AzDragEvent>();
  prevData: AzDragEvent | null = null;

  constructor() {
    afterNextRender({
      read: () => {
        this.elRect = this.el.nativeElement.getBoundingClientRect();
        const initials = this.azDragContainer();
        const { width, height } = this.elRect;
        const data: AzDragEvent = {
          top: Math.min((initials.topCoef) * height, height),
          left: Math.min((initials.leftCoef) * width, width),
          elRect: { height, width },
        }

        this.azDrag.emit(data);
      }
    })
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.elRect = this.el.nativeElement.getBoundingClientRect();
    this.isMouseDown = true;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown) return;

    const data: AzDragEvent = {
      left: Math.max(
        0,
        Math.min(this.elRect.width, event.clientX - this.elRect.left),
      ),
      top: Math.max(
        0,
        Math.min(this.elRect.height, event.clientY - this.elRect.top),
      ),
      elRect: { width: this.elRect.width, height: this.elRect.height },
    };

    if (JSON.stringify(this.prevData) === JSON.stringify(data)) {
      return;
    }

    this.azDrag.emit(data);
    this.prevData = data;
  }

  onMouseUp(): void {
    this.isMouseDown = false;
  }
}
