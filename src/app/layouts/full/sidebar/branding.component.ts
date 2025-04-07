import { Component } from '@angular/core';
import { CoreService } from '../../../services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/" class="logodark">
      <!-- src="./assets/images/logos/dark-logo.svg" -->
      <img
        src="https://svg4k.com/wp-content/uploads/2022/01/Logo_Svg_Free.svg"
        class="align-middle m-2"
        alt="logo"
        width="50"
      />
    </a>
  `,
})
export class BrandingComponent {
  // options = this.settings.getOptions();
  options:any;
  constructor(private settings: CoreService) {
    this.options = this.settings.getOptions();
  }
}
