import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaJaComponent } from './pagina-ja.component';

describe('PaginaJaComponent', () => {
  let component: PaginaJaComponent;
  let fixture: ComponentFixture<PaginaJaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaJaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaJaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
