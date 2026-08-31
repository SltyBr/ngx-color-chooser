import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  NgZone,
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
  eventStarted = false;
  azDragContainer: InputSignal<{ topCoef: number; leftCoef: number }> = input({
    leftCoef: 0,
    topCoef: 0,
  });
  azDrag = output<AzDragEvent>();

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
    this.eventStarted = true;
    this.sentData(this.getCoordsFromEvent(event));
  }

  onMove(event: MouseEvent | TouchEvent): void {
    if (!this.eventStarted) return;

    this.sentData(this.getCoordsFromEvent(event));
  }

  onEnd(): void {
    this.eventStarted = false;
  }

  private sentData({ left, top }: { left: number; top: number }): void {
    const data: AzDragEvent = {
      left: Math.max(0, Math.min(this.elRect.width, left - this.elRect.left)),
      top: Math.max(0, Math.min(this.elRect.height, top - this.elRect.top)),
      elRect: { width: this.elRect.width, height: this.elRect.height },
    };
    this.azDrag.emit(data);
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

}
