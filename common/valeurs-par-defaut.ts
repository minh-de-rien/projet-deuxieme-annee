import { InterfaceCouleur } from './interface/interface-couleur';
import { Joueur } from './interface/joueur';

// Constantes communes
export const LARGEUR_IMAGE = 640;
export const HAUTEUR_IMAGE = 480;

// Constantes pour la barre de navigation
export const TITRE_PAGE_CREATION_JEU = 'Créez votre jeu de différence!';

// Constantes pour la sélection de jeux

export const NB_JEUX_MAX = 4;
export const NB_SECONDE_DANS_UNE_MINUTE = 60;

// Constantes pour la gestion-affichage-jeu
export const DELAI_CHARGEMENT_IMAGE = 4000;
export const DELAI_CLIGNOTEMENT_MASQUE = 100;
export const REPETITION_CLIGNOTEMENT_MASQUE = 6;
export const DELAI_CLIGNOTEMENT_TRICHE = 125;
export enum Jaune {
    R = 255,
    G = 255,
    B = 0,
    A = 255,
}

// Constantes pour la création de jeu
/* la taille du fichier est généralement 921738 quand bpp = 24, width = 640, height = 480, 
on établit un range pour gérer les exceptions et rendre la fonction plus safe */
export const BORNE_SUP_TAILLE_FICHIER_POUR_BPP_24 = 1000000;
export const BORNE_INF_TAILLE_FICHIER_POUR_BPP_24 = 900000;
export const NOMBRE_DE_FICHIERS = 2;
export const NOMBRE_DE_DIFFERENCES_MIN = 3;
export const NOMBRE_DE_DIFFERENCES_MAX = 9;
export const NOMBRE_OCTETS_IMAGE = 1228800;
export enum ZoneInput {
    InputDeuxZones = 'input-deux-zones',
    InputZoneOriginale = 'input-zone-originale',
    InputZoneModifiee = 'input-zone-modifiee',
}
export enum BoutonReinitialisation {
    BoutonDeuxZones = 'bouton-reinitialisation-deux-zones',
    BoutonImageOriginale = 'bouton-reinitialisation-img-originale',
    BoutonImageModifiee = 'bouton-reinitialisation-img-modifiee',
}
export enum BoutonAvantPlan {
    AvantPlanOriginal = 'bouton-reinitialisation-avant-plan-originale',
    AvantPlanModifie = 'bouton-reinitialisation-avant-plan-modifie',
}
export enum BoutonDuplication {
    BoutonDuplicationOriginal = 'bouton-duplication-avant-plan-originale',
    BoutonDuplicationModifie = 'bouton-duplication-avant-plan-modifie',
}
export enum IdCanvas {
    IdCanvasOriginal = 'imgOriginale',
    IdCanvasModifie = 'imgModifiee',
}

// Constantes pour la détection de différences
export const NOMBRE_DE_COULEURS_PAR_PIXEL = 4;
export const BLANC = 255;
export const NOIR = 0;
export const PIXEL_DIFFERENT = 1;
export const TAILLE_IMAGE = LARGEUR_IMAGE * HAUTEUR_IMAGE;
export const TAILLE_MATRICE_RGBA = TAILLE_IMAGE * NOMBRE_DE_COULEURS_PAR_PIXEL;
export const VALEUR_ALPHA_NON_VISITEE = 0;
export const INDEX_POSITION_ALPHA_PIXEL = 3;
export const DECALAGE_ID_DIFFERENCE = 1;

// Constantes de temps
export const DELAI_SECONDE = 1000;
export const COMPTEUR_SECONDE = 60;
export const PENALITE_INDICE = 5;
export const VALEUR_MAX_COMPTE_A_REBOURS = 120;

// Constantes de modes de jeu
export enum ModesJeu {
    Classique = 'classique',
    TempsLimite = 'tempslimite',
}

// Constantes d'affichage
export const AJUSTEMENT_X_ERREUR = 40;

// Constante boîte de dialog-nom
export const LONGUEUR_MIN_NOM_JOUEUR = 1;

// Constante de la page de matériel
export const MATERIAL_PREBUILT_THEMES = [
    {
        value: 'indigo-pink-theme',
        label: 'Indigo & Pink',
    },
    {
        value: 'deeppurple-amber-theme',
        label: 'Deep Purple & Amber',
    },
    {
        value: 'pink-bluegrey-theme',
        label: 'Pink & Blue-grey',
    },
    {
        value: 'purple-green-theme',
        label: 'Purple & Green',
    },
];

export const MATERIAL_DEFAULT_PREBUILT_THEME = MATERIAL_PREBUILT_THEMES[0];

// Constantes pour la gestion-differences du serveur
export const ID_SIMILARITE = -1;

// Constantes pour l'implémentation de la LIFO
export enum CanvasDessin {
    Original = 'canvasDessinOriginal',
    Modifie = 'canvasDessinModifie',
    OriginalInterverti = 'avantPlanOriginalInterverti',
    ModifieInterverti = 'avantPlanModifieInterverti',
}

// Constantes pour la palette
export const LARGEUR_CANVAS_PALETTE = 50;
export const HAUTEUR_CANVAS_PALETTE = 50;

export enum Palette {
    Rouge = 'rgba(255, 0, 0, 1)',
    Jaune = 'rgba(255, 255, 0, 1)',
    Vert = 'rgba(0, 255, 0, 1)',
    Cyan = 'rgba(0, 255, 255, 1)',
    Bleu = 'rgba(0, 0, 255, 1)',
    Rose = 'rgba(255, 0, 255, 1)',
}

export enum PositionCouleur {
    Jaune = 0.17,
    Vert = 0.34,
    Cyan = 0.51,
    Bleu = 0.68,
    Rose = 0.85,
}

// Constantes pour les salles d'attentes et de jeu
export const INDEX_SALLE_DE_JEU = 1;
export const INDEX_JOUEUR_INVITE = 1;
export const INDEX_JOUEUR_HOTE = 0;
export const DELAI_AVANT_RETOUR = 3000;
export const ID_SALLE_BROADCAST = 'broadcast';

// Constante pour affichage de l'heure
export const TAMPON_DE_ZEROS = -2;

// Constante pour la vue-jeu
export const FIN_PAR_ABANDON = -1;

// Constante pour le nom du serveur pour le chat
export const NOM_DESTINATEUR_SERVEUR = 'serveur';

// Constante pour le préfixe du nom des salles des sockets du serveur
export const NOM_SALLE_SOCKET_SERVEUR = 'salle_';

// Constante pour la structure de données des salles avec les paires joueur-socket
export const INDEX_PAIRE_JOUEUR = 0;
export const INDEX_PAIRE_SOCKET = 1;

// Constante pour obtenir la matrice de différence et le tableau de regroupement de diff
export const INDEX_MATRICE = 0;
export const INDEX_REGROUP = 1;

//constante de la base de donnee des scores

export const NOMS_MEILLEURS_TEMPS_PAR_DEFAUT: string[] = [
    'Nemro',
    'Nils',
    'Minh',
    'Juliette',
    'Jolan',
    'Chavrel',
    'Dorah',
    'Kolo',
    'Dorah',
    'MBakolo',
    'Solange',
    'Marlyse',
    'Menkam',
    'Yapmi',
    'Seidou',
    'Mbeutcha',
    'Yimbwo',
    'MBakolo',
    'Nemro',
    'Ocean',
    'Filston',
    'Kivin',
    'Yann',
    'Kolo',
    'Herman',
    'Olivier',
    'Ernest',
    'MBakolo',
    'Amaury',
    'Mathis',
    'Megane',
    'Nemro',
    'Guitry',
    'Kolo',
    'Isabelle',
    'Pokam',
    'Loic',
    'Ismael',
    'MBakolo',
    'Benoit',
    'Nemro',
    'Nino',
    'Vyvy',
    'Ngass',
    'Dilan',
    'Nemro',
    'Marrius',
    'MBakolo',
    'Kolo',
    'Francky',
    'Sandra',
    'Ornella',
    'Jean',
    'Fabrice',
    'MBakolo',
    'Jospin',
    'Maxime',
    'Nemro',
    'Ange',
    'Docteur',
    'Kolo',
    'Jolan',
    'Steve',
];

export const MEILLEURS_TEMPS_PAR_DEFAUT: number[] = [
    200, 304, 408, 600, 201, 305, 400, 701, 210, 309, 601, 215, 520, 199, 230, 650, 515, 350, 225, 235, 535, 628, 700, 221, 208, 307, 400, 407, 100,
    330, 220, 440, 550, 660, 360, 270, 582, 150, 240, 211, 311, 411, 511, 611, 180, 477, 277, 477, 677, 588, 288, 488, 200, 100,
];
export const NOMBRE_MEILLEURS_SCORES_PAR_JEU = 3;
export const PAS_DE_RECHERCHE_MEILLEUR_TEMPS = 10;
// Constante pour la gestion des indices
export const IDENTIFIANT_INDICE_SPECIAL = 3;
export const CONSTANTE_IDENTIFICATION_INDICE = 4;
export const CENTRE_CANVAS_INDICE_SPECIAL = 100;
export const DELAI_APPARITION_INDICE_SPECIAL = 3000;

// Couleurs
export const COULEUR_NOIR: InterfaceCouleur = {
    R: 0,
    G: 0,
    B: 0,
    A: 255,
};
export const COULEUR_JAUNE: InterfaceCouleur = {
    R: 255,
    G: 255,
    B: 0,
    A: 255,
};

// Constante pour les url d'audio
export enum UrlAudio {
    Erreur = './assets/audios/sonErreur.wav',
    Validation = './assets/audios/sonValidation.wav',
    Clic = './assets/audios/sonClic.wav',
}

// Constante pour la snack bar
export const DUREE_SNACK_BAR = 5000;

// Constante pour diffusion du joueur
export const JOUEUR_PAR_DEFAUT: Joueur = {
    nom: '',
    estHote: null,
    idSalle: '',
    idJeu: 0,
    adversaire: '',
};
