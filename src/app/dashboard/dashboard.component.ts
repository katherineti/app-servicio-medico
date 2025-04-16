import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule
    , FeatherIconsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  public router = inject(Router)
  
    navigate(route:string) {
      this.router.navigate([route]);
    }
}
