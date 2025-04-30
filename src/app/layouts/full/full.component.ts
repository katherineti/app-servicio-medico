import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { navItems, navItemsAdmin } from './sidebar/sidebar-data';
import { MaterialModule } from '../../material/material.module';
import { FeatherIconsModule } from '../../feathericons/feathericons.module';
import { AuthService } from '../../services/auth.service';


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
    FeatherIconsModule
  ],
  templateUrl: './full.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnInit {
  navItems = navItemsAdmin;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav = new MatSidenav;
  resView = false;
  @ViewChild('content', { static: true }) content!: MatSidenavContent;
  //get options from service
  options: any;
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;
  private role:string='';

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  private settings = inject(CoreService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthService);

  constructor() {
    this.options = this.settings.getOptions();
    this.htmlElement = document.querySelector('html')!;
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes
        this.options.sidenavOpened = true;
        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];
        if (this.options.sidenavCollapsed == false) {
          this.options.sidenavCollapsed = state.breakpoints[TABLET_VIEW];
        }
      });

    // This is for scroll to top
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.content.scrollTo({ top: 0 });
    });
  }

  async ngOnInit(): Promise<void> {
    this.role = await this.authService.getRol();
    console.log(this.role);
    if( this.role === 'admin' ){
      this.navItems = navItemsAdmin;
    }else{
      this.navItems = navItems;
    }
   }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
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

}