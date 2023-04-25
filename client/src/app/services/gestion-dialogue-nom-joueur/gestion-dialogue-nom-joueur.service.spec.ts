/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DonneeDialogue } from '@app/components/dialog-ajoute-nom-joueur/dialog-ajoute-nom-joueur.component';
import { of, Subject } from 'rxjs';

import { GestionDialogueNomJoueurService } from './gestion-dialogue-nom-joueur.service';

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({ action: true }),
        };
    }
}

describe('GestionDialogueNomJoueurService', () => {
    let service: GestionDialogueNomJoueurService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [{ provide: MatDialog, useClass: MatDialogMock }],
        });
        service = TestBed.inject(GestionDialogueNomJoueurService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('obtenirNomJoueur() devrait appeler gererEnvoieNomJoueur', () => {
        expect(service.obtenirNomJoueur()).toEqual(service['nomJoueur']);
    });

    it('ouvrirBoiteDialogue() devrait retourner le nom du joueur', () => {
        const gererEnvoieNomJoueurSpy = spyOn<any>(service, 'gererEnvoieNomJoueur');
        service.ouvrirBoiteDialogue();
        expect(gererEnvoieNomJoueurSpy).toHaveBeenCalled();
    });

    it('gererEnvoieNomJoueur() devrait retourner le nom du joueur', () => {
        const nextSpy = spyOn(service['nomJoueur'], 'next');
        const alertSpy = spyOn(window, 'alert');
        const subject = new Subject<DonneeDialogue>();
        const dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
        dialogRefMock.afterClosed.and.returnValue(subject);
        service['gererEnvoieNomJoueur'](dialogRefMock);
        subject.next({ nomJoueur: 'toto' });
        subject.next({ nomJoueur: '' });
        expect(alertSpy).toHaveBeenCalled();
        expect(nextSpy).toHaveBeenCalled();
    });
});
