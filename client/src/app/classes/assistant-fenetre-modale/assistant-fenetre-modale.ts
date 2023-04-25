import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FenetreModaleComponent } from '@app/components/fenetre-modale/fenetre-modale.component';
import { ModaleConfig } from '@common/interface/configuration-modale';

@Injectable({
    providedIn: 'root',
})
export class AssistantModale {
    constructor(private readonly matDialog: MatDialog) {}

    ouvrirModale(donnee: ModaleConfig): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.data = donnee;
        this.matDialog.open(FenetreModaleComponent, dialogConfig);
    }
}
