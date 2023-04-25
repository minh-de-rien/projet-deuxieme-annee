import { StatutPartie } from '../enum/statut-partie';
import { InterfaceJeux } from './interface-jeux';
import { Joueur } from './joueur';

export interface ReponseStatutPartie {
    jeu?: InterfaceJeux;
    joueurs?: Joueur[];
    statutPartie?: StatutPartie;
    salleId?: string;
}
