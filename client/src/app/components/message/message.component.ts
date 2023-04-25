import { Component, Input } from '@angular/core';
import { Message } from '@common/interface/message';
import { NOM_DESTINATEUR_SERVEUR } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
    @Input() message: Message;
    @Input() nomJoueurLocal: string;
    nomServeur: string = NOM_DESTINATEUR_SERVEUR;

    verificationIdentite(nomDestinateur: string): boolean {
        return this.message.destinateur.nom === nomDestinateur;
    }

    verificationServeur(): boolean {
        return this.verificationIdentite(NOM_DESTINATEUR_SERVEUR);
    }

    verificationSoi(): boolean {
        return this.verificationIdentite(this.nomJoueurLocal);
    }

    verificationJoueurAutre(): boolean {
        return !this.verificationIdentite(NOM_DESTINATEUR_SERVEUR) && !this.verificationIdentite(this.nomJoueurLocal);
    }

    verificationMessageExiste(): boolean {
        return this.message !== undefined;
    }
}
