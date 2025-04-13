import { Component } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule
    , FeatherIconsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

}
