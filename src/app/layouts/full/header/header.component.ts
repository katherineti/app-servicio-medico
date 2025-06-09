import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MaterialModule } from '../../../material/material.module';
import { FeatherIconsModule } from '../../../feathericons/feathericons.module';
import { AuthService } from '../../../services/auth.service';
import { TokenAuth } from '../../../authentication/models/token-auth.model';
import { UsersService } from '../../../users/services/users.service';
import { IUser } from '../../../users/interfaces/users.interface';
import { LogService } from '../../../services/log.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    FeatherIconsModule,
    MaterialModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ["./header.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  token!: TokenAuth;
  user!: IUser;

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  authService = inject(AuthService)
  private usersService = inject(UsersService);
  private logService = inject(LogService)

  async ngOnInit(): Promise<void> {
    this.token = this.authService.getTokenInfo( await this.authService.getPlainToken() );
    if( this.token.sub ){
      this.getUser(this.token.sub ) 
    }
  }

  getUser(id:number) {
    this.usersService.getUser(id).subscribe((data: IUser) => {
      this.user = data;
    });
  }

  
  async logout() {
    await firstValueFrom( this.logService.createLog("Logout") );
    this.authService.logout();
  }
}