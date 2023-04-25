import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DiffusionJeuService } from '@app/services/diffusion-jeu/diffusion-jeu.service';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { StatutPartie } from '@common/enum/statut-partie';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { ReponseStatutPartie } from '@common/interface/reponse-statut-partie';

@Component({
    selector: 'app-salle-temps-limite',
    templateUrl: './salle-temps-limite.component.html',
    styleUrls: ['./salle-temps-limite.component.scss'],
})
export class SalleTempsLimiteComponent implements OnInit {
    joueur: Joueur;
    // eslint-disable-next-line max-params
    constructor(
        private readonly socketService: GestionSocketClientService,
        private readonly router: Router,
        private diffusionJeuService: DiffusionJeuService,
        private diffusionJoueurService: DiffusionJoueurService,
        private readonly salleAttenteService: GestionSalleAttenteService,
    ) {}

    ngOnInit(): void {
        this.attentreStatutPartie();
        this.diffusionJoueurService.joueur.subscribe((joueur: Joueur) => {
            this.joueur = joueur;
        });
        this.salleAttenteService.abonnerASocketInvalide();
    }
    quitterSalleAttente(): void {
        this.socketService.send(SocketEvenements.QuitterSalle, this.joueur);
        this.router.navigate(['/home']);
    }

    private attentreStatutPartie() {
        this.socketService.on(SocketEvenements.StatutPartie, (reponse: ReponseStatutPartie) => {
            if (reponse.statutPartie === StatutPartie.PartiePreteAuLancement) {
                if (reponse.joueurs) this.joueur.adversaire = reponse.joueurs[1].nom;
                this.diffusionJeuService.definirJeu(reponse.jeu as InterfaceJeux);
                this.router.navigate(['/game']);
            }
        });
    }
}
