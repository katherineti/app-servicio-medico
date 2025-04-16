import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSuppliesExpiredComponent } from './medical-supplies-expired.component';

describe('MedicalSuppliesExpiredComponent', () => {
  let component: MedicalSuppliesExpiredComponent;
  let fixture: ComponentFixture<MedicalSuppliesExpiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalSuppliesExpiredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSuppliesExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
