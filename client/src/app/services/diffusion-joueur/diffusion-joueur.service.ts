import { Injectable } from '@angular/core';
import { Joueur } from '@common/interface/joueur';
import { JOUEUR_PAR_DEFAUT } from '@common/valeurs-par-defaut';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DiffusionJoueurService {
    joueur: BehaviorSubject<Joueur> = new BehaviorSubject<Joueur>(JOUEUR_PAR_DEFAUT);

    definirJoueur(joueur: Joueur) {
        this.joueur.next(joueur);
    }
}
