import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rgbStr',
  standalone: true,
})
export class RgbStrPipe implements PipeTransform {
  transform({ r, g, b, a }: { r: number; g: number; b: number, a: number }): string {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}
