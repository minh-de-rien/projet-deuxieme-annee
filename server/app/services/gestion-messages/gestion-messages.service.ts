import { MessagesSysteme } from '@common/enum/messages-systeme';
import { Joueur } from '@common/interface/joueur';
import { Message } from '@common/interface/message';
import { NOM_DESTINATEUR_SERVEUR, TAMPON_DE_ZEROS } from '@common/valeurs-par-defaut';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GestionMessagesService {
    creerMessageErreur(joueurErreur: Joueur, multijoueur: boolean): Message {
        return multijoueur
            ? this.constuireMessageServeur(MessagesSysteme.ErreurMulti + joueurErreur.nom)
            : this.constuireMessageServeur(MessagesSysteme.ErreurSolo);
    }

    creerMessageTrouve(joueurTrouve: Joueur, multijoueur: boolean): Message {
        return multijoueur
            ? this.constuireMessageServeur(MessagesSysteme.DiffTrouveeMulti + joueurTrouve.nom)
            : this.constuireMessageServeur(MessagesSysteme.DiffTrouveeSolo);
    }

    creerMessageAbandon(joueurAbandon: Joueur): Message {
        return this.constuireMessageServeur(joueurAbandon.nom + MessagesSysteme.Abandon);
    }

    creerMessageIndice(): Message {
        return this.constuireMessageServeur(MessagesSysteme.IndiceUtilise);
    }

    // On a besoin de tous ces paramètres pour construire le message.
    // eslint-disable-next-line max-params
    creerMessageNouveauMeilleurTemps(nomJoueur: string, position: number, nomJeu: string, estSolo: boolean): Message {
        const modeJeu: string = estSolo ? 'solo' : 'un contre un';
        return this.constuireMessageServeur(`${nomJoueur} obtient la ${position} place dans les meilleurs temps du jeu ${nomJeu} en ${modeJeu}`);
    }

    private obtenirHeureActuelle(): string {
        const heureActuelle = new Date();
        const heureFormatee: string =
            ('0' + heureActuelle.getHours()).slice(TAMPON_DE_ZEROS) +
            ':' +
            ('0' + heureActuelle.getMinutes()).slice(TAMPON_DE_ZEROS) +
            ':' +
            ('0' + heureActuelle.getSeconds()).slice(TAMPON_DE_ZEROS) +
            ' - ';

        return heureFormatee;
    }

    private constuireMessageServeur(contenu: string): Message {
        const serveur: Joueur = { nom: NOM_DESTINATEUR_SERVEUR };
        const message: Message = { contenu: `${this.obtenirHeureActuelle()}${contenu}`, destinateur: serveur };
        return message;
    }
}
