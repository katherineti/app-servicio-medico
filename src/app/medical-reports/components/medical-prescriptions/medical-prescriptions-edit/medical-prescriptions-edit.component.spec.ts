import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalPrescriptionsEditComponent } from './medical-prescriptions-edit.component';

describe('MedicalPrescriptionsEditComponent', () => {
  let component: MedicalPrescriptionsEditComponent;
  let fixture: ComponentFixture<MedicalPrescriptionsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalPrescriptionsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalPrescriptionsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});