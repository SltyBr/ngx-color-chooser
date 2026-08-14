import { afterNextRender, AfterViewInit, Component, computed, ElementRef, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { drag$ } from './utils/drag.observable';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map, merge, of, startWith, switchMap, takeUntil } from 'rxjs';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'lib-color-panel',
    imports: [JsonPipe],
    template: `
    {{ drag() | json}}
    <div class="color-panel" #colorPanel>
      <div class="handler"></div>
      <div class="white-gradient"></div>
      <div class="black-gradient"></div>
    </div>
    <div class="controls">
      <div class="hue-panel">
        <div class="handler"></div>
      </div>
      <div class="alpha-panel">
        <div class="alpha-placeholder"></div>
        <div class="handler"></div>
      </div>
    </div>
  `,
    styles: `
    *, *::before, *::after {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      height: 100%;

      padding: 16px;
      border-radius: 8px;
      background-color: white;
    }

    .color-panel {
      background-color: red;
      position: relative;
      cursor: crosshair;
      height: 100%;
      width: 100%;
      border-radius: 8px;

      & .white-gradient, .black-gradient {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-repeat: no-repeat;
        border-radius: 8px;
      }

      & .white-gradient {
        background-image: linear-gradient(270deg, #fff0, #fff);
      }

      & .black-gradient {
        background-image: linear-gradient(180deg, #0000, #000);
      }
    }

    .controls {
      display: flex;
      gap: 8px;
      flex-direction: column;
    }

    .hue-panel {
      width: 100%;
      height: 12px;
      background-repeat: no-repeat;
      background-image: linear-gradient(
        90deg,
        red 0,
        #ff0 17%,
        #0f0 33%,
        #0ff,
        #00f 67%,
        #f0f 83%,
        red
      );
      position: relative;

      border-radius: 100px;
      cursor: pointer;
    }

    .alpha-panel {
      width: 100%;
      height: 12px;
      background-image: linear-gradient(
        90deg,
        white 0,
        red
      );
      position: relative;

      border-radius: 100px;
      cursor: pointer;

      & .alpha-placeholder {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: white;

        background-image: 
          linear-gradient(45deg, #ccc 25%, transparent 25%),
          linear-gradient(-45deg, #ccc 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #ccc 75%),
          linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 6px 6px;
        background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
        opacity: 30%;
        border-radius: 100px;
      }
    }

    .handler {
      width: 14px;
      height: 14px;
      border: 4px solid white;
      border-radius: 50%;
      position: absolute;
      left: -1px;
      top: -1px;
    }
  `
})
export class ColorPanelComponent {
  colorPanel = viewChild.required<ElementRef>('colorPanel');
  initial$ = of({ left: 0, top: 0 });

  drag = toSignal(merge(
    of({ left: 0, top: 0 }),
    fromEvent<MouseEvent>(document, 'mousedown').pipe(
      switchMap((mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        mouseDownEvent.stopPropagation();

        return fromEvent<MouseEvent>(document, 'mousemove').pipe(
          startWith(mouseDownEvent),
          map(event => ({ top: event.clientY, left: event.clientX })),
          takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
        );
      }),
    )
  ))

  constructor() {
    afterNextRender({
      read: () => {
        // console.log(this.colorPanel().nativeElement)
      }
    })
  }

  test = computed(() => {
    const panel = this.colorPanel().nativeElement;
    console.log(panel)

    return 123;
  });
}
