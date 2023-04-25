import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { MessageModale } from '@common/enum/message-modale';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { ModaleConfig } from '@common/interface/configuration-modale';
import { DUREE_SNACK_BAR } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class ActionsModaleService {
    constructor(
        private readonly router: Router,
        private readonly socketService: GestionSocketClientService,
        private readonly snackBar: MatSnackBar,
    ) {}

    actionModale(donneeModale: ModaleConfig) {
        switch (donneeModale.nom) {
            case MessageModale.NomSupprimer:
                this.supprimerTousJeux();
                break;

            case MessageModale.NomReinitialiserMeilleursTemps:
                this.reinitialiserMeilleursTemps();
                break;

            case MessageModale.NomReinitialiserConstantesTempsJeux:
                this.reinitialiserConstantesTempsJeux();
                break;

            case MessageModale.NomQuitter:
                this.fermerModale();
                break;

            case MessageModale.NomQuitterAvecReload:
                this.fermerModaleAvecReload();
                break;
            default:
                break;
        }
    }

    private supprimerTousJeux(): void {
        this.socketService.send(SocketEvenements.AnnonceSuppressionTousLesJeux);
        this.ouvrirSnackBar(MessageAlerte.JeuxSupprimes, '');
    }

    private reinitialiserMeilleursTemps(): void {
        this.socketService.send(SocketEvenements.AnnonceReinitialisationTousLesScores);
        this.ouvrirSnackBar(MessageAlerte.MeilleursTempsReinitialises, '');
    }

    private reinitialiserConstantesTempsJeux(): void {
        this.socketService.send(SocketEvenements.MiseAJourConstantesTempsJeux);
        this.ouvrirSnackBar(MessageAlerte.ConstantesTempsJeuxReinitialisees, '');
    }

    private fermerModale(): void {
        this.router.navigate(['/home']);
    }

    private fermerModaleAvecReload(): void {
        this.router.navigate(['/home']).then(() => {
            location.reload();
        });
    }

    private ouvrirSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: DUREE_SNACK_BAR,
        });
    }
}
