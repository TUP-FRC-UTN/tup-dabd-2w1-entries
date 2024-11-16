import { TestBed } from '@angular/core/testing';

import { AuthOwnerService } from './auth-owner.service';

describe('AuthOwnerService', () => {
  let service: AuthOwnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthOwnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
