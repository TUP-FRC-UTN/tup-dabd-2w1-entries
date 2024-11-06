import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDashboardEgressComponent } from './access-dashboard-egress.component';

describe('AccessDashboardEgressComponent', () => {
  let component: AccessDashboardEgressComponent;
  let fixture: ComponentFixture<AccessDashboardEgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDashboardEgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessDashboardEgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
