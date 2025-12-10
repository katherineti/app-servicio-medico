import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FeatherIconsModule } from '../../../feathericons/feathericons.module';
@Component({
    selector: 'app-topstrip',
    imports: [
        MatButtonModule, 
        MatMenuModule,
        FeatherIconsModule
    ],
    templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent {
    constructor() { }
}
