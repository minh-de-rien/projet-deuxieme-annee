import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DiffusionJeuService } from '@app/services/diffusion-jeu/diffusion-jeu.service';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { EvenementJeuService } from '@app/services/evenement-jeu/evenement-jeu.service';
import { FenetreModaleService } from '@app/services/fenetre-modale/fenetre-modale.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageFinDePartie } from '@common/enum/message-fin-de-partie';
import { MessageModale } from '@common/enum/message-modale';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { TypeFinPartie } from '@common/enum/type-fin-partie';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { InterfaceScore } from '@common/interface/interface-score';
import { Joueur } from '@common/interface/joueur';
import { ScoreClient } from '@common/interface/score-client';
import { CONSTANTE_IDENTIFICATION_INDICE, INDEX_JOUEUR_HOTE, INDEX_JOUEUR_INVITE, ModesJeu } from '@common/valeurs-par-defaut';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-vue-jeu',
    templateUrl: './vue-jeu.component.html',
    styleUrls: ['./vue-jeu.component.scss'],
})
export class VueJeuComponent implements OnInit, OnDestroy {
    /* Les attributs suivant sont publics car utilisés dans le html*/
    @ViewChild('canvasIndice', { static: false }) private canvasIndice: ElementRef<HTMLCanvasElement>;
    jeu: InterfaceJeux;
    arretHorloge: Subject<void> = new Subject<void>();
    nombreIndicesRestants: number = 3;
    nombreDifferencesTrouvees: number = 0;
    pointageAdversaire: number = 0;
    score: number;
    joueur: Joueur;
    messageDeFinActive: boolean = false;
    tempsDeReferencePourLeCompteur: number = 0;
    valeurDeDepartDuCompteur: number;
    modificationDeTemps: Subject<number> = this.serviceEvenement.obtenirModificationDuCompteurDeTemps();
    estPasDansZoneMessage: boolean = true;
    valeurGainDeTemps: number;
    valeurPenaliteDeTemps: number;

    private abonnementDiffusionJoueur: Subscription;
    private abonnementServiceCommunication: Subscription;
    private abonnementNotifDifferenceTrouvee: Subscription;
    private abonnementTempsDeReference: Subscription;
    private abonnementFinDePartie: Subscription;
    private abonnementConstantesDeTempsDePartie: Subscription;
    private abonnementDiffusionJeu: Subscription;
    private abonnementProchainJeu: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private readonly serviceHttp: CommunicationService,
        private readonly serviceEvenement: EvenementJeuService,
        private readonly serviceModale: FenetreModaleService,
        private router: Router,
        private diffusionJoueurService: DiffusionJoueurService,
        private diffusionJeuService: DiffusionJeuService,
        private serviceSocket: GestionSocketClientService,
    ) {}

    @HostListener('window:keydown.t')
    modeTriche(): void {
        if (!this.messageDeFinActive && this.estPasDansZoneMessage) {
            this.serviceEvenement.gererModeTriche();
        }
    }

    @HostListener('window:keydown.i')
    demandeIndice(): void {
        if (this.demandeIndiceEstValide()) {
            this.serviceEvenement.demandeIndice(
                this.identifierIndiceCourant(),
                this.canvasIndice.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            );
            this.nombreIndicesRestants--;
            this.serviceSocket.send(SocketEvenements.IndiceUtilise);
        }
    }

    @HostListener('window:hashchange')
    gestionChangementHash(): void {
        window.location.hash = '/home';
        this.abandonner();
    }

    ngOnInit(): void {
        this.abonnerAuServiceDiffusionJoueur();
        this.abonnerAuServiceEvenementDeNotifDifferenceTrouvee();
        this.abonnerASocketInvalide();
        this.abonnerALaFinDePartie();
    }

    ngOnDestroy(): void {
        this.serviceEvenement.tricheActif = false;
        if (this.abonnementServiceCommunication) this.abonnementServiceCommunication.unsubscribe();
        if (this.abonnementDiffusionJoueur) this.abonnementDiffusionJoueur.unsubscribe();
        if (this.abonnementNotifDifferenceTrouvee) this.abonnementNotifDifferenceTrouvee.unsubscribe();
        if (this.abonnementTempsDeReference) this.abonnementTempsDeReference.unsubscribe();
        if (this.abonnementFinDePartie) this.abonnementFinDePartie.unsubscribe();
        if (this.abonnementDiffusionJeu) this.abonnementDiffusionJeu.unsubscribe();
        if (this.abonnementConstantesDeTempsDePartie) this.abonnementConstantesDeTempsDePartie.unsubscribe();
        if (this.abonnementProchainJeu) this.abonnementProchainJeu.unsubscribe();
    }

    estModeClassique(): boolean {
        return this.joueur.modeJeu === ModesJeu.Classique;
    }

    abandonner(): void {
        this.serviceEvenement.forcerDesactivationModeTriche();
        this.serviceEvenement.abandonner();
        this.router.navigate(['/home']);
    }

    miseAJourScore(tempsEcoule: number) {
        this.score = tempsEcoule;
    }

    defaiteTempsLimite(): void {
        this.serviceEvenement.annonceTempsEcoule();
        this.finDePartie(MessageFinDePartie.VousAvezPerdu, MessageFinDePartie.CompteAReboursEpuise);
    }

    private abonnerAuServiceDiffusionJoueur(): void {
        this.abonnementDiffusionJoueur = this.diffusionJoueurService.joueur.subscribe((joueur: Joueur) => {
            this.joueur = joueur;
            this.serviceEvenement.etablirJoueur(joueur);
            this.demanderValeursInitialisationHorlogeAuServeur();
            if (joueur.modeJeu === ModesJeu.Classique) this.traiterAbonnementAuServiceCommunication(joueur.idJeu as number);
            else if (joueur.modeJeu === ModesJeu.TempsLimite) this.gererAbonnementTempsLimite();
        });
    }

    private traiterAbonnementAuServiceCommunication(idJeu: number): void {
        this.abonnementServiceCommunication = this.serviceHttp.obtenirJeu(idJeu).subscribe((contenu) => {
            this.jeu = contenu;
        });
    }
    private gererAbonnementTempsLimite(): void {
        this.abonnerAuServiceDeDiffusionJeu();
        this.serviceEvenement.abonnerReceptionDuProchainJeu();
        this.abonnementProchainJeu = this.serviceEvenement.obtenirProchainJeu().subscribe((jeu: InterfaceJeux) => {
            this.jeu = jeu;
        });
    }

    private abonnerAuServiceDeDiffusionJeu(): void {
        this.abonnementDiffusionJeu = this.diffusionJeuService.jeu.subscribe((jeu: InterfaceJeux) => {
            this.jeu = jeu;
        });
    }

    private abonnerAuServiceEvenementDeNotifDifferenceTrouvee(): void {
        this.abonnementNotifDifferenceTrouvee = this.serviceEvenement.obtenirNouvelleDifferenceTrouvee().subscribe((indexJoueur: number) => {
            if (this.verifierCorrespondanceIndex(indexJoueur)) this.nombreDifferencesTrouvees += 1;
            else this.pointageAdversaire += 1;
        });
    }

    private finDePartie(titre: string, description?: string): void {
        this.serviceEvenement.forcerDesactivationModeTriche();
        this.messageDeFinActive = true;
        this.serviceModale.ouvrirModaleAnnonce(MessageModale.NomQuitter, titre, description);
    }

    private verifierCorrespondanceIndex(indexJoueur: number): boolean {
        if (this.joueur.estSolo || this.joueur.estHote) {
            return indexJoueur === INDEX_JOUEUR_HOTE;
        }
        return indexJoueur === INDEX_JOUEUR_INVITE;
    }

    private abonnerASocketInvalide(): void {
        this.serviceSocket.send(SocketEvenements.VerifierSocket);
        this.serviceSocket.on(SocketEvenements.SocketInvalide, () => {
            this.router.navigate(['/home']);
        });
    }

    private demandeIndiceEstValide(): boolean {
        return (!this.messageDeFinActive && this.joueur.estSolo && this.nombreIndicesRestants) as boolean;
    }

    private identifierIndiceCourant(): number {
        return Math.abs(this.nombreIndicesRestants - CONSTANTE_IDENTIFICATION_INDICE);
    }

    private demanderValeursInitialisationHorlogeAuServeur(): void {
        this.demanderTempsDeReferenceDePartieAuServeur();
        this.demanderConstantesDeTempsDePartieAuServeur();
    }

    private demanderTempsDeReferenceDePartieAuServeur(): void {
        this.abonnementTempsDeReference = this.serviceHttp
            .obtenirTempsDeReferenceDePartie(this.joueur.idSalle as string)
            .subscribe((tempsReference: number) => {
                this.tempsDeReferencePourLeCompteur = tempsReference;
            });
    }

    private demanderConstantesDeTempsDePartieAuServeur(): void {
        this.abonnementConstantesDeTempsDePartie = this.serviceHttp
            .obtenirConstantesDeTempsDePartie(this.joueur.idSalle as string)
            .subscribe((constantes: ConstantesTempsJeux) => {
                this.valeurGainDeTemps = constantes.gain;
                this.valeurPenaliteDeTemps = constantes.penalite;
                this.valeurDeDepartDuCompteur = constantes.compteARebours;
                this.serviceEvenement.etablirGainDeTemps(constantes.gain);
                this.serviceEvenement.etablirPenaliteDeTemps(constantes.penalite);
            });
    }

    private abonnerALaFinDePartie(): void {
        this.abonnementFinDePartie = this.serviceEvenement.obtenirFinDePartie().subscribe((raison: TypeFinPartie) => {
            switch (raison) {
                case TypeFinPartie.Abandon:
                    this.gererAbandon();
                    break;
                case TypeFinPartie.Victoire:
                    this.gererVictoire();
                    break;
                case TypeFinPartie.Defaite:
                    this.arretHorloge.next();
                    this.finDePartie(MessageFinDePartie.Dommage, this.joueur.adversaire + ' est le vainqueur.');
                    break;
            }
        });
    }

    private gererAbandon(): void {
        if (this.joueur.modeJeu === ModesJeu.Classique) {
            this.arretHorloge.next();
            this.finDePartie(MessageFinDePartie.VousAvezGagneCarAbandon);
        } else {
            this.joueur.estSolo = true;
        }
    }

    private gererVictoire(): void {
        if (this.joueur.modeJeu === ModesJeu.Classique) {
            const score: InterfaceScore = {
                nomJoueur: this.joueur.nom,
                temps: this.score,
            };
            const scorePartie: ScoreClient = {
                nomJeu: this.jeu.nom,
                estSolo: this.joueur.estSolo as boolean,
                nouveauScore: score,
            };
            this.serviceSocket.send(SocketEvenements.NouveauScore, scorePartie);
        }
        this.arretHorloge.next();
        if (this.joueur.estSolo) this.finDePartie(MessageFinDePartie.Felicitations);
        else if (this.joueur.modeJeu === ModesJeu.Classique) this.finDePartie(MessageFinDePartie.Bravo, MessageFinDePartie.VousAvezGagne);
        else this.finDePartie(MessageFinDePartie.Bravo, MessageFinDePartie.VousAvezReussi);
    }
}
