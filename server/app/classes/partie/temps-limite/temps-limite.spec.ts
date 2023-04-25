/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { joueurTest } from '@common/constantes/constantes-test';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { TempsLimite } from './temps-limite';

describe('TempsLimite', () => {
    const tempsLimite = new TempsLimite([joueurTest]);
    const faussePaireMatriceTableau: [number[], Vec2[][]] = [
        [1, 2, 3],
        [
            [
                { x: 2, y: 4 },
                { x: 2, y: 4 },
            ],
            [
                { x: 2, y: 4 },
                { x: 2, y: 4 },
            ],
        ],
    ];
    const fauxRegroupement: Vec2[][] = [
        [
            { x: 2, y: 4 },
            { x: 2, y: 4 },
        ],
        [
            { x: 2, y: 4 },
            { x: 2, y: 4 },
        ],
    ];
    const fauxJoueur1 = {
        nom: 'j1',
        estHote: true,
        idSalle: 'Salle_0',
        idJeu: 0,
        adversaire: 'j2',
        estSolo: false,
    };
    const fauxJoueur2 = {
        nom: 'j2',
        estHote: true,
        idSalle: 'Salle_0',
        idJeu: 0,
        adversaire: 'j5',
        estSolo: false,
    };
    const listeFauxJoueurs = [fauxJoueur1, fauxJoueur2];
    const fauxJeu: InterfaceJeux = {
        id: 0,
        nom: 'Les ballons',
        meilleursTempsSolo: [],
        meilleursTemps1v1: [],
        imgOriginale: '',
        imgModifiee: '',
        nombreDifferences: 3,
    };

    beforeEach(() => {
        tempsLimite['jeu'] = undefined;
        tempsLimite['joueurGagnant'] = undefined;
        tempsLimite['joueurs'] = [];
        tempsLimite['tableauRegroupements'] = undefined;
        tempsLimite['nomsJeuxJoues'] = [];
    });

    it('should be defined', () => {
        expect(tempsLimite).toBeDefined();
    });

    it('assignerJeu devrait assigner un jeu', () => {
        tempsLimite.assignerJeu(fauxJeu, faussePaireMatriceTableau);
        expect(tempsLimite['jeu']).toEqual(fauxJeu);
    });

    it('obtenirRegroupementDiffRestantes devrait retourner tableauRegroup', () => {
        tempsLimite['tableauRegroupements'] = fauxRegroupement;
        expect(tempsLimite['obtenirRegroupementDiffRestantes']()).toBe(fauxRegroupement);
    });

    it('obtenirRegroupementDifferenceAvecCoord devrait retourner null si pas une diff', () => {
        jest.spyOn(tempsLimite as any, 'obtenirIdDifference').mockImplementation(() => {
            return -1;
        });
        expect(tempsLimite['obtenirRegroupementDifferenceAvecCoord']({ x: 1, y: 4 })).toBe(null);
    });

    it('partieEstFinie devrait retourner true si pas de joueur', () => {
        tempsLimite['joueurs'] = [];
        expect(tempsLimite['partieEstFinie']()).toBe(true);
    });

    it('partieEstFinie devrait retourner false si pas de jeux à jouer', () => {
        tempsLimite['joueurs'] = listeFauxJoueurs;
        jest.spyOn(tempsLimite as any, 'jeuDejaJoue').mockImplementation(() => {
            return false;
        });
        expect(tempsLimite['partieEstFinie']([fauxJeu, fauxJeu])).toBe(false);
    });

    it('estMultijoueur devrait retourner true si plus dun joueur', () => {
        tempsLimite['joueurs'] = listeFauxJoueurs;
        expect(tempsLimite['estMultijoueur']()).toBe(true);
    });

    it('abandon devrait retirer un joueur du array de joueurs', () => {
        tempsLimite['joueurs'] = listeFauxJoueurs;
        tempsLimite['abandon'](fauxJoueur1);
        expect(listeFauxJoueurs.length).toBe(tempsLimite['joueurs'].length);
    });

    it('obtenirProchainNomJeu devrait le nom dun jeu pas joue', () => {
        jest.spyOn(Math, 'floor').mockImplementation(() => {
            return 0;
        });
        jest.spyOn(tempsLimite as any, 'jeuDejaJoue').mockImplementation(() => {
            return false;
        });
        tempsLimite['nomsJeuxJoues'] = [];
        expect(tempsLimite['obtenirProchainNomJeu']([fauxJeu])).toBe(fauxJeu.nom);
    });

    it('obtenirJoueurGagnant devrait retourner null', () => {
        expect(tempsLimite['obtenirJoueurGagnant']()).toBe(null);
    });
});
