import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { drag$ } from './helpers/drag.observable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgStyle } from '@angular/common';
import { hexaToRgba, hsvToRgb, RgbColor, rgbToHsv } from './helpers/utils';
import { RgbStrPipe } from './rgb-string.pipe';

@Component({
  selector: 'lib-color-panel',
  imports: [NgStyle, RgbStrPipe],
  template: `
    @let outputRgba = rgba() | rgbStr;

    <div
      class="color-panel"
      #colorPanel
      [ngStyle]="{
        'background-color': hueColorPanel(),
      }"
    >
      <div class="handler" #colorHandler></div>
      <div class="white-gradient"></div>
      <div class="black-gradient"></div>
    </div>
    <div class="settings">
      <div class="preview" [ngStyle]="{
        '--input-color': inputColor(),
        '--output-color': outputRgba,
      }" (click)="copyToClipboard(outputRgba)">
        <div class="clipboard">
          <div class="box box1"></div>
          <div class="box box2"></div>
        </div>
      </div>
      <div class="controls">
        <div class="hue-panel" #huePanel>
          <div class="handler centered-vertical" #hueHandler></div>
        </div>
        <div
          class="alpha-panel"
          #alphaPanel
          [ngStyle]="{
            '--hueColor': hueColorPanel(),
          }"
        >
          <div class="alpha-placeholder"></div>
          <div class="handler centered-vertical" #alphaHandler></div>
        </div>
      </div>
    </div>
    <label class="hex" for="hex">
      # <input type="text" id="hex">
    </label>
    <div class="channels">
      <div class="group">
        <div class="clipboard">
          <div class="box box1"></div>
          <div class="box box2"></div>
        </div>
        <label for="r">
          r
          <input type="number" id="r"  min="0"/>
        </label>
        <label for="g">
          g
          <input type="number" id="g"  min="0"/>
        </label>
        <label for="b">
          b
          <input type="number" id="b"  min="0"/>
        </label>
      </div>
      <div class="group">
        <div class="clipboard">
          <div class="box box1"></div>
          <div class="box box2"></div>
        </div>
        <label for="h">
          h
          <input type="number" id="h"  min="0"/>
        </label>
        <label for="s">
          s
          <input type="number" id="s"  min="0"/>
        </label>
        <label for="l">
          l
          <input type="number" id="l"  min="0"/>
        </label>
      </div>
      <label class="alpha" for="alpha">
        a
        <input type="number" id="alpha" min="0" max="1" step="0.1">
      </label>
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

  inputColor = input.required<string>();
  outputColor = linkedSignal(() => this.inputColor());
  output = output<string>();
  hue = signal<number>(0);
  saturation = signal<number>(0);
  value = signal<number>(1);
  alpha = signal<number>(1);

  hueColorPanel = computed(() => {
    const { r, g, b } = hsvToRgb({ h: this.hue(), s: 1, v: 1 });

    return `rgb(${r}, ${g}, ${b})`;
  });

  rgba = computed<RgbColor & { a: number }>(() => {
    const { r, g, b } = hsvToRgb({
      h: this.hue(),
      s: this.saturation(),
      v: this.value(),
    });

    return { r, g, b, a: this.alpha() };
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender({
      read: () => {
        const initialColor = this.inputColor();
        const { r, g, b, a } = hexaToRgba(initialColor);
        const { h, s, v } = rgbToHsv(r, g, b);
        this.hue.set(h);
        this.saturation.set(s);
        this.value.set(v);
        this.alpha.set(a);
        const colorPanelEl = this.colorPanel().nativeElement;
        const colorPanelRect = colorPanelEl.getBoundingClientRect();
        const colorHandlerEl = this.colorPanelHandler().nativeElement;
        const colorPanelHandlerRect = colorHandlerEl.getBoundingClientRect();
        const initialPanelX = this.saturation() * colorPanelRect.width;
        const initialPanelY = (1 - this.value()) * colorPanelRect.height;

        drag$(colorPanelEl, colorPanelHandlerRect, {
          top: initialPanelY,
          left: initialPanelX,
        })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ top, left, containerRect: { width, height } }) => {
            colorHandlerEl.style.top = `${top}px`;
            colorHandlerEl.style.left = `${left}px`;

            const s = left / width;
            const v = 1 - top / height;
            this.saturation.set(s);
            this.value.set(v);
          });

        const huePanelEl = this.huePanel().nativeElement;
        const hueHandlerEl = this.hueHandler().nativeElement;
        const hueHandlerRect = hueHandlerEl.getBoundingClientRect();
        const initialHuePanelX = (this.hue() * huePanelEl.getBoundingClientRect().width) / 360;

        drag$(huePanelEl, hueHandlerRect, { left: initialHuePanelX, top: 0 })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ left, containerRect: { width } }) => {
            hueHandlerEl.style.left = `${left}px`;
            const hue = (left / width) * 360;

            this.hue.set(hue);
          });

        const alphaPanelEl = this.alphaPanel().nativeElement;
        const alphaHandlerEl = this.alphaHandler().nativeElement;
        const alphaHandlerRect = alphaHandlerEl.getBoundingClientRect();
        const initialAlphaX = alphaPanelEl.getBoundingClientRect().width * this.alpha();

        drag$(alphaPanelEl, alphaHandlerRect, { top: 0, left: initialAlphaX })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ left, containerRect: { width } }) => {
            alphaHandlerEl.style.left = `${left}px`;
            this.alpha.set((left + alphaHandlerRect.width) / width);
          });
      },
    });
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("unable to copy");
    }
  }
}
