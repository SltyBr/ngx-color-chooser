import {
  afterNextRender,
  ChangeDetectionStrategy, Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  Signal,
  viewChild
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, throttleTime } from 'rxjs';

import { drag$ } from './helpers/drag.observable';
import { hexaToRgba, hslToHsv, hsvToHex, hsvToHsl, rgbToHsv } from './helpers/utils';
import { hexColorValidator } from './validators/hex.validator';

@Component({
  selector: 'lib-color-chooser',
  imports: [NgStyle, ReactiveFormsModule],
  template: `
    @let hexaColor = hexa();
    @let hueColorValue = hueColor();

    <div
      class="color-chooser"
      #colorPanel
      [ngStyle]="{
        'background-color': hueColorValue,
      }"
    >
      <div class="handler" #colorHandler></div>
      <div class="white-gradient"></div>
      <div class="black-gradient"></div>
    </div>
    <div class="settings">
      <div class="preview" [ngStyle]="{
        '--input-color': inputColor(),
        '--output-color': hexaColor,
      }" (click)="copyToClipboard(hexaColor)">
        <div class="clipboard">
          <div class="box box1"></div>
          <div class="box box2"></div>
        </div>
      </div>
      <div class="controls">
        <div class="hue-chooser" #huePanel>
          <div class="handler centered-vertical" #hueHandler></div>
        </div>
        <div
          class="alpha-chooser"
          #alphaPanel
          [ngStyle]="{
            '--hueColor': hueColorValue,
          }"
        >
          <div class="alpha-placeholder"></div>
          <div class="handler centered-vertical" #alphaHandler></div>
        </div>
      </div>
    </div>
    <label class="hex" for="hex">
      hex: <input type="text" id="hex" [formControl]="hexControl">
    </label>
    <div class="channels">
      <div class="group">
        <ng-container [formGroup]="rgbForm">
          <label for="r">
            r
            <input type="number" id="r"  min="0" max="255" step="1" formControlName="r"/>
          </label>
          <label for="g">
            g
            <input type="number" id="g"  min="0" max="255" step="1" formControlName="g"/>
          </label>
          <label for="b">
            b
            <input type="number" id="b"  min="0" max="255" step="1" formControlName="b"/>
          </label>
        </ng-container>
      </div>
      <div class="group">
        <ng-container [formGroup]="hslForm">
          <label for="h">
            h
            <input type="number" id="h"  min="0" step="1" max="360" formControlName="h"/>
          </label>
          <label for="s">
            s
            <input type="number" id="s"  min="0" step="1" max="100" formControlName="s"/>
          </label>
          <label for="l">
            l
            <input type="number" id="l"  min="0" step="1" max="100" formControlName="l"/>
          </label>
        </ng-container>
      </div>
      <label class="alpha" for="alpha">
        a
        <input
          [formControl]="alphaControl"
          type="number"
          id="alpha"
          min="0"
          max="1"
          step="0.01">
      </label>
    </div>
  `,
  styleUrls: ['color-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorChooserComponent {
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
  private readonly fb = inject(FormBuilder);

  hexControl = this.fb.nonNullable.control('#000000', hexColorValidator());
  rgbForm = this.fb.nonNullable.group({
    r: this.fb.nonNullable.control(0),
    g: this.fb.nonNullable.control(0),
    b: this.fb.nonNullable.control(0),
  });
  alphaControl = this.fb.nonNullable.control(0);
  hslForm = this.fb.nonNullable.group({
    h: this.fb.nonNullable.control(0),
    s: this.fb.nonNullable.control(0),
    l: this.fb.nonNullable.control(0),
  });

  hueColor = computed(() => {
    const hex = hsvToHex({ h: this.hue(), s: 1, v: 1 });

    return `${hex}`;
  });

  hexa = computed(() => {
    const alpha = this.alpha();
    const hue = this.hue();
    const saturation = this.saturation();
    const value = this.value();
    const hex = hsvToHex({
      h: hue,
      s: this.saturation(),
      v: this.value(),
    }, alpha);

    const { h, s, l } = hsvToHsl({ h: hue, s: saturation, v: value });

    this.hslForm.setValue({ h, s, l }, { emitEvent: false });

    this.hexControl.setValue(hex, { emitEvent: false });
    this.alphaControl.setValue(alpha, { emitEvent: false });

    const { r, g, b } = hexaToRgba(hex);
    this.rgbForm.setValue({ r, g, b }, { emitEvent: false });

    return `${hex}`;
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender({
      read: () => {
        const initialColor = this.inputColor();
        const { r, g, b, a } = hexaToRgba(initialColor);
        const { h, s, v } = rgbToHsv(r, g, b);
        const colorPanelEl = this.colorPanel().nativeElement;
        const colorHandlerEl = this.colorPanelHandler().nativeElement;
        const colorPanelHandlerRect = colorHandlerEl.getBoundingClientRect();
        let colorPanelHeight = 0;
        let colorPanelWidth = 0;

        drag$(colorPanelEl, { topCoef: (1 - v),leftCoef: s })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ top, left, containerRect: { width, height } }) => {
            colorHandlerEl.style.top = `${top - colorPanelHandlerRect.height / 2}px`;
            colorHandlerEl.style.left = `${left - colorPanelHandlerRect.width / 2}px`;
            colorPanelHeight = height;
            colorPanelWidth = width;

            const s = left / width;
            const v = 1 - top / height;

            this.saturation.set(s);
            this.value.set(v);
          });

        const huePanelEl = this.huePanel().nativeElement;
        const hueHandlerEl = this.hueHandler().nativeElement;
        const hueHandlerRect = hueHandlerEl.getBoundingClientRect();
        let huePanelWidth = 0;

        drag$(huePanelEl, { leftCoef: h / 360, topCoef: 0 })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ left, containerRect: { width } }) => {
            hueHandlerEl.style.left = `${left - hueHandlerRect.width / 2}px`;
            huePanelWidth = width;
            const hue = Math.round((left / width) * 360);

            this.hue.set(hue);
          });

        const alphaPanelEl = this.alphaPanel().nativeElement;
        const alphaHandlerEl = this.alphaHandler().nativeElement;
        const alphaHandlerRect = alphaHandlerEl.getBoundingClientRect();
        let alphaPanelWidth = 0;

        drag$(alphaPanelEl, { topCoef: 0, leftCoef: a })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(({ left, containerRect: { width } }) => {
            alphaHandlerEl.style.left = `${left - alphaHandlerRect.width / 2}px`;
            this.alpha.set(+(left / width).toFixed(2));
            alphaPanelWidth = width;
          });

        this.alphaControl.valueChanges.pipe(
          throttleTime(16),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe((data) => {
          this.alpha.set(+(data).toFixed(2));
          alphaHandlerEl.style.left = `${(data * alphaPanelWidth) - alphaHandlerRect.width / 2}px`;
        });

        this.rgbForm.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(({ r = 0, g = 0, b = 0 }) => {
          const { h, s, v } = rgbToHsv(r, g, b);

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);

          const top = (1 - v) * colorPanelHeight;
          const left = s * colorPanelWidth;

          colorHandlerEl.style.top = `${top}px`;
          colorHandlerEl.style.left = `${left}px`;

          const leftHue = (huePanelWidth * h) / 360;
          hueHandlerEl.style.left = `${leftHue - hueHandlerRect.width / 2}px`;
        });

        this.hexControl.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(hexa => {
          const { r, g, b, a } = hexaToRgba(hexa);

          const { h, s, v } = rgbToHsv(r, g, b);

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);

          const top = (1 - v) * colorPanelHeight;
          const left = s * colorPanelWidth;

          colorHandlerEl.style.top = `${top - colorPanelHandlerRect.height / 2}px`;
          colorHandlerEl.style.left = `${left - colorPanelHandlerRect.width / 2}px`;

          const leftHue = (huePanelWidth * h) / 360;
          hueHandlerEl.style.left = `${leftHue - hueHandlerRect.width / 2}px`;

          this.alpha.set(+a.toFixed(2));
          alphaHandlerEl.style.left = `${(a * alphaPanelWidth) - alphaHandlerRect.width / 2}px`;
        });

        this.hslForm.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(({ h: hChannel = 0, s: sChannel = 0, l = 0 }) => {
          const { h, s, v } = hslToHsv({ h: hChannel, s: sChannel, l });

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);

          const top = (1 - v) * colorPanelHeight;
          const left = s * colorPanelWidth;

          colorHandlerEl.style.top = `${top - colorPanelHandlerRect.height / 2}px`;
          colorHandlerEl.style.left = `${left - colorPanelHandlerRect.width / 2}px`;

          const leftHue = (huePanelWidth * h) / 360;
          hueHandlerEl.style.left = `${leftHue - hueHandlerRect.width / 2}px`;
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
