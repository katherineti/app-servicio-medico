import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SharedDataService } from './shared-data.service';
@Component({
  selector: 'app-modal-links',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modal-links.component.html',
  styleUrls: ['./modal-links.component.scss']
})
export class ModalLinksComponent {
  @Output() close = new EventEmitter<void>();
  private router = inject(Router) 
  private sharedDataService = inject(SharedDataService) 
  links = [
    { img: 'assets/devs/ja.png', name: 'Jesus Arellano', link: '/pagina-ja', pdf: "assets/devs/cv_ja.pdf", isInternal: true },
    { img: 'assets/devs/jr.png', name: 'Jhonatan Ramirez',  link: '/pagina-ja', pdf: "assets/devs/cv_jr.pdf", isInternal: true },
    { img: 'assets/devs/xp.png', name: 'Xiomeli Pineda',  link: '/pagina-ja', pdf: "assets/devs/cv_xp.pdf", isInternal: true },
    { img: 'assets/devs/logo.jpg', name: 'Lic. Walter Carrasquero', isInternal: false},
  ]; 
  sendHiddenParameterViaService(item: any) {
      const myHiddenData = item;
      this.sharedDataService.setDatos(myHiddenData);
      this.router.navigate(['/pagina-ja']);
  }
}