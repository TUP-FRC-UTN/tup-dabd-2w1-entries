import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorRegistryComponent } from './visitor-registry.component';

describe('VisitorRegistryComponent', () => {
  let component: VisitorRegistryComponent;
  let fixture: ComponentFixture<VisitorRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorRegistryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
