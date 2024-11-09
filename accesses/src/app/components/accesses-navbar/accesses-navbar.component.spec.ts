import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessesNavbarComponent } from './accesses-navbar.component';

describe('AccessesNavbarComponent', () => {
  let component: AccessesNavbarComponent;
  let fixture: ComponentFixture<AccessesNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessesNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessesNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
