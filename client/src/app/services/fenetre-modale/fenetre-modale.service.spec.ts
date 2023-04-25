import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { FenetreModaleService } from './fenetre-modale.service';

describe('FenetreModaleService', () => {
    let service: FenetreModaleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(FenetreModaleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
