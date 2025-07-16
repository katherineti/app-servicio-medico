import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-modal-links',
  standalone: true,
  imports: [CommonModule,  RouterModule],
  templateUrl: './modal-links.component.html',
  styleUrls: ['./modal-links.component.scss']
})
export class ModalLinksComponent {
  @Output() close = new EventEmitter<void>();

  links = [
    { img: 'assets/devs/ja.png', name: 'Jesus Arellano', link: './pagina-ja' },
    { img: 'assets/devs/jr.png', name: 'Jhonatan Ramirez', link: 'assets/portafolios/pagina2.html' },
    { img: 'assets/devs/xp.png', name: 'Xiomeli Pineda', link: 'assets/portafolios/pagina3.html' },
    { img: 'assets/devs/logo.jpg', name: 'Lic. Walter Carrasquero'},
  ];
}

