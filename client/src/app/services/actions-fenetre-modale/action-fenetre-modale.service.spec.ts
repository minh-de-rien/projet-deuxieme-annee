import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { ActionsModaleService } from './action-fenetre-modale.service';

describe('ActionsModaleService', () => {
    let service: ActionsModaleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatSnackBarModule],
        });
        service = TestBed.inject(ActionsModaleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
