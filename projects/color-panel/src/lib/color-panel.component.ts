import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { drag$ } from './utils/drag.observable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgStyle } from '@angular/common';
import { hexToRgb, hsvToRgb, RgbColor, rgbToHsv } from './utils/utils';
import { RgbStrPipe } from './rgb-string.pipe';

@Component({
  selector: 'lib-color-panel',
  imports: [NgStyle, RgbStrPipe],
  template: `
    <div class="color-panel" #colorPanel [ngStyle]="{
      'background-color': hueColorPanel()
    }">
      <div class="handler" #colorHandler></div>
      <div class="white-gradient"></div>
      <div class="black-gradient"></div>
    </div>
    <div class="settings">
      <div class="preview" [style.backgroundColor]="rgba() | rgbStr"></div>
      <div class="controls">
        <div class="hue-panel" #huePanel>
          <div class="handler centered-vertical" #hueHandler></div>
        </div>
        <div class="alpha-panel" #alphaPanel [ngStyle]="{
          '--hueColor': hueColorPanel(),
        }">
          <div class="alpha-placeholder"></div>
          <div class="handler centered-vertical" #alphaHandler></div>
        </div>
    </div>
    </div>
  `,
  styleUrls: ['color-panel.component.scss'],
})
export class ColorPanelComponent {
  colorPanel: Signal<ElementRef<HTMLElement>> = viewChild.required('colorPanel');
  colorPanelHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('colorHandler');

  huePanel: Signal<ElementRef<HTMLElement>> = viewChild.required('huePanel');
  hueHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('hueHandler');

  alphaPanel: Signal<ElementRef<HTMLElement>> = viewChild.required('alphaPanel');
  alphaHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('alphaHandler');

  color = signal<string>('#5ed933');
  hue = signal<number>(0);
  saturation = signal<number>(0);
  value = signal<number>(1);
  alpha = signal<number>(0.5);

  hueColorPanel = computed(() => {
    const { r, g, b } = hsvToRgb({ h: this.hue(), s: 1, v: 1 });

    return `rgb(${r}, ${g}, ${b})`;
  });
  
  rgba = computed<RgbColor & { a: number }>(() => {
    const { r, g, b } = hsvToRgb({ h: this.hue(), s: this.saturation(), v: this.value() });

    return { r, g, b, a: this.alpha() };
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender({
      read: () => {
        const initialColor = this.color();
        const { r, g, b } = hexToRgb(initialColor);
        const { h, s, v } = rgbToHsv(r, g, b);
        this.hue.set(h);
        this.saturation.set(s);
        this.value.set(v);
        const colorPanelEl = this.colorPanel().nativeElement;
        const colorPanelRect = colorPanelEl.getBoundingClientRect();
        const colorHandlerEl = this.colorPanelHandler().nativeElement;
        const colorPanelHandlerRect = colorHandlerEl.getBoundingClientRect();
        const initialPanelX = this.saturation() * colorPanelRect.width;
        const initialPanelY = (1 - this.value()) * colorPanelRect.height;

        drag$(colorPanelEl, colorPanelHandlerRect, { top: initialPanelY, left: initialPanelX })
          .pipe(
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(({ top, left, containerRect: { width, height } }) => {
            colorHandlerEl.style.top = `${top}px`;
            colorHandlerEl.style.left = `${left}px`;

            const s = left / width;
            const v = 1 - (top / height);
            this.saturation.set(s);
            this.value.set(v);
          });

        const huePanelEl = this.huePanel().nativeElement;
        const hueHandlerEl = this.hueHandler().nativeElement;
        const hueHandlerRect = hueHandlerEl.getBoundingClientRect();
        const initialHuePanelX = this.hue() * huePanelEl.getBoundingClientRect().width / 360;

        drag$(huePanelEl, hueHandlerRect, { left: initialHuePanelX, top: 0 })
          .pipe(
            takeUntilDestroyed(this.destroyRef),
          ) 
          .subscribe(({ left, containerRect: { width } }) => {
            hueHandlerEl.style.left = `${left}px`;
            const hue = left / width * 360;

            this.hue.set(hue);
          });

        const alphaPanelEl = this.alphaPanel().nativeElement;
        const alphaHandlerEl = this.alphaHandler().nativeElement;
        const alphaHandlerRect = alphaHandlerEl.getBoundingClientRect();
        const initialAlphaX = alphaPanelEl.getBoundingClientRect().width * this.alpha();

        drag$(alphaPanelEl, alphaHandlerRect, { top: 0, left: initialAlphaX })
          .pipe(
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(({ left, containerRect: { width } }) => {
            alphaHandlerEl.style.left = `${left}px`;
            this.alpha.set(left / width);
          });
      },
    });
  }
}
