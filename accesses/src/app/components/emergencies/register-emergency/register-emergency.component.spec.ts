import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEmergencyComponent } from './register-emergency.component';

describe('RegisterEmergencyComponent', () => {
  let component: RegisterEmergencyComponent;
  let fixture: ComponentFixture<RegisterEmergencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterEmergencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
