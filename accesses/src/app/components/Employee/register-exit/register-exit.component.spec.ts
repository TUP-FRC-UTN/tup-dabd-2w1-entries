import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterExitComponent } from './register-exit.component';

describe('RegisterExitComponent', () => {
  let component: RegisterExitComponent;
  let fixture: ComponentFixture<RegisterExitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterExitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
