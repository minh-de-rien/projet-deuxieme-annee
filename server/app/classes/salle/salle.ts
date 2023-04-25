import { Joueur } from '@common/interface/joueur';
import { INDEX_JOUEUR_HOTE, INDEX_PAIRE_JOUEUR, INDEX_PAIRE_SOCKET, ModesJeu } from '@common/valeurs-par-defaut';
import { Socket } from 'socket.io';

export class Salle {
    private idSalle: string;
    private modeDeJeu: ModesJeu;
    private pairesJoueurSocket: [Joueur, Socket][];

    constructor(idSalle: string, modeDeJeu: ModesJeu) {
        this.idSalle = idSalle;
        this.modeDeJeu = modeDeJeu;
        this.pairesJoueurSocket = new Array();
    }

    estVide(): boolean {
        return !this.pairesJoueurSocket.length;
    }

    obtenirIdSalle(): string {
        return this.idSalle;
    }

    obtenirModeDeJeu(): ModesJeu {
        return this.modeDeJeu;
    }

    ajouterJoueur(joueur: Joueur, socket: Socket): void {
        joueur.idSalle = this.idSalle;
        socket.join(this.idSalle);
        joueur.estHote = this.estVide();
        this.pairesJoueurSocket.push([joueur, socket]);
    }

    retirerJoueur(joueur: Joueur) {
        joueur.idSalle = null;
        this.trouverSocketAssocieJoueur(joueur).leave(this.idSalle);
        const indexJoueur: number = this.trouverIndexJoueur(joueur);
        if (indexJoueur) {
            this.pairesJoueurSocket.splice(indexJoueur);
        }
    }

    obtenirTousLesJoueurs(): Joueur[] {
        const tableauJoueurs: Joueur[] = new Array();
        this.pairesJoueurSocket.forEach((paireJoueurSocket: [Joueur, Socket]) => {
            tableauJoueurs.push(paireJoueurSocket[INDEX_PAIRE_JOUEUR]);
        });
        return tableauJoueurs;
    }

    retirerTousLesJoueurs() {
        this.pairesJoueurSocket.forEach((paireJoueurSocket: [Joueur, Socket]) => {
            this.retirerJoueur(paireJoueurSocket[INDEX_PAIRE_JOUEUR]);
        });
    }

    trouverIndexJoueur(joueurATrouver: Joueur): number {
        let indexJoueurTrouve: number;
        this.pairesJoueurSocket.forEach((paire: [Joueur, Socket], indexJoueur: number) => {
            if (paire[INDEX_PAIRE_JOUEUR] === joueurATrouver) indexJoueurTrouve = indexJoueur;
        });
        return indexJoueurTrouve;
    }

    trouverJoueurAssocieSocket(socket: Socket): Joueur {
        let joueurTrouve: Joueur;
        this.pairesJoueurSocket.forEach((paire: [Joueur, Socket]) => {
            if (paire[INDEX_PAIRE_SOCKET] === socket) joueurTrouve = paire[INDEX_PAIRE_JOUEUR];
        });
        return joueurTrouve;
    }

    trouverSocketAssocieJoueur(joueur: Joueur): Socket {
        let socketTrouve: Socket;
        this.pairesJoueurSocket.forEach((paire: [Joueur, Socket]) => {
            if (paire[INDEX_PAIRE_JOUEUR].nom === joueur.nom) socketTrouve = paire[INDEX_PAIRE_SOCKET];
        });
        return socketTrouve;
    }

    obtenirJoueurInvite(): Joueur {
        let joueurInvite: Joueur;
        this.pairesJoueurSocket.forEach((paire: [Joueur, Socket]) => {
            if (!paire[INDEX_PAIRE_JOUEUR].estHote) joueurInvite = paire[INDEX_PAIRE_JOUEUR];
        });
        return joueurInvite;
    }

    obtenirIdJeu(): number {
        let idJeu: number;
        this.pairesJoueurSocket.forEach((paire: [Joueur, Socket]) => {
            idJeu = paire[INDEX_PAIRE_JOUEUR].idJeu;
        });
        return idJeu;
    }

    estEnAttenteTempsLimite(): boolean {
        const tableauJoueurs: Joueur[] = this.obtenirTousLesJoueurs();
        return tableauJoueurs.length === 1 && !tableauJoueurs[INDEX_JOUEUR_HOTE].estSolo && this.modeDeJeu === ModesJeu.TempsLimite;
    }
}
