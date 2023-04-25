import { Component } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { AssistantModale } from '@app/classes/assistant-fenetre-modale/assistant-fenetre-modale';
import { ChampConstantesJeuComponent } from '@app/components/support/champ-constantes-jeu/champ-constantes-jeu.component';
import { AudioService } from '@app/services/audio/audio.service';
import { DONNEE_MODALE_REINITIALISER, DONNEE_MODALE_SUPPRIMER } from '@common/constantes/constantes-modale';

@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.scss'],
})
export class AdministrationComponent {
    private assistantModale: AssistantModale;

    constructor(private readonly champBasFenetre: MatBottomSheet, readonly matDialog: MatDialog, readonly audioService: AudioService) {
        this.assistantModale = new AssistantModale(matDialog);
    }

    ouvrirChampBasFenetre(): void {
        this.champBasFenetre.open(ChampConstantesJeuComponent);
    }

    ouvrirModaleSupprimerJeux(): void {
        this.assistantModale.ouvrirModale(DONNEE_MODALE_SUPPRIMER);
    }

    ouvrirModaleReinitialiserTemps(): void {
        this.assistantModale.ouvrirModale(DONNEE_MODALE_REINITIALISER);
    }
}
