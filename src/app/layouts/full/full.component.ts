import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CoreService } from '../../services/core.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppNavItemComponent } from './sidebar/nav-item/nav-item.component';
import { navItems, navItemsAdmin, navItemsAlmacen2Movil, navItemsMedico } from './sidebar/sidebar-data';
import { MaterialModule } from '../../material/material.module';
import { FeatherIconsModule } from '../../feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';
import { IdleService } from '../../services/idle.service';
import { DbBackupActionComponent } from '../../db-backup-action/db-backup-action.component';
const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
@Component({
  selector: 'app-full',
  imports: [
    RouterModule,
    AppNavItemComponent,
    MaterialModule,
    CommonModule,
    SidebarComponent,
    NgScrollbarModule,
    HeaderComponent,
    FeatherIconsModule,
    DbBackupActionComponent
  ],
  templateUrl: './full.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnInit, OnDestroy {
  navItems = navItemsAdmin;
  @ViewChild('leftsidenav')
  public sidenav: MatSidenav = new MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  options: any;
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;
  private role:string='';
  public minutes: number = 5;
  public seconds: number = 0;
  public isLoggedIn: boolean = false;
  private timeSubscription: Subscription | undefined;
  private timeoutSubscription: Subscription | undefined;
  public userRole: string | null = null;
  get isOver(): boolean {
    return this.isMobileScreen;
  }
  private settings = inject(CoreService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);
  constructor(private idleService: IdleService) {
    this.options = this.settings.getOptions();
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((e) => {
          this.content.scrollTo({ top: 0 });
      });
    }
  async ngOnInit(): Promise<void> {
    console.log("En el full.component.ts");
    this.timeSubscription = this.idleService.timeRemaining$.subscribe(totalSeconds => {
      this.minutes = Math.floor(totalSeconds / 60);
      this.seconds = totalSeconds % 60;
    });
    this.timeoutSubscription = this.idleService.onTimeout.subscribe(() => {
      this.handleLogout();
    });
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
        this.idleService.startMonitoring();
    }
    this.role = await this.authService.getRol();
    this.userRole = this.role; 
    if( this.role === 'admin' || this.role === 'admin RRHH' || this.role === 'auditor' ){
      this.navItems = navItemsAdmin;
    }else if(this.role === 'almacen movil'){
      this.navItems = navItemsAlmacen2Movil;
    }else if(this.role === 'medico' || this.role === 'enfermero(a)'){
      this.navItems = navItemsMedico;
    }else{
      this.navItems = navItems; 
    }
  }
  toggleCollapsed() {
    this.isContentWidthFixed = false;
    this.options.sidenavCollapsed = !this.options.sidenavCollapsed;
    this.resetCollapsedState();
  }
  resetCollapsedState(timer = 400) {
    setTimeout(() => this.settings.setOptions(this.options), timer);
  }
  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }
  onSidenavOpenedChange(isOpened: boolean) {
    this.isCollapsedWidthFixed = !this.isOver;
    this.options.sidenavOpened = isOpened;
    this.settings.setOptions(this.options);
  }
  private handleLogout(): void {
    console.log('¡5 minutos de inactividad! Cerrando sesión...');
    try {
    console.log('¡5 minutos de inactividad! Cerrando sesión...');
    this.idleService.stopMonitoring();
    this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor, limpiando localmente.', error);
      this.authService.clearLocalSession(); 
      this.router.navigate(['/login']);
    }
  } 
  ngOnDestroy(): void {
    this.layoutChangesSubscription.unsubscribe();
    this.timeSubscription!.unsubscribe();
    this.timeoutSubscription!.unsubscribe();
    this.idleService.stopMonitoring();
  }
}