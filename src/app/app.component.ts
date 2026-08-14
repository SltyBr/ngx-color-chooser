import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ColorPanelComponent } from 'color-panel';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ColorPanelComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngx-color-panel';
}
