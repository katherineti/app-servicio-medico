import { CommonModule } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { SharedDataService } from '../modal-links/shared-data.service';
@Component({
  selector: 'app-pagina-ja',
   imports: [CommonModule],
  templateUrl: './pagina-ja.component.html',
  styleUrl: './pagina-ja.component.scss'
})
export class PaginaJaComponent implements OnInit {
  datosDelServicio: any
  constructor(private sharedDataService: SharedDataService) {}
  ngOnInit(): void {
    this.sharedDataService.datos$.subscribe(datos => {
      this.datosDelServicio = datos;
    });

  }
}
