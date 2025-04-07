import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FeatherIconsModule } from '../../../feathericons/feathericons.module';
// import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
    selector: 'app-topstrip',
    imports: [
        // TablerIconsModule, 
        MatButtonModule, 
        MatMenuModule,
        FeatherIconsModule
    ],
    templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent {
    constructor() { }

}
