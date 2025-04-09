import { Component, Input } from '@angular/core';
import { FeatherIconsModule } from '../feathericons/feathericons.module';

@Component({
  selector: 'app-header-title',
  imports: [FeatherIconsModule],
  templateUrl: './header-title.component.html',
  styleUrl: './header-title.component.scss'
})
export class HeaderTitleComponent {

  @Input() title:string='Ciip';
}