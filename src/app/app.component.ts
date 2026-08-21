import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorChooserComponent } from 'color-chooser';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ColorChooserComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngx-color-chooser';
}
