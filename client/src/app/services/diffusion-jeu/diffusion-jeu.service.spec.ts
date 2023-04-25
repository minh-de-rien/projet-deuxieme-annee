import { TestBed } from '@angular/core/testing';

import { DiffusionJeuService } from './diffusion-jeu.service';

describe('DiffusionJeuService', () => {
    let service: DiffusionJeuService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DiffusionJeuService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
