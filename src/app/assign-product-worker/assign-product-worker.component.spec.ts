import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignProductWorkerComponent } from './assign-product-worker.component';

describe('AssignProductWorkerComponent', () => {
  let component: AssignProductWorkerComponent;
  let fixture: ComponentFixture<AssignProductWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignProductWorkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignProductWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
