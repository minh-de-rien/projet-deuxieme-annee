import { Injectable } from '@angular/core';
import { AudioService } from '@app/services/audio/audio.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GestionAffichageJeuService } from '@app/services/gestion-affichage-jeu/gestion-affichage-jeu.service';
import { GestionIndicesService } from '@app/services/gestion-indices/gestion-indices.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { TypeFinPartie } from '@common/enum/type-fin-partie';
import { InterfaceCadranIndice } from '@common/interface/interface-cadran-indice';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { InterfaceReponseVerification } from '@common/interface/interface-reponse-verification';
import { Joueur } from '@common/interface/joueur';
import { Vec2 } from '@common/interface/vec2';
import { DELAI_APPARITION_INDICE_SPECIAL, IDENTIFIANT_INDICE_SPECIAL, ModesJeu } from '@common/valeurs-par-defaut';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EvenementJeuService {
    tricheActif: boolean = false;
    private modificationDuCompteurDeTemps: Subject<number> = new Subject<number>();
    private nouvelleDifferenceTrouvee: Subject<number> = new Subject<number>();
    private coordDuClic: Vec2;
    private clicSurCanvasOriginal: boolean;
    private joueur: Joueur;
    private valeurPenaliteDeTemps: number;
    private valeurGainDeTemps: number;

    private finDePartie: Subject<TypeFinPartie> = new Subject<TypeFinPartie>();

    private prochainJeu: Subject<InterfaceJeux> = new Subject<InterfaceJeux>();

    // eslint-disable-next-line max-params
    constructor(
        private readonly gestionAffichageJeuService: GestionAffichageJeuService,
        private audioService: AudioService,
        private socketService: GestionSocketClientService,
        private gestionIndicesService: GestionIndicesService,
        private readonly serviceHttp: CommunicationService,
    ) {
        this.socketService.on(SocketEvenements.ReponseVerificationCoord, (reponse: InterfaceReponseVerification) => {
            if (reponse.difference) {
                this.gestionDifferenceTrouvee(reponse);
            } else this.gestionErreur(this.coordDuClic, this.clicSurCanvasOriginal);
        });

        this.socketService.on(SocketEvenements.AnnonceFinPartie, (raison: TypeFinPartie) => {
            this.finDePartie.next(raison);
        });
    }

    obtenirFinDePartie(): Subject<TypeFinPartie> {
        return this.finDePartie;
    }

    obtenirNouvelleDifferenceTrouvee(): Subject<number> {
        return this.nouvelleDifferenceTrouvee;
    }

    obtenirModificationDuCompteurDeTemps(): Subject<number> {
        return this.modificationDuCompteurDeTemps;
    }
    obtenirProchainJeu(): Subject<InterfaceJeux> {
        return this.prochainJeu;
    }

    etablirJoueur(joueur: Joueur): void {
        this.joueur = joueur;
    }

    etablirGainDeTemps(valeur: number): void {
        this.valeurGainDeTemps = valeur;
    }

    etablirPenaliteDeTemps(valeur: number): void {
        this.valeurPenaliteDeTemps = valeur;
    }

    abonnerReceptionDuProchainJeu(): void {
        this.socketService.on(SocketEvenements.ProchainJeuTempsLimite, (jeu: InterfaceJeux) => {
            this.prochainJeu.next(jeu);
            this.gestionAffichageJeuService.dessinerImage(jeu.imgOriginale, this.gestionAffichageJeuService.contexteImageOriginaleBot);
            this.gestionAffichageJeuService.dessinerImage(jeu.imgModifiee, this.gestionAffichageJeuService.contexteImageModifieeBot);
        });
    }

    verifierCoord(coord: Vec2, estOriginal: boolean): void {
        this.coordDuClic = coord;
        this.clicSurCanvasOriginal = estOriginal;
        this.socketService.send(SocketEvenements.VerificationCoord, coord);
    }

    gererModeTriche(): void {
        this.tricheActif = !this.tricheActif;
        if (this.tricheActif) {
            this.mettreAJourCanvasTriche();
            this.gestionAffichageJeuService.clignotementCanvasTriche();
        } else {
            this.gestionAffichageJeuService.desactivationClignotementTriche();
        }
    }
    forcerDesactivationModeTriche(): void {
        this.gestionAffichageJeuService.desactivationClignotementTriche();
    }
    demandeIndice(identifiant: number, canvasIndiceSpecial: CanvasRenderingContext2D): void {
        this.serviceHttp.obtenirDifferencesRestantes(this.joueur.idSalle as string).subscribe((differences: Vec2[][]) => {
            const difference = differences[Math.floor(Math.random() * differences.length)];
            this.gererIndice(identifiant, difference, canvasIndiceSpecial);
            this.modificationDuCompteurDeTemps.next(this.valeurPenaliteDeTemps);
        });
    }
    abandonner(): void {
        this.socketService.send(SocketEvenements.Abandon);
    }
    annonceTempsEcoule(): void {
        this.socketService.send(SocketEvenements.TempsEcoule);
    }

    private gestionDifferenceTrouvee(reponse: InterfaceReponseVerification): void {
        this.gestionAffichageJeuService.afficherDifferenceTrouvee(reponse.difference as Vec2[]);
        this.audioService.jouerSonValidation();
        this.nouvelleDifferenceTrouvee.next(reponse.indexJoueur);
        if (this.joueur.modeJeu === ModesJeu.TempsLimite) this.modificationDuCompteurDeTemps.next(-this.valeurGainDeTemps);
        else {
            this.mettreAJourCanvasTriche();
        }
    }
    private gestionErreur(coord: Vec2, estOriginal: boolean): void {
        this.gestionAffichageJeuService.afficheErreur(coord, estOriginal);
        this.audioService.jouerSonErreur();
    }
    private mettreAJourCanvasTriche(): void {
        this.serviceHttp.obtenirDifferencesRestantes(this.joueur.idSalle as string).subscribe((differences: Vec2[][]) => {
            this.gestionAffichageJeuService.miseAJourCanvasTriche(differences);
        });
    }
    private gererIndice(identifiantIndice: number, difference: Vec2[], canvasIndiceSpecial: CanvasRenderingContext2D): void {
        if (identifiantIndice === IDENTIFIANT_INDICE_SPECIAL) {
            this.gestionIndicesService.etablirIndiceSpecial(difference, canvasIndiceSpecial);
            this.faireApparaitreIndice(canvasIndiceSpecial);
        } else {
            const cadran: InterfaceCadranIndice = this.gestionIndicesService.etablirIndice(difference, identifiantIndice);
            this.gestionAffichageJeuService.afficherCadranIndice(cadran);
        }
    }
    private faireApparaitreIndice(canvasIndiceSpecial: CanvasRenderingContext2D): void {
        canvasIndiceSpecial.canvas.hidden = false;
        setTimeout(() => {
            canvasIndiceSpecial.canvas.hidden = true;
        }, DELAI_APPARITION_INDICE_SPECIAL);
    }
}
