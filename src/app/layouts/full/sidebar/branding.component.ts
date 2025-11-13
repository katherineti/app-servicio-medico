import { Component } from '@angular/core';
import { CoreService } from '../../../services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/">
      <img
        src="./assets/logo-ciip.png"
        class="m-2"
        alt="logo ciip"
        width="225"
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