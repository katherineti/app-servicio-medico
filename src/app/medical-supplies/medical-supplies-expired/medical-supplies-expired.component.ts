import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderTitleComponent } from '../../header-title/header-title.component';
import { MedicalSuppliesDatatableComponent } from '../medical-supplies-datatable/medical-supplies-datatable.component';
import { MaterialModule } from '../../material/material.module';
import { IProduct } from '../interfaces/medical-supplies.interface';

@Component({
  selector: 'app-medical-supplies-expired',
  templateUrl: './medical-supplies-expired.component.html',
  styleUrl: './medical-supplies-expired.component.scss',
  imports: [
    CommonModule,
    MaterialModule,
    HeaderTitleComponent,
    // MedicalSuppliesDatatableComponent
  ],
})
export class MedicalSuppliesExpiredComponent {
  // PRODUCT_DATA_EXPIRED: IProduct[] = [
  //   {
  //     id: 2,
  //     name: 'Ibuprofeno',
  //     description: 'Descripción del Ibuprofeno',
  //     category: 'categoria1',
  //     type: 'medicamentos', //'medicamentos','uniformes','equipos odontologicos'
  //     stock: 0,
  //     code: '000111',
  //     date_entry: '2025-04-10',
  //     expiration_date: '2025-07-10',
  //     status: "Proximo a vencerse",
  //     imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  //   }
  // ];

}