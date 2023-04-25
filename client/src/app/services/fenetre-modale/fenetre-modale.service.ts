import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssistantModale } from '@app/classes/assistant-fenetre-modale/assistant-fenetre-modale';
import { MessageModale } from '@common/enum/message-modale';
import { ModaleConfig } from '@common/interface/configuration-modale';

@Injectable({
    providedIn: 'root',
})
export class FenetreModaleService {
    private assistantModale: AssistantModale;

    constructor(readonly matDialog: MatDialog) {
        this.assistantModale = new AssistantModale(matDialog);
    }

    ouvrirModaleAnnonce(nom: string, titre: string, description?: string): void {
        const donneeModale: ModaleConfig = {
            nom,
            titre,
            description,
            boutonActionTexte: MessageModale.BoutonActionTexteQuitter,
            necessiteBoutonRetour: false,
        };
        this.assistantModale.ouvrirModale(donneeModale);
    }
}
