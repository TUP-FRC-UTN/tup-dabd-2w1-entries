import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPruebaComponent } from './dashboard-prueba.component';

describe('DashboardPruebaComponent', () => {
  let component: DashboardPruebaComponent;
  let fixture: ComponentFixture<DashboardPruebaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPruebaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPruebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
