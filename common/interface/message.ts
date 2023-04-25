import { Joueur } from '@common/interface/joueur';
export interface Message {
    destinateur: Joueur;
    contenu: string;
}
