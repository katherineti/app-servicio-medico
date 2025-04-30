import { Component, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { Router } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { firstValueFrom } from 'rxjs';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MaterialModule, FeatherIconsModule ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers:[DashboardService, AuthService]
})

export class DashboardComponent {
  countUsers:number = 0;
  countProductsOfTheDay:number = 0;
  countProductsOfMonth:number = 0;
  countAssignmentOfTheDay:number = 0;
  countAssignmentOfMonth:number = 0;
  formattedLocalDate!: string;
  role:string='';
  
  public router = inject(Router)
  public dashboardService = inject(DashboardService)
  private authService = inject(AuthService);
  
  async ngOnInit(){
    this.role = await this.authService.getRol();
    if( this.role === 'admin' ){
      this.totalUsers();
    }
    this.totalProductsOfTheDay();
    this.totalProductsOfMonth();
    if(this.role === 'admin' || this.role === 'almacen'){
      this.totalAssignmentOfTheDay();
      this.totalAssignmentOfMonth();
    }
  }
  
  navigate(route:string) {
    this.router.navigate([route]);
  }

  async totalUsers() {
    try {
      let users:{count: number} = await firstValueFrom(
        this.dashboardService.totalUsers()
      );
      this.countUsers = users.count;
    } catch (e: any) {
      
      toast.error(e.error.message);
      console.error('Error al obtener la cantidad de usuarios', e);
    }
  }

  async totalProductsOfTheDay() {
    try {
      let totalProductsOfTheDay:{count: number} = await firstValueFrom(
        this.dashboardService.totalProductsOfTheDay()
      );
      this.countProductsOfTheDay = totalProductsOfTheDay.count;
    } catch (e: any) {
      
      toast.error(e.error.message);
      console.error('Error al obtener la cantidad de productos del día', e);
    }
  }

  async totalProductsOfMonth() {
    try {
      let totalProductsOfMonth:{count: number} = await firstValueFrom(
        this.dashboardService.totalProductsOfMonth()
      );
      this.countProductsOfMonth = totalProductsOfMonth.count;
    } catch (e: any) {
      
      toast.error(e.error.message);
      console.error('Error al obtener la cantidad de productos del mes', e);
    }
  }

  async totalAssignmentOfTheDay() {
    try {
      let totalAssignmentOfTheDay:{count: number} = await firstValueFrom(
        this.dashboardService.totalAssignmentOfTheDay()
      );
      console.log("totalAssignmentOfTheDay " , totalAssignmentOfTheDay)
      this.countAssignmentOfTheDay = totalAssignmentOfTheDay.count;
    } catch (e: any) {
      
      toast.error(e.error.message);
      console.error('Error al obtener la cantidad de asignaciones del día', e);
    }
  }

  async totalAssignmentOfMonth() {
    try {
      let totalAssignmentOfMonth:{count: number} = await firstValueFrom(
        this.dashboardService.totalAssignmentOfMonth()
      );
      this.countAssignmentOfMonth = totalAssignmentOfMonth.count;
    } catch (e: any) {
      
      toast.error(e.error.message);
      console.error('Error al obtener la cantidad de asignaciones del mes', e);
    }
  }
  getLocalDate(): Date {
    return new Date();
  }

  formatearFecha(fecha: Date, mes:string|null=null): string {
    const dia = fecha.getDate();
    const mesCompleto = new Intl.DateTimeFormat('es', { month: 'long' }).format(fecha);
    const mesInicialMayuscula = mesCompleto.charAt(0).toUpperCase() + mesCompleto.slice(1);
    const año = fecha.getFullYear();
    if(mes) return `${mesInicialMayuscula} de ${año}`;
    return `${dia} de ${mesInicialMayuscula} de ${año}`;
  }
}