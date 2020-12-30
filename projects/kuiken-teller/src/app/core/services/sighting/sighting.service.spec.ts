import { TestBed } from '@angular/core/testing';

import { SightingService } from './sighting.service';

describe('SightingService', () => {
  let service: SightingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SightingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
