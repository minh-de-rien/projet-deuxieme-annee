import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAjouteNomJoueurComponent, DonneeDialogue } from '@app/components/dialog-ajoute-nom-joueur/dialog-ajoute-nom-joueur.component';
import { LONGUEUR_MIN_NOM_JOUEUR } from '@common/valeurs-par-defaut';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GestionDialogueNomJoueurService {
    private nomJoueur: Subject<string> = new Subject<string>();

    constructor(private readonly dialog: MatDialog) {}

    obtenirNomJoueur(): Subject<string> {
        return this.nomJoueur;
    }

    ouvrirBoiteDialogue(): void {
        const dialogueRef = this.dialog.open(DialogAjouteNomJoueurComponent, {
            data: {
                nomJoueur: '',
            },
        });

        this.gererEnvoieNomJoueur(dialogueRef);
    }

    private gererEnvoieNomJoueur(dialogueRef: MatDialogRef<DialogAjouteNomJoueurComponent>): void {
        dialogueRef.afterClosed().subscribe((resultat: DonneeDialogue) => {
            if (resultat) {
                if (resultat.nomJoueur.length < LONGUEUR_MIN_NOM_JOUEUR) {
                    window.alert('Veuillez entrer un nom pour pouvoir démarrer une partie');
                    return;
                }
                this.nomJoueur.next(resultat.nomJoueur);
            }
        });
    }
}
