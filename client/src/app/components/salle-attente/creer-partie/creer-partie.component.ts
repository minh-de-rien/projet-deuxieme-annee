import { Component, OnInit, HostListener } from '@angular/core';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Joueur } from '@common/interface/joueur';
import { INDEX_JOUEUR_HOTE, INDEX_JOUEUR_INVITE } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-creer-partie',
    templateUrl: './creer-partie.component.html',
    styleUrls: ['./creer-partie.component.scss'],
})
export class CreerPartieComponent implements OnInit {
    /* Les attributs suivant sont publics car utilisés dans le html*/
    nomInvite: string = '';
    aRejoint: boolean = false;
    joueurInvite: Joueur;

    constructor(private readonly socketService: GestionSocketClientService, readonly salleAttenteService: GestionSalleAttenteService) {}

    @HostListener('window:hashchange')
    gestionChangementHash(): void {
        window.location.reload();
    }

    ngOnInit() {
        this.salleAttenteService.abonnerADiffusionJoueur();
        this.abonnerAuSocketDemandeJoindrePartie();
        this.abonnerAuSocketInviteAQuitteSalle();
        this.salleAttenteService.abonnerAuSocketLancerPartie(INDEX_JOUEUR_HOTE, INDEX_JOUEUR_INVITE);
        this.salleAttenteService.abonnerAuSocketAnnonceSuppressionSalle();
        this.salleAttenteService.abonnerASocketInvalide();
    }

    demarrerPartie() {
        this.socketService.send(SocketEvenements.AccepterInvite, [this.salleAttenteService.joueur, this.joueurInvite]);
    }

    rejeterJoueur() {
        this.socketService.send(SocketEvenements.RejeterInvite, this.salleAttenteService.joueur.idSalle);
        this.aRejoint = false;
    }

    private abonnerAuSocketDemandeJoindrePartie(): void {
        this.socketService.on(SocketEvenements.DemandeJoindrePartie, (joueur: Joueur) => {
            this.nomInvite = joueur.nom;
            this.joueurInvite = joueur;
            this.aRejoint = true;
        });
    }

    private abonnerAuSocketInviteAQuitteSalle(): void {
        this.socketService.on(SocketEvenements.InviteAQuitteSalle, () => {
            this.aRejoint = false;
            window.alert('Le joueur   ' + this.nomInvite.toUpperCase() + '   est parti.');
        });
    }
}
