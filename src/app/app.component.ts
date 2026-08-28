import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorChooserComponent } from 'ngx-color-chooser';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ColorChooserComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo-color-chooser';
  color = '#ff0000ff';

  test(value: string): void {
    console.log('onValueChanged ', value);
  }

  onSubmit(): void {}
}
