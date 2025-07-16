import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { FullComponent } from './layouts/full/full.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RolComponent } from './rol/rol.component';
import { MedicalSuppliesComponent } from './medical-supplies/medical-supplies.component';
import { MedicalSuppliesExpiredComponent } from './medical-supplies/medical-supplies-expired/medical-supplies-expired.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './authentication/guards/auth.guard';
import { LogsComponent } from './logs/logs.component';
import { ReportFormComponent } from './reports/components/report-form/report-form.component';
import { ReportsComponent } from './reports/reports.component';
import { PatientsComponent } from './patients/patients.component';
import { MedicalReportsComponent } from './medical-reports/medical-reports.component';
import { MedicalReportCreateComponent } from './medical-reports/components/medical-report-create/medical-report-create.component';
import { MedicalPrescriptionCreateComponent } from './medical-reports/page/medical-prescription-create.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: '/dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            component: DashboardComponent,
          },
          {
            path: 'users',
            component: UsersComponent,
          },
          {
            path: 'roles',
            component: RolComponent,
          },
          {
            path: 'medical-supplies',
            component: MedicalSuppliesComponent,
          },
          {
            path: 'expired-medical-supplies',
            component: MedicalSuppliesExpiredComponent,
          },
          {
            path: 'logs',
            component: LogsComponent,
          },
          {
            path: 'create-report',
            component: ReportFormComponent,
          },
          {
            path: 'reports',//de auditoria
            component: ReportsComponent,
          },
          {
            path: 'patients',
            component: PatientsComponent,
          },
          {
            path: 'medical-reports',//informes medicos
            component: MedicalReportsComponent,
          },
          {
            path: 'create-medical-reports',//Ruta para crear informes medicos
            component: MedicalReportCreateComponent,
          },
          {
            path: "medical-prescriptions/create/:reportId", // Ruta para crear recipes
            component: MedicalPrescriptionCreateComponent,
          },
        ],
    },
    {
      path: 'login',
      component: LoginComponent,
    },
    {
      path: 'register',
      component: RegisterComponent
    },
];