import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesGridOwnerRentComponent } from './acces-grid-owner-rent.component';

describe('AccesGridOwnerRentComponent', () => {
  let component: AccesGridOwnerRentComponent;
  let fixture: ComponentFixture<AccesGridOwnerRentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesGridOwnerRentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesGridOwnerRentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
