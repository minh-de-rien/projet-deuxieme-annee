/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModesJeu } from '@common/valeurs-par-defaut';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { Salle } from './salle';

describe('Salle', () => {
    const idSalle = 'Salle_0';
    const modeJeu = ModesJeu.Classique;
    const salle = new Salle(idSalle, modeJeu);
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
        estHote: false,
        idSalle: 'Salle_0',
        idJeu: 0,
        adversaire: 'j5',
        estSolo: false,
    };
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(() => {
        socket = createStubInstance<Socket>(Socket);
        salle['pairesJoueurSocket'] = [];
        salle['idSalle'] = '';
        salle['modeDeJeu'] = undefined;
    });

    it('should be defined', () => {
        expect(salle).toBeDefined();
    });

    it('estVide devrait retourner true si pas de joueur', () => {
        salle['pairesJoueurSocket'] = [];
        expect(salle['estVide']()).toBe(true);
    });

    it('obtenirIdSalle devrait retourner le id de la salle', () => {
        salle['idSalle'] = idSalle;
        expect(salle['obtenirIdSalle']()).toBe(idSalle);
    });

    it('obtenirModeDeJeu devrait retourner le mode de jeu', () => {
        salle['modeDeJeu'] = modeJeu;
        expect(salle['obtenirModeDeJeu']()).toBe(modeJeu);
    });

    it('ajouterJoueur devrait ajouter un joueur', () => {
        const spy = jest.spyOn(salle as any, 'estVide').mockImplementation(() => {
            return true;
        });
        salle['ajouterJoueur'](fauxJoueur1, socket);
        expect(spy).toBeCalled();
    });

    it('retirerJoueur devrait enlever un joueur', () => {
        const spy = jest.spyOn(salle as any, 'trouverSocketAssocieJoueur').mockImplementation(() => {
            return socket;
        });
        const spy2 = jest.spyOn(salle as any, 'trouverIndexJoueur').mockImplementation(() => {
            return 1;
        });
        salle['retirerJoueur'](fauxJoueur1);
        expect(spy).toBeCalled();
        expect(spy2).toBeCalled();
    });

    it('obtenirTousLesJoueurs devrait retourner un tableau de joueurs', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        const tailleSalle = salle['obtenirTousLesJoueurs']().length;
        expect(tailleSalle).toBe(2);
    });

    it('retirerTousLesJoueurs devrait devrait retirer tous les joueurs', () => {
        const spy = jest.spyOn(salle, 'retirerJoueur').mockImplementation();
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        salle['retirerTousLesJoueurs']();
        expect(spy).toBeCalled();
    });

    it('trouverIndexJoueur devrait retourner index du joueur', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        expect(salle['trouverIndexJoueur'](fauxJoueur2)).toBe(1);
    });

    it('trouverJoueurAssocieSocket devrait retourner un socket', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        expect(salle['trouverJoueurAssocieSocket'](socket)).toBe(fauxJoueur2);
    });

    it('trouverSocketAssocieJoueur devrait retourner un joueur', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        const socketObtenu = salle['trouverSocketAssocieJoueur'](fauxJoueur2);
        expect(socketObtenu).toBe(socket);
    });

    it('obtenirJoueurInvite devrait retourner le joueur invite', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        const joueurInvite = salle['obtenirJoueurInvite']();
        expect(joueurInvite).toBe(fauxJoueur2);
    });

    it('obtenirJeuId devrait retourner le id du jeu', () => {
        salle['pairesJoueurSocket'] = [
            [fauxJoueur1, socket],
            [fauxJoueur2, socket],
        ];
        const id = salle['obtenirIdJeu']();
        expect(id).toBe(0);
    });

    it('estEnAttenteTempsLimite devrait retourner false si pas de joueur', () => {
        jest.spyOn(salle, 'obtenirTousLesJoueurs').mockImplementation(() => {
            return [];
        });
        const attente = salle['estEnAttenteTempsLimite']();
        expect(attente).toBe(false);
    });
});
