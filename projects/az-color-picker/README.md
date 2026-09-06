# Angular v20+ Color Picker
Angular Color Picker component for Angular20+ (**RxJs** event handling + state handling with **SignalApi**).
When for some reason input[type="color"] not compatible with your purposes.
Thanks to Cross-device event handling works in mobile browsers.

![demo](assets/demo.gif)

### Content
- [Instalation](#instalation)
- [Usage](#usage)
- [Suggestions](#suggestions)
- [License](#license)

## Instalation

`npm i @am-zero/color-picker`

then add `AzColorPicker` into module/component imports
```typescript
import { AzColorPicker } from 'az-color-picker';

@NgModule({
// ...
  imports: [
    // ...
    AzColorPicker,
    // ...
  ],
// ...
})
```

## Usage
```angular2html
<az-color-picker [(inputColor)]="color"></az-color-picker>
```
inputColor is model signal with hex-string type (opacity hex code is optional)
there is also width and height inputs, without this params, component will fit to 100% width of parent container
```typescript
import { Component } from '@angular/core';
import {EditorConfig, ST_BUTTONS} from 'ngx-simple-text-editor';

@Component({
  selector: 'app-root',
  template: `
    <az-color-picker  [(inputColor)]="color" />
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  color = "#5d5ff0";
}
```

## Suggestions
It's not that ideal, because I only started and not have many ideas how to extend api.
If you have some suggestions, or found bugs, please, create an issue or contact me [LinkedIn](https://www.linkedin.com/in/pavel-popov-673062254/)

## License
MIT