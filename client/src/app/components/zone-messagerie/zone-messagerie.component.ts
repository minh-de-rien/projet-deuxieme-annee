import { Component, Input, OnInit } from '@angular/core';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { Joueur } from '@common/interface/joueur';
import { Message } from '@common/interface/message';

@Component({
    selector: 'app-zone-messagerie',
    templateUrl: './zone-messagerie.component.html',
    styleUrls: ['./zone-messagerie.component.scss'],
})
export class ZoneMessagerieComponent implements OnInit {
    @Input() joueur: Joueur;

    // public car utilisé par le html
    messages: Message[];
    texte = '';

    constructor(private readonly serviceSocket: GestionSocketClientService) {}

    ngOnInit() {
        this.messages = [];
        this.serviceSocket.on('message', (messageRecu: Message) => {
            this.messages.unshift(messageRecu);
        });
    }

    envoyerMessage(contenuMessage: string) {
        const nouveauMessage: Message = { destinateur: this.joueur, contenu: contenuMessage };
        this.serviceSocket.send('message', nouveauMessage);
        this.texte = '';
    }
}
