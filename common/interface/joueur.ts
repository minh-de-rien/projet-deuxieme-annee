import { ModesJeu } from "@common/valeurs-par-defaut";

export interface Joueur {
    nom: string;
    estHote?: boolean | null;
    idSalle?: string;
    idJeu?: number;
    adversaire?: string;
    modeJeu?: ModesJeu;
    estSolo?: boolean;
}
