import { ModesJeu } from '@common/valeurs-par-defaut';
import { Vec2 } from './vec2';

export interface InterfacePartie {
    salleId: string;
    modeDeJeu: ModesJeu;
    nombreDifferencesTrouvees: Map<number, number>; //la clé correspond à l'index joueur (hote vs invite)
    differenceTrouvees: Vec2[];
    tableauRegroupements: Vec2[][];
    tableauRegroupementsDifferencesRestantes: Vec2[][];
    matriceDifferences: number[];
}
