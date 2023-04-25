import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { ModesJeu } from '@common/valeurs-par-defaut';

export const joueurTest: Joueur = {
    nom: '',
    estHote: true,
    idSalle: '',
    idJeu: 0,
    adversaire: '',
    modeJeu: ModesJeu.Classique,
};

export const jeuTest: InterfaceJeux = {
    id: 2,
    nom: 'Les fleurs',
    meilleursTempsSolo: [],
    meilleursTemps1v1: [],
    imgOriginale: 'urlTest2',
    imgModifiee: '',
    nombreDifferences: 7,
};
