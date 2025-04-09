import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTitleComponent } from './header-title.component';

describe('HeaderTitleComponent', () => {
  let component: HeaderTitleComponent;
  let fixture: ComponentFixture<HeaderTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
