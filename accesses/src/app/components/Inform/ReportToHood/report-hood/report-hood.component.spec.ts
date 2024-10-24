import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHoodComponent } from './report-hood.component';

describe('ReportHoodComponent', () => {
  let component: ReportHoodComponent;
  let fixture: ComponentFixture<ReportHoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportHoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportHoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
