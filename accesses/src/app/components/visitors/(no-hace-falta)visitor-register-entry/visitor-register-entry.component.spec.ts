import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorRegisterEntryComponent } from './visitor-register-entry.component';

describe('VisitorRegisterEntryComponent', () => {
  let component: VisitorRegisterEntryComponent;
  let fixture: ComponentFixture<VisitorRegisterEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorRegisterEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorRegisterEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
