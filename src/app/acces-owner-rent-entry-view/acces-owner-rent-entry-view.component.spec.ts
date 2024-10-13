import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesOwnerRentEntryViewComponent } from './acces-owner-rent-entry-view.component';

describe('AccesOwnerRentEntryViewComponent', () => {
  let component: AccesOwnerRentEntryViewComponent;
  let fixture: ComponentFixture<AccesOwnerRentEntryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesOwnerRentEntryViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesOwnerRentEntryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
