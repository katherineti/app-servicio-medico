import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMedicalSuppliesComponent } from './create-medical-supplies.component';

describe('CreateMedicalSuppliesComponent', () => {
  let component: CreateMedicalSuppliesComponent;
  let fixture: ComponentFixture<CreateMedicalSuppliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMedicalSuppliesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMedicalSuppliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
