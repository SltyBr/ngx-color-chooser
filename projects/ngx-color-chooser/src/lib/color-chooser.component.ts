import {
  afterNextRender,
  ChangeDetectionStrategy, Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  OnChanges,
  output,
  signal,
  Signal,
  SimpleChanges,
  viewChild
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { filter, skip, throttleTime } from 'rxjs';

import { hexColorValidator } from './validators/hex.validator';
import { AzDragEvent, DragContainer } from './drag.directive';
import { hexaToRgba, hslToHsv, hsvToHsl, hsvToRgb, rgbToHex, rgbToHsv } from './helpers/utils';

@Component({
  selector: 'ngx-color-chooser',
  imports: [NgStyle, ReactiveFormsModule, DragContainer],
  template: `
    @let hexaColor = hexa();
    @let hueColorValue = hueColor();

    <div
      class="color-chooser"
      [azDragContainer]="{ topCoef: (1 - value()), leftCoef: saturation() }"
      (azDrag)="updateColorPanelHandlerPos($event)"
      [ngStyle]="{
        'background-color': hueColorValue,
      }"
    >
      <div class="handler" #colorHandler [ngStyle]="{
        'top.px': colorHandlerPos().top,
        'left.px': colorHandlerPos().left,
      }"></div>
      <div class="white-gradient"></div>
      <div class="black-gradient"></div>
    </div>
    <div class="settings">
      <div class="preview" [ngStyle]="{
        '--input-color': initialColor,
        '--output-color': hexaColor,
      }" (click)="onCopied.emit(hexaColor)">
        <div class="clipboard">
          <div class="box box1"></div>
          <div class="box box2"></div>
        </div>
      </div>
      <div class="controls">
        <div class="hue-chooser"
          [azDragContainer]="{ leftCoef: hue() / 360, topCoef: 0 }"
          (azDrag)="updateHuePanelHandlerPos($event)"
        >
          <div class="handler centered-vertical" #hueHandler [ngStyle]="{
            'left.px': hueHandlerPos(),
          }"></div>
        </div>
        <div
          class="alpha-chooser"
          [ngStyle]="{
            '--hueColor': hueColorValue,
          }"
          [azDragContainer]="{ topCoef: 0, leftCoef: alpha() }"
          (azDrag)="updateAlphaPanelHandlerPos($event)"
        >
          <div class="alpha-placeholder"></div>
          <div class="handler centered-vertical" #alphaHandler [ngStyle]="{
            'left.px': alphaHandlerPos(),
          }"></div>
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
    <div class="actions">
      <button (click)="onCancel.emit()">{{ cancelBtnText() }}</button>
      <button (click)="onSubmit.emit(hexaColor)">{{ submitBtnText() }}</button>
    </div>
  `,
  styleUrls: ['color-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width.px]': 'width()',
    '[style.height.px]': 'height()',
  },
})
export class ColorChooserComponent implements OnChanges {
  colorPanelHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('colorHandler');
  hueHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('hueHandler');
  alphaHandler: Signal<ElementRef<HTMLElement>> = viewChild.required('alphaHandler');

  inputColor = model.required<string>();
  width = input<number>();
  height = input<number>();
  submitBtnText = input<string>('Ok');
  cancelBtnText = input<string>('Cancel');

  colorChanged = output<string>();
  onSubmit = output<string>();
  onCancel = output<void>();
  onCopied = output<string>();

  hue = signal(0);
  saturation = signal(0);
  value = signal(0);
  alpha = signal(1);

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
    const { r, g, b } = hsvToRgb(this.hue(), 1, 1);
    const hex = rgbToHex(r, g, b);

    return hex;
  });

  hexa = computed(() => {
    const alpha = this.alpha();
    const hue = this.hue();
    const saturation = this.saturation();
    const value = this.value();
    const { r, g, b } = hsvToRgb(hue, saturation, value);
    const hex = rgbToHex(r, g, b, alpha);

    const { h, s, l } = hsvToHsl(hue, saturation, value);

    this.hslForm.setValue({ h, s, l }, { emitEvent: false });
    this.hexControl.setValue(hex, { emitEvent: false });
    this.rgbForm.setValue({ r, g, b }, { emitEvent: false });
    this.alphaControl.setValue(alpha, { emitEvent: false });

    return hex;
  });
  
  hexa$ = toObservable(this.hexa);

  private readonly destroyRef = inject(DestroyRef);

  colorContainerRect = signal<Pick<DOMRect, 'width' | 'height'>>({ width: 0, height: 0 });
  colorHandlerRect = linkedSignal({
    source: () => this.colorPanelHandler(),
    computation: (colorPanelHandler) => {
      return colorPanelHandler.nativeElement.getBoundingClientRect();
    }
  });
  colorHandlerPos = computed<{ left: number, top: number }>(() => {
    const { width, height } = this.colorContainerRect();
    const colorHandlerRect = this.colorHandlerRect();
    const left = this.saturation() * width - colorHandlerRect.width / 2;
    const top = (1 - this.value()) * height - colorHandlerRect.height / 2;

    return { left, top };
  });

  huePanelRect = signal<Pick<DOMRect, 'width'>>({ width: 0 });
  hueHandlerRect = linkedSignal({
    source: () => this.hueHandler(),
    computation: (hueHandler) => {
      return hueHandler.nativeElement.getBoundingClientRect();
    }
  });
  hueHandlerPos = computed<number>(() => {
    const { width } = this.huePanelRect();
    const handlerRect = this.hueHandlerRect();
    const left = this.hue() * width / 360 - handlerRect.width / 2;

    return left;
  });

  alphaPanelRect = signal<Pick<DOMRect, 'width'>>({ width: 0 });
  alphaHandlerRect = linkedSignal({
    source: () => this.alphaHandler(),
    computation: (alphaHandler) => {
      return alphaHandler.nativeElement.getBoundingClientRect();
    }
  });
  alphaHandlerPos = computed<number>(() => {
    const { width } = this.alphaPanelRect();
    const handlerRect = this.alphaHandlerRect();
    const left = this.alpha() * width - handlerRect.width / 2;

    return left;
  });

  initialColor!: string;

  ngOnChanges(changes: SimpleChanges): void {
    const inputColor = changes['inputColor'];

    if (inputColor) {
      if (this.hexa() !== inputColor.currentValue && !inputColor.firstChange) {
        const prevColor = hexaToRgba(inputColor.previousValue);
        const { h: prevHue } = rgbToHsv(prevColor.r, prevColor.g, prevColor.b);
        const { r, g, b, a } = hexaToRgba(inputColor.currentValue);
        const { h, s, v } = rgbToHsv(r, g, b, prevHue);
        this.initialColor = inputColor.currentValue;

        this.hue.set(h);
        this.saturation.set(s);
        this.value.set(v);
        this.alpha.set(a);
      }
    }
  }

  constructor() {
    afterNextRender({
      read: () => {
        const { r, g, b } = hexaToRgba(this.inputColor());
        const { h, s, v } = rgbToHsv(r, g, b);
        this.initialColor = this.inputColor();

        this.hue.set(h);
        this.saturation.set(s);
        this.value.set(v);

        this.alphaControl.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe((data) => {
          this.alpha.set(data);
        });

        this.rgbForm.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(({ r = 0, g = 0, b = 0 }) => {
          const { h, s, v } = rgbToHsv(r, g, b);

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);
        });

        this.hexControl.valueChanges.pipe(
          throttleTime(16),
          filter(() => this.hexControl.valid),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe(hexa => {
          const { r, g, b, a } = hexaToRgba(hexa);

          const { h, s, v } = rgbToHsv(r, g, b);

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);
          this.alpha.set(a);
        });

        this.hslForm.valueChanges.pipe(
          throttleTime(16),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(({ h: hChannel = 0, s: sChannel = 0, l = 0 }) => {
          const { h, s, v } = hslToHsv(hChannel, sChannel, l);

          this.hue.set(h);
          this.saturation.set(s);
          this.value.set(v);
        });

        this.hexa$.pipe(
          skip(1),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(value => this.inputColor.set(value));
      },
    });
  }

  updateColorPanelHandlerPos({ top, left, elRect: { width, height } }: AzDragEvent): void {
    const s = left / width;
    const v = 1 - top / height;
    this.saturation.set(s);
    this.value.set(v);
    this.colorContainerRect.set({ width, height });
  }

  updateHuePanelHandlerPos({ left, elRect: { width } }: AzDragEvent): void {
    const hue = Math.round((left / width) * 360);
    this.hue.set(hue);
    this.huePanelRect.set({ width });
  }

  updateAlphaPanelHandlerPos({ left, elRect: { width } }: AzDragEvent): void {
    this.alphaPanelRect.set({ width });
    const alpha = +(left / width).toFixed(2);
    this.alpha.set(alpha);
  }
}
