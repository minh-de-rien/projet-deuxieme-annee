/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { joueurTest } from '@common/constantes/constantes-test';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { Classique } from './classique';

describe('Classique', () => {
    const classique = new Classique([joueurTest]);

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

    const fauxRegroupement = new Map<number, Vec2[]>();
    fauxRegroupement.set(3, [{ x: 2, y: 4 }]);

    const fauxNbrDiffTrouveesJoueurs = new Map<string, number>();
    fauxNbrDiffTrouveesJoueurs.set('juju', 3);

    const fauxJeu: InterfaceJeux = {
        id: 0,
        nom: 'Les ballons',
        meilleursTempsSolo: [],
        meilleursTemps1v1: [],
        imgOriginale: '',
        imgModifiee: '',
        nombreDifferences: 3,
    };

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
    beforeEach(() => {
        classique['nbrDiffTrouveesJoueurs'].clear();
        classique['jeu'] = undefined;
        classique['regroupementsDiffsRestantes'].clear();
        classique['joueurGagnant'] = undefined;
        classique['joueurs'] = [];
        classique['tableauRegroupements'] = undefined;
    });

    it('devrait etre defini', () => {
        expect(classique).toBeDefined();
    });

    it('assignerJeu devrait assigner un jeu dans les bons attribs', () => {
        classique.assignerJeu(fauxJeu, faussePaireMatriceTableau);
        expect(classique['jeu']).toEqual(fauxJeu);
    });

    it('obtenirRegroupementDiffRestantes devrait retourner les diffs restantes', () => {
        classique['regroupementsDiffsRestantes'] = fauxRegroupement;
        const regroup = classique.obtenirRegroupementDiffRestantes();
        expect(Array.from(classique['regroupementsDiffsRestantes']).values).toEqual(Array.from(regroup).values);
    });

    it('obtenirRegroupementDifferenceAvecCoord devrait retourner un regroup de diff si diff', () => {
        jest.spyOn(classique as any, 'obtenirIdDifference').mockImplementation(() => {
            return 1;
        });
        jest.spyOn(classique as any, 'diffDejaTrouvee').mockImplementation(() => {
            return false;
        });
        classique['tableauRegroupements'] = [
            [
                { x: 2, y: 4 },
                { x: 3, y: 8 },
            ],
            [{ x: 2, y: 4 }],
        ];
        expect(classique['obtenirRegroupementDifferenceAvecCoord']({ x: 2, y: 4 }, fauxJoueur1)).toStrictEqual([{ x: 2, y: 4 }]);
    });

    it('obtenirRegroupementDifferenceAvecCoord devrait retourner null si pas une diff', () => {
        jest.spyOn(classique as any, 'obtenirIdDifference').mockImplementation(() => {
            return -1;
        });
        expect(classique['obtenirRegroupementDifferenceAvecCoord']({ x: 1, y: 4 }, fauxJoueur1)).toBe(null);
    });

    it('estMultijoueur devrait retourner false si moins dun joueur', () => {
        classique['nbrDiffTrouveesJoueurs'] = fauxNbrDiffTrouveesJoueurs;
        const estMulti: boolean = classique.estMultijoueur();
        expect(estMulti).toBe(false);
    });

    it('estMultijoueur devrait retourner false si moins dun joueur', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        fauxNbrDiffTrouveesJoueurs.set('bozo', 6);
        classique['nbrDiffTrouveesJoueurs'] = fauxNbrDiffTrouveesJoueurs;
        const estMulti: boolean = classique.estMultijoueur();
        expect(estMulti).toBe(false);
    });

    it('obtenirProchainNomJeu devrait retourner null', () => {
        expect(classique.obtenirProchainNomJeu()).toBe(null);
    });

    it('obtenirJoueurGagnant devrait retourner le joueur gagnant', () => {
        classique['joueurGagnant'] = fauxJoueur1;
        expect(classique.obtenirJoueurGagnant()).toEqual(fauxJoueur1);
    });

    it('obtenirJoueurAvecNom devrait retourner un joueur', () => {
        classique['obtenirJoueurAvecNom'](listeFauxJoueurs[0].nom);
        classique['joueurs'] = listeFauxJoueurs;
        expect(classique['obtenirJoueurAvecNom'](listeFauxJoueurs[0].nom)).toBe(listeFauxJoueurs[0]);
    });

    it('diffDejaTrouvee devrait retourner false si diff pas trouvee', () => {
        classique['regroupementsDiffsRestantes'].set(0, [
            { x: 2, y: 4 },
            { x: 1, y: 4 },
        ]);
        const diffTrouvee: boolean = classique['diffDejaTrouvee'](0);
        expect(diffTrouvee).toBeFalsy();
    });

    it('incrementerDiffsTrouveesJoueur devrait incrementer le nb de diff au bon joueur', () => {
        const nbDiffTrouvees = 2;
        classique['nbrDiffTrouveesJoueurs'].set('j1', nbDiffTrouvees);
        classique['incrementerDiffsTrouveesJoueur'](fauxJoueur1);
        expect(classique['nbrDiffTrouveesJoueurs'].get('j1')).toBe(nbDiffTrouvees + 1);
    });

    it('abandonner devrait retirer un joueur de la partie', () => {
        classique['nbrDiffTrouveesJoueurs'].set('j1', 1);
        classique['nbrDiffTrouveesJoueurs'].set('j2', 2);
        classique.abandon(fauxJoueur1);
        expect(Array.from(classique['nbrDiffTrouveesJoueurs']).length).toBe(1);
    });

    it('partieEstFinie devrait retourner true sil y a juste un joueur', () => {
        jest.spyOn(classique as any, 'estMultijoueur').mockImplementation(() => {
            return false;
        });
        classique['joueurs'] = listeFauxJoueurs;

        const estFinie: boolean = classique.partieEstFinie();
        expect(estFinie).toBe(true);
    });

    it('partieEstFinie devrait retourner true si qqn gagne', () => {
        classique['nbrDiffTrouveesJoueurs'].set('j1', 1);
        classique['nbrDiffTrouveesJoueurs'].set('j2', 0);
        jest.spyOn(classique as any, 'estMultijoueur').mockImplementation(() => {
            return true;
        });
        classique['tableauRegroupements'] = [[{ x: 1, y: 2 }]];
        const estFinie: boolean = classique.partieEstFinie();
        expect(estFinie).toBe(true);
    });
});
