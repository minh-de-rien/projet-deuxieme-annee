import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio/audio.service';
import { DiffusionJeuService } from '@app/services/diffusion-jeu/diffusion-jeu.service';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { FenetreModaleService } from '@app/services/fenetre-modale/fenetre-modale.service';
import { GestionDialogueNomJoueurService } from '@app/services/gestion-dialogue-nom-joueur/gestion-dialogue-nom-joueur.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageModale } from '@common/enum/message-modale';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { StatutPartie } from '@common/enum/statut-partie';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { ReponseStatutPartie } from '@common/interface/reponse-statut-partie';
import { ModesJeu } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-mode-temps-limite',
    templateUrl: './mode-temps-limite.component.html',
    styleUrls: ['./mode-temps-limite.component.scss'],
})
export class ModeTempsLimiteComponent implements OnInit {
    private joueur: Joueur = {
        nom: '',
        modeJeu: ModesJeu.TempsLimite,
    };

    // eslint-disable-next-line max-params
    constructor(
        private readonly dialogueNomJoueurService: GestionDialogueNomJoueurService,
        private readonly diffusionJoueurService: DiffusionJoueurService,
        private readonly router: Router,
        private readonly socketService: GestionSocketClientService,
        private readonly serviceModale: FenetreModaleService,
        private diffusionJeuService: DiffusionJeuService,
        readonly audioService: AudioService,
    ) {}

    ngOnInit(): void {
        this.attentreStatutPartie();
    }

    demanderNomJoueur(estSolo: boolean): void {
        this.dialogueNomJoueurService.obtenirNomJoueur().subscribe((nomJoueur) => {
            this.joueur.nom = nomJoueur;
            this.lancerJeu(estSolo);
        });
        this.dialogueNomJoueurService.ouvrirBoiteDialogue();
    }

    lancerJeu(estSolo: boolean): void {
        this.joueur.estSolo = estSolo;
        this.socketService.send(SocketEvenements.CreerOuRejoindreTempsLimite, this.joueur);
    }

    private attentreStatutPartie(): void {
        this.socketService.on(SocketEvenements.StatutPartie, (reponse: ReponseStatutPartie) => {
            if (reponse.statutPartie === StatutPartie.AucunJeuDisponible) {
                this.serviceModale.ouvrirModaleAnnonce(
                    MessageModale.NomQuitterAvecReload,
                    MessageModale.TitreAucunJeu,
                    MessageModale.DescriptionActionTexteAucunJeu,
                );
                return;
            }
            this.joueur.idSalle = reponse.salleId;
            this.diffusionJoueurService.definirJoueur(this.joueur);

            if (reponse.statutPartie === StatutPartie.AttenteDeuxiemeJoueur) this.router.navigate(['/salle-temps-limite']);
            else {
                this.diffusionJeuService.definirJeu(reponse.jeu as InterfaceJeux);
                this.router.navigate(['/game']);
            }
        });
    }
}
