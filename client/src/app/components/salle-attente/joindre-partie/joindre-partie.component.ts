import { Component, OnInit, HostListener } from '@angular/core';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Joueur } from '@common/interface/joueur';
import { DELAI_AVANT_RETOUR, INDEX_JOUEUR_HOTE, INDEX_JOUEUR_INVITE } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-joindre-partie',
    templateUrl: './joindre-partie.component.html',
    styleUrls: ['./joindre-partie.component.scss'],
})
export class JoindrePartieComponent implements OnInit {
    /* Attributs public car utilisés dans le html*/
    aRejete: boolean = false;
    nomHote: string = '';

    constructor(private socketService: GestionSocketClientService, readonly salleAttenteService: GestionSalleAttenteService) {}
    @HostListener('window:hashchange')
    gestionChangementHash(): void {
        window.location.reload();
    }
    ngOnInit() {
        this.salleAttenteService.abonnerADiffusionJoueur();
        this.abonnerAuSocketRejeteDeLaSalle();
        this.abonnerAuSocketHoteAQuitteSalle();
        this.salleAttenteService.abonnerAuSocketLancerPartie(INDEX_JOUEUR_INVITE, INDEX_JOUEUR_HOTE);
        this.salleAttenteService.abonnerAuSocketAnnonceSuppressionSalle();
        this.salleAttenteService.abonnerASocketInvalide();
    }

    private abonnerAuSocketRejeteDeLaSalle(): void {
        this.socketService.on(SocketEvenements.RejeteDeLaSalle, (joueur: Joueur) => {
            this.aRejete = true;
            this.nomHote = joueur.nom;
            this.salleAttenteService.retourArriere(DELAI_AVANT_RETOUR);
        });
    }

    private abonnerAuSocketHoteAQuitteSalle(): void {
        this.socketService.on(SocketEvenements.HoteAQuitteSalle, () => {
            window.alert(MessageAlerte.HoteQuiteSalle);
            this.salleAttenteService.retourArriere(DELAI_AVANT_RETOUR);
        });
    }
}
