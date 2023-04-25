import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Joueur } from '@common/interface/joueur';
import { DELAI_AVANT_RETOUR } from '@common/valeurs-par-defaut';

@Injectable()
export class GestionSalleAttenteService {
    joueur: Joueur;

    constructor(
        private readonly socketService: GestionSocketClientService,
        private readonly router: Router,
        private readonly diffusionJoueurService: DiffusionJoueurService,
    ) {}

    abonnerAuSocketLancerPartie(indexJoueur: number, indexAdversaire: number): void {
        this.socketService.on(SocketEvenements.LancerPartie, (joueurs: Joueur[]) => {
            const joueur = joueurs[indexJoueur];
            joueur.adversaire = joueurs[indexAdversaire].nom;
            this.diffusionJoueurService.definirJoueur(joueur);
            this.router.navigate(['/game']);
        });
    }
    abonnerAuSocketAnnonceSuppressionSalle(): void {
        this.socketService.on(SocketEvenements.AnnonceSuppressionSalle, () => {
            window.alert(MessageAlerte.JeuSupprimer);
            this.retourArriere(DELAI_AVANT_RETOUR);
        });
    }
    abonnerADiffusionJoueur(): void {
        this.diffusionJoueurService.joueur.subscribe((joueur) => {
            this.joueur = joueur;
        });
    }
    abonnerASocketInvalide(): void {
        this.socketService.send(SocketEvenements.VerifierSocket);
        this.socketService.on(SocketEvenements.SocketInvalide, () => {
            this.router.navigate(['/home']);
        });
    }

    retourArriere(delai: number = 0) {
        this.socketService.send(SocketEvenements.QuitterSalle, this.joueur);
        setTimeout(() => {
            this.router.navigate(['/classique']).then(() => {
                this.reloadPage(window.location);
            });
        }, delai);
    }

    private reloadPage(location: Location) {
        location.reload();
    }
}
