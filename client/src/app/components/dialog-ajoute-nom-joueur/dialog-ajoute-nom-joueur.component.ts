import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DonneeDialogue {
    nomJoueur: string;
}

@Component({
    selector: 'app-dialog-ajoute-nom-joueur',
    templateUrl: './dialog-ajoute-nom-joueur.component.html',
    styleUrls: ['./dialog-ajoute-nom-joueur.component.scss'],
})
export class DialogAjouteNomJoueurComponent {
    constructor(public dialogRef: MatDialogRef<DialogAjouteNomJoueurComponent>, @Inject(MAT_DIALOG_DATA) public donnee: DonneeDialogue) {}
}
