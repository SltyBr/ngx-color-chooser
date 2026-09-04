import { Component } from '@angular/core';
import { AzColorPicker } from 'az-color-picker';

@Component({
    selector: 'app-root',
    imports: [AzColorPicker],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo-color-picker';
  color = '#5d5ff0';

  test(value: any): void {
    this.color = value;
    console.log('onValueChanged ', value);
  }

  onSubmit(): void {}
}
