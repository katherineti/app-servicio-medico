import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMedicalSuppliesComponent } from './edit-medical-supplies.component';

describe('EditMedicalSuppliesComponent', () => {
  let component: EditMedicalSuppliesComponent;
  let fixture: ComponentFixture<EditMedicalSuppliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMedicalSuppliesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMedicalSuppliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
