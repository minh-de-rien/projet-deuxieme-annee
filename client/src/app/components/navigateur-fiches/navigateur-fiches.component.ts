import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FenetreModaleService } from '@app/services/fenetre-modale/fenetre-modale.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { MessageModale } from '@common/enum/message-modale';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { NB_JEUX_MAX } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-navigateur-fiches',
    templateUrl: './navigateur-fiches.component.html',
    styleUrls: ['./navigateur-fiches.component.scss'],
})
export class NavigateurFichesComponent implements OnInit {
    @Input() administration: boolean;

    // public car utilisé par le html
    jeuxAffiches: InterfaceJeux[];
    messageErreur: string;
    debutListe: boolean;
    listeFinie: boolean;

    private listeJeuxServeur: InterfaceJeux[];
    private indexPremierJeu: number;

    constructor(
        private readonly socketService: GestionSocketClientService,
        private readonly router: Router,
        private readonly serviceModale: FenetreModaleService,
    ) {}

    ngOnInit(): void {
        this.abonnerAuSocketRecupererListeJeux();
        this.abonnerAuSocketEvenementJeux();
        this.abonnerAuSocketEvenementSalleEstPleine();
    }

    mettreAJourContenu(listeJeuxAJour: InterfaceJeux[]): void {
        this.listeJeuxServeur = listeJeuxAJour;
        this.jeuxAffiches = this.listeJeuxServeur.slice(0, NB_JEUX_MAX);
        this.indexPremierJeu = 0;
        this.debutListe = true;
        this.verifierSiLaListeDeJeuxEstVide();
        this.verifierDepassement(true);
    }

    jeuxSuivants(): void {
        this.changerJeux(true);
    }

    jeuxPrecedents(): void {
        this.changerJeux(false);
    }

    verifierDepassement(droite: boolean): boolean {
        if (droite) {
            this.listeFinie = !(this.listeJeuxServeur.length - this.indexPremierJeu > NB_JEUX_MAX);
            return !this.listeFinie;
        } else {
            this.debutListe = !(this.indexPremierJeu >= NB_JEUX_MAX);
            return !this.debutListe;
        }
    }

    private verifierSiLaListeDeJeuxEstVide(): void {
        if (this.listeJeuxServeur.length === 0 && !this.administration)
            this.serviceModale.ouvrirModaleAnnonce(
                MessageModale.NomQuitterAvecReload,
                MessageModale.TitreAucunJeu,
                MessageModale.DescriptionActionTexteAucunJeu,
            );
    }

    private changerJeux(suivant: boolean): void {
        if (!suivant && this.verifierDepassement(false)) {
            this.indexPremierJeu -= NB_JEUX_MAX;
            this.listeFinie = false;
            this.verifierDepassement(false);
        } else if (suivant && this.verifierDepassement(true)) {
            this.indexPremierJeu += NB_JEUX_MAX;
            this.debutListe = false;
            this.verifierDepassement(true);
        }
        this.jeuxAffiches = this.listeJeuxServeur.slice(this.indexPremierJeu, this.indexPremierJeu + NB_JEUX_MAX);
    }

    private abonnerAuSocketEvenementJeux(): void {
        this.socketService.on(SocketEvenements.Jeux, (jeux: InterfaceJeux[]) => {
            this.mettreAJourContenu(jeux);
        });
    }

    private abonnerAuSocketEvenementSalleEstPleine(): void {
        this.socketService.on(SocketEvenements.SalleEstPleine, (salleEstPleine: boolean) => {
            if (salleEstPleine) {
                window.alert(MessageAlerte.SallePleine);
            } else {
                this.router.navigate(['/joindre-partie']);
            }
        });
    }

    private abonnerAuSocketRecupererListeJeux(): void {
        this.socketService.send(SocketEvenements.RecupererListeJeux);
    }
}
