import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMedicalPrescriptionsComponent } from './list-medical-prescriptions.component';

describe('ListMedicalPrescriptionsComponent', () => {
  let component: ListMedicalPrescriptionsComponent;
  let fixture: ComponentFixture<ListMedicalPrescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMedicalPrescriptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMedicalPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
