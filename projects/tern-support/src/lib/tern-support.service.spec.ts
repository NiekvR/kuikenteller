import { TestBed } from '@angular/core/testing';

import { TernSupportService } from './tern-support.service';

describe('TernSupportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TernSupportService = TestBed.get(TernSupportService);
    expect(service).toBeTruthy();
  });
});
