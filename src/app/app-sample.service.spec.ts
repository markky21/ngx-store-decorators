import { TestBed } from '@angular/core/testing';

import { AppSampleService } from './app-sample.service';

describe('AppSampleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppSampleService = TestBed.get(AppSampleService);
    expect(service).toBeTruthy();
  });
});
