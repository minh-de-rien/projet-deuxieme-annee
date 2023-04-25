import { TestBed } from '@angular/core/testing';
import { joueurTest } from '@common/constantes/constantes-test';
import { DiffusionJoueurService } from './diffusion-joueur.service';

describe('DiffusionJoueurService', () => {
    let service: DiffusionJoueurService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DiffusionJoueurService);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('definirJoueur devrait enregistrer le joueur entré', () => {
        spyOn(service.joueur, 'next');
        service.definirJoueur(joueurTest);
        expect(service.joueur.next).toHaveBeenCalledWith(joueurTest);
    });
});
