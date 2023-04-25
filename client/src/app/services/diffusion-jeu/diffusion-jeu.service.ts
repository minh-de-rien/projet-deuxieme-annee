import { Injectable } from '@angular/core';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DiffusionJeuService {
    jeu: BehaviorSubject<InterfaceJeux> = new BehaviorSubject<InterfaceJeux>({
        id: 0,
        nom: '',
        imgOriginale: '',
        imgModifiee: '',
        nombreDifferences: 0,
    });

    definirJeu(jeu: InterfaceJeux) {
        this.jeu.next(jeu);
    }
}
