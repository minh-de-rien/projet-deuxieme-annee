import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DialogAjouteNomJoueurComponent, DonneeDialogue } from '@app/components/dialog-ajoute-nom-joueur/dialog-ajoute-nom-joueur.component';
import { AudioService } from '@app/services/audio/audio.service';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { LONGUEUR_MIN_NOM_JOUEUR, ModesJeu, NB_SECONDE_DANS_UNE_MINUTE } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-fiche-jeu',
    templateUrl: './fiche-jeu.component.html',
    styleUrls: ['./fiche-jeu.component.scss'],
})
export class FicheJeuComponent implements OnInit {
    @Input() jeu: InterfaceJeux;
    @Input() isAdministration: boolean;
    @Output() rechargerPage = new EventEmitter<number>();
    @ViewChild('boutonCreer', { static: false }) private boutonCreer: ElementRef;
    dialogRef: MatDialogRef<DialogAjouteNomJoueurComponent>;
    estActive = false;
    lienImageOriginale: SafeResourceUrl = ''; // public car utilisé dans le html

    // eslint-disable-next-line max-params -- On a besoin des 5 paramètres
    constructor(
        private readonly diffusionJoueurService: DiffusionJoueurService,
        private readonly socketService: GestionSocketClientService,
        private readonly router: Router,
        private dialog: MatDialog,
        readonly audioService: AudioService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        if (this.jeu) this.lienImageOriginale = this.transformer();
        this.fermerBoiteDialogueSiOuverture();
    }
    transformer() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.jeu.imgOriginale);
    }
    ouvrirBoiteDialogue(estPartieSolo: boolean): void {
        this.dialogRef = this.dialog.open(DialogAjouteNomJoueurComponent, {
            data: {
                salutation: 'Bonjour',
                nomJoueur: '',
            },
        });
        this.estActive = true;

        this.dialogRef.afterClosed().subscribe((result: DonneeDialogue) => {
            if (result) {
                if (result.nomJoueur.length < LONGUEUR_MIN_NOM_JOUEUR) {
                    window.alert('Veuillez entrer un nom pour pouvoir démarrer une partie');
                    return;
                }
                const joueur: Joueur = {
                    nom: result.nomJoueur,
                    estHote: null,
                    idSalle: '',
                    idJeu: this.jeu.id,
                    adversaire: '',
                    modeJeu: ModesJeu.Classique,
                };
                if (this.jeu.aCree && this.boutonCreer) {
                    window.location.reload();
                } else {
                    if (estPartieSolo) this.lancerPartieSolo(joueur);
                    else this.gererCreationPartie1v1(this.jeu.aCree as boolean, joueur);
                }
            }
        });
    }

    supprimerJeu() {
        this.socketService.send(SocketEvenements.AnnonceSuppressionJeu, this.jeu.id);
    }

    reinitialiserScore() {
        this.socketService.send(SocketEvenements.AnnonceReinitialisationScore, this.jeu.nom);
    }

    convertirSecondesEnMinutesSeconde(nbSecondes: number): string {
        const minute: number = Math.floor(nbSecondes / NB_SECONDE_DANS_UNE_MINUTE);
        const seconde: number = nbSecondes - NB_SECONDE_DANS_UNE_MINUTE * minute;
        return minute.toString() + ':' + this.miseEnformeSeconde(seconde);
    }
    miseEnformeSeconde(seconde: number) {
        return seconde.toString().length > 1 ? seconde.toString() : '0' + seconde.toString();
    }
    private navigationSalleAttenteHote(joueur: Joueur) {
        this.attendreAttributionSalle(joueur);
        this.socketService.send(SocketEvenements.CreerSalle, joueur);
    }

    private navigationSalleAttenteInvite(joueur: Joueur) {
        this.diffusionJoueurService.definirJoueur(joueur);
        this.socketService.send(SocketEvenements.RejoindreSalle, joueur);
    }

    private lancerPartieSolo(joueur: Joueur) {
        joueur.estSolo = true;
        this.attendreAttributionSalle(joueur);
        this.socketService.send(SocketEvenements.CreerSalle, joueur);
    }

    private gererCreationPartie1v1(jeuEstCree: boolean, joueur: Joueur) {
        if (!jeuEstCree) {
            joueur.estHote = true;
            this.navigationSalleAttenteHote(joueur);
        } else {
            joueur.estHote = false;
            joueur.idSalle = this.jeu.idSalle as string;
            this.navigationSalleAttenteInvite(joueur);
        }
    }
    private attendreAttributionSalle(joueur: Joueur): void {
        this.socketService.once(SocketEvenements.SalleId, (idSalle: string) => {
            joueur.idSalle = idSalle;
            this.diffusionJoueurService.definirJoueur(joueur);
            if (joueur.estSolo) {
                this.router.navigate(['/game']);
            } else {
                this.router.navigate(['/creer-partie']);
            }
        });
    }

    private fermerBoiteDialogueSiOuverture() {
        this.socketService.on(SocketEvenements.Jeux, () => {
            if (this.estActive) this.dialogRef.close();
        });
    }
}
