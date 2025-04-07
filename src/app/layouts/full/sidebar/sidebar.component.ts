import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BrandingComponent } from './branding.component';
import { MaterialModule } from '../../../material/material.module';
import { FeatherIconsModule } from '../../../feathericons/feathericons.module';

@Component({
  selector: 'app-sidebar',
  imports: [
    BrandingComponent, 
    MaterialModule,
    FeatherIconsModule
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor() {}
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void {}
}
