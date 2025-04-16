import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RolComponent } from './rol/rol.component';
import { MedicalSuppliesComponent } from './medical-supplies/medical-supplies.component';
import { MedicalSuppliesExpiredComponent } from './medical-supplies-expired/medical-supplies-expired.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [
          {
            path: '',
            redirectTo: '/dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            component: DashboardComponent
          },
          {
            path: 'users',
            component: UsersComponent
          },
          {
            path: 'roles',
            component: RolComponent
          },
          {
            path: 'medical-supplies',
            component: MedicalSuppliesComponent
          },
          {
            path: 'expired-medical-supplies',
            component: MedicalSuppliesExpiredComponent
          },
        ],
    },
    {
      path: 'login',
      component: LoginComponent
    },
];
