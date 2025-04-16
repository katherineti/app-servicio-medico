import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSuppliesDatatableComponent } from './medical-supplies-datatable.component';

describe('MedicalSuppliesDatatableComponent', () => {
  let component: MedicalSuppliesDatatableComponent;
  let fixture: ComponentFixture<MedicalSuppliesDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalSuppliesDatatableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSuppliesDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
