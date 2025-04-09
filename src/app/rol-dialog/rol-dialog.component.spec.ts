import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolDialogComponent } from './rol-dialog.component';

describe('RolDialogComponent', () => {
  let component: RolDialogComponent;
  let fixture: ComponentFixture<RolDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
