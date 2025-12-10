import { Component} from '@angular/core';
import { HeaderTitleComponent } from '../header-title/header-title.component';
import { MedicalSuppliesDatatableComponent } from './medical-supplies-datatable/medical-supplies-datatable.component';
@Component({
  selector: 'app-medical-supplies',
  imports: [
    HeaderTitleComponent,
    MedicalSuppliesDatatableComponent
  ],
  templateUrl: './medical-supplies.component.html',
})
export class MedicalSuppliesComponent {
  constructor() { }
}