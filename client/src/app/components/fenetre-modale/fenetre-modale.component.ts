import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionsModaleService } from '@app/services/actions-fenetre-modale/action-fenetre-modale.service';
import { ModaleConfig } from '@common/interface/configuration-modale';

@Component({
    selector: 'app-fenetre-modale',
    templateUrl: './fenetre-modale.component.html',
    styleUrls: ['./fenetre-modale.component.scss'],
})
export class FenetreModaleComponent {
    /* Attribut public car utilisé dans le html*/
    necessiteBoutonRetour: boolean;

    constructor(
        public dialogRef: MatDialogRef<FenetreModaleComponent>,
        @Inject(MAT_DIALOG_DATA) public donneeModale: ModaleConfig,
        private modaleService: ActionsModaleService,
    ) {
        this.necessiteBoutonRetour = donneeModale.necessiteBoutonRetour;
    }

    actionModale() {
        this.modaleService.actionModale(this.donneeModale);
        this.fermerModale();
    }

    fermerModale() {
        this.dialogRef.close();
    }
}
