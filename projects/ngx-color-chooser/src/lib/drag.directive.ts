import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
} from '@angular/core';

export interface AzDragEvent {
  left: number;
  top: number;
  elRect: { width: number; height: number };
}

@Directive({
  selector: '[azDragContainer]',
  standalone: true,
  host: {
    '(mousedown)': 'onStart($event)',
    '(touchstart)': 'onStart($event)',
    '(document:mousemove)': 'onMove($event)',
    '(document:touchmove)': 'onMove($event)',
    '(document:mouseup)': 'onEnd()',
    '(document:touchend)': 'onEnd()',
  },
})
export class DragContainer {
  el: ElementRef<HTMLElement> = inject(ElementRef);
  elRect!: DOMRect;
  eventStated = false;
  azDragContainer: InputSignal<{ topCoef: number; leftCoef: number }> = input({
    leftCoef: 0,
    topCoef: 0,
  });
  azDrag = output<AzDragEvent>();
  prevData: AzDragEvent | null = null;

  constructor() {
    afterNextRender({
      read: () => {
        this.elRect = this.el.nativeElement.getBoundingClientRect();
        const initials = this.azDragContainer();
        const { width, height } = this.elRect;
        const data: AzDragEvent = {
          top: Math.min(initials.topCoef * height, height),
          left: Math.min(initials.leftCoef * width, width),
          elRect: { height, width },
        };

        this.azDrag.emit(data);
      },
    });
  }

  onStart(event: MouseEvent | TouchEvent): void {
    if (!event.cancelable) return;

    event.preventDefault();
    event.stopPropagation();

    this.elRect = this.el.nativeElement.getBoundingClientRect();
    this.eventStated = true;
    this.sentData(this.getCoordsFromEvent(event));
  }

  onMove(event: MouseEvent | TouchEvent): void {
    if (!this.eventStated) return;

    this.sentData(this.getCoordsFromEvent(event));
  }

  onEnd(): void {
    this.eventStated = false;
  }

  private sentData({ left, top }: { left: number; top: number }): void {
    const data: AzDragEvent = {
      left: Math.max(0, Math.min(this.elRect.width, left - this.elRect.left)),
      top: Math.max(0, Math.min(this.elRect.height, top - this.elRect.top)),
      elRect: { width: this.elRect.width, height: this.elRect.height },
    };

    if (this.outOfBorder({ left, top })) {
      return;
    }

    this.azDrag.emit(data);
    this.prevData = data;
  }

  private getCoordsFromEvent(event: MouseEvent | TouchEvent): {
    left: number;
    top: number;
  } {
    if (event instanceof MouseEvent) {
      return {
        top: event.clientY,
        left: event.clientX,
      };
    }

    const { clientX, clientY } = event.touches[0];

    return { top: clientY, left: clientX };
  }

  outOfBorder({ top, left }: { top: number; left: number }): boolean {
    return (
      top < this.elRect.top ||
      top > this.elRect.bottom ||
      left < this.elRect.left ||
      left > this.elRect.right
    );
  }
}
