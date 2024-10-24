import { TestBed } from '@angular/core/testing';

import { AccesPdfGenerateService } from './acces-pdf-generate.service';

describe('AccesPdfGenerateService', () => {
  let service: AccesPdfGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccesPdfGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
