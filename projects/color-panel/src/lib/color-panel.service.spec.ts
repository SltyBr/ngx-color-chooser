import { TestBed } from '@angular/core/testing';

import { ColorPanelService } from './color-panel.service';

describe('ColorPanelService', () => {
  let service: ColorPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
