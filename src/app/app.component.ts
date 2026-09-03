import { Component } from '@angular/core';
import { ColorChooserComponent } from 'ngx-color-chooser';

@Component({
    selector: 'app-root',
    imports: [ColorChooserComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo-color-chooser';
  color = '#5d5ff0';

  test(value: any): void {
    this.color = value;
    console.log('onValueChanged ', value);
  }

  onSubmit(): void {}
}
