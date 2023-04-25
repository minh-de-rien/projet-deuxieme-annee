import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { AudioService } from '@app/services/audio/audio.service';
import { CreationJeuService } from '@app/services/creation-jeu/creation-jeu.service';
import { DetectionDifferencesService } from '@app/services/detection-differences/detection-differences.service';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { OutilsService } from '@app/services/outils-dessin/outils/outils.service';
import { PileLIFOService } from '@app/services/pile-lifo/pile-lifo.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { BoutonAvantPlan, BoutonDuplication, BoutonReinitialisation, CanvasDessin, ZoneInput } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-creation-jeu',
    templateUrl: './creation-jeu.component.html',
    styleUrls: ['./creation-jeu.component.scss'],
})
export class CreationJeuComponent implements AfterViewInit {
    @ViewChild('imgOriginale') private canvasOriginal: ElementRef<HTMLCanvasElement>;
    @ViewChild('imgModifiee') private canvasModifiee: ElementRef<HTMLCanvasElement>;
    @ViewChild('imgDifference') private canvasDifference: ElementRef<HTMLCanvasElement>;
    @ViewChild('formulaireDeuxZones') private formulaireDeuxZones: ElementRef<HTMLFormElement>;
    @ViewChild('formulaireOriginal') private formulaireOriginal: ElementRef<HTMLFormElement>;
    @ViewChild('formulaireModifiee') private formulaireModifiee: ElementRef<HTMLFormElement>;
    @ViewChild('fenetreModaleWrapper') private fenetreModaleWrapper: ElementRef<HTMLDivElement>;
    @ViewChild('rayonElargissement') private rayonElargissement: ElementRef<HTMLSelectElement>;
    @ViewChild('boutonPalette') private boutonPalette: ElementRef<HTMLButtonElement>;
    @ViewChild('texteInformation') private texteInformation: ElementRef<HTMLSpanElement>;
    nbrDifference: number = 0;
    etatBoutonOutil: Map<string, boolean>;

    private assistantCanvas: AssistantCanvas;

    /* eslint-disable-next-line max-params*/ // Raison : Tous les services sont nécessaires
    constructor(
        private creationJeuService: CreationJeuService,
        private detectionDifferencesService: DetectionDifferencesService,
        private outilsService: OutilsService,
        private affichageDessinService: AffichageDessinService,
        private pileLifoService: PileLIFOService,
        readonly audioService: AudioService,
        private socketService: GestionSocketClientService,
    ) {
        this.assistantCanvas = new AssistantCanvas();
        this.etatBoutonOutil = new Map<string, boolean>([
            ['crayon', false],
            ['efface', false],
            ['palette', false],
        ]);
    }

    get largeur(): number {
        return this.assistantCanvas.largeur;
    }
    get hauteur(): number {
        return this.assistantCanvas.hauteur;
    }
    get canvasDessinOriginal(): CanvasDessin {
        return CanvasDessin.Original;
    }
    get canvasDessinModifie(): CanvasDessin {
        return CanvasDessin.Modifie;
    }

    @HostListener('window:keydown.control.z')
    annuler() {
        this.affichageDessinService.annuler(this.pileLifoService.depilerHistorique());
    }
    @HostListener('window:keydown.shift.control.z')
    @HostListener('window:shift.control.z')
    refaire() {
        this.affichageDessinService.refaire(this.pileLifoService.depilerActionsAnnulees());
    }

    @HostListener('window:mouseup')
    sourisRelachee(): void {
        this.outilsService.sourisRelachee();
    }

    ngAfterViewInit(): void {
        this.creationJeuService.dessinerCanvasValeurParDefaut(this.canvasOriginal);
        this.creationJeuService.dessinerCanvasValeurParDefaut(this.canvasModifiee);
        this.affichageDessinService.boutonPalette = this.boutonPalette;
        this.socketService.send(SocketEvenements.RecupererListeJeux);
    }

    televersement(evenement: Event) {
        const elementInput = evenement.currentTarget as HTMLInputElement;
        const listeFichier: FileList = elementInput.files as FileList;
        const fichier = listeFichier[0] as File;
        if (listeFichier) {
            switch (elementInput.name) {
                case ZoneInput.InputDeuxZones: {
                    this.creationJeuService.televersementDeuxZones(this.canvasOriginal, this.canvasModifiee, fichier);
                    this.creationJeuService.reinitialisationFormulaire(this.formulaireOriginal);
                    this.creationJeuService.reinitialisationFormulaire(this.formulaireModifiee);
                    break;
                }
                case ZoneInput.InputZoneOriginale: {
                    this.creationJeuService.televersementUneZone(this.canvasOriginal, fichier);
                    this.creationJeuService.reinitialisationFormulaire(this.formulaireDeuxZones);
                    break;
                }
                case ZoneInput.InputZoneModifiee: {
                    this.creationJeuService.televersementUneZone(this.canvasModifiee, fichier);
                    this.creationJeuService.reinitialisationFormulaire(this.formulaireDeuxZones);
                    break;
                }
            }
        }
    }

    reinitialisation(evenement: Event) {
        const bouton = evenement.currentTarget as HTMLButtonElement;
        switch (bouton.name) {
            case BoutonReinitialisation.BoutonDeuxZones: {
                this.reinitialisationCanvasOriginalParDefaut();
                this.reinitialisationCanvasModifieParDefaut();
                this.creationJeuService.reinitialisationFormulaire(this.formulaireOriginal);
                this.creationJeuService.reinitialisationFormulaire(this.formulaireModifiee);
                break;
            }
            case BoutonReinitialisation.BoutonImageOriginale: {
                this.reinitialisationCanvasOriginalParDefaut();
                this.creationJeuService.reinitialisationFormulaire(this.formulaireDeuxZones);
                break;
            }
            case BoutonReinitialisation.BoutonImageModifiee: {
                this.reinitialisationCanvasModifieParDefaut();
                this.creationJeuService.reinitialisationFormulaire(this.formulaireDeuxZones);
                break;
            }
        }
    }
    reinitialisationAvantPlan(evenement: Event) {
        const bouton = evenement.currentTarget as HTMLButtonElement;
        switch (bouton.name) {
            case BoutonAvantPlan.AvantPlanOriginal: {
                this.pileLifoService.empilerHistorique(CanvasDessin.Original, this.affichageDessinService.obtenirImageDataOriginale());
                this.affichageDessinService.effacerCanvasOriginal();
                break;
            }
            case BoutonAvantPlan.AvantPlanModifie: {
                this.pileLifoService.empilerHistorique(CanvasDessin.Modifie, this.affichageDessinService.obtenirImageDataModifiee());
                this.affichageDessinService.effacerCanvasModifie();
                break;
            }
        }
    }
    duplicationAvantPlan(evenement: Event) {
        const bouton = evenement.currentTarget as HTMLButtonElement;
        switch (bouton.name) {
            case BoutonDuplication.BoutonDuplicationOriginal: {
                this.pileLifoService.empilerHistorique(CanvasDessin.Modifie, this.affichageDessinService.obtenirImageDataModifiee());
                this.affichageDessinService.dupliquerCanvasOriginal();
                break;
            }
            case BoutonDuplication.BoutonDuplicationModifie: {
                this.pileLifoService.empilerHistorique(CanvasDessin.Original, this.affichageDessinService.obtenirImageDataOriginale());
                this.affichageDessinService.dupliquerCanvasModifiee();
                break;
            }
        }
    }
    apparitionTexteInformation() {
        this.texteInformation.nativeElement.style.visibility = 'visible';
    }
    enleverTexteInformation() {
        this.texteInformation.nativeElement.style.visibility = 'hidden';
    }
    intervertionAvantPlan() {
        this.pileLifoService.empilerHistorique(CanvasDessin.OriginalInterverti, this.affichageDessinService.obtenirImageDataOriginale());
        this.pileLifoService.empilerHistorique(CanvasDessin.ModifieInterverti, this.affichageDessinService.obtenirImageDataModifiee());
        this.affichageDessinService.intervertirAvantPlan();
    }

    validation() {
        this.recuperationDesDifferences();
        this.ouvreFenetre(this.detectionDifferencesService.imgDeDifferences);
    }

    ouvreFenetre(dataDifference: ImageData) {
        this.fenetreModaleWrapper.nativeElement.style.display = 'block';
        this.assistantCanvas.dessinerImageData(this.creationJeuService.obtenirContexteDeRefCanvas(this.canvasDifference), dataDifference);
    }
    fermeFenetre() {
        this.fenetreModaleWrapper.nativeElement.style.display = 'none';
    }

    async enregistrement() {
        this.recuperationDesDifferences();
        const nomEntre = window.prompt('entrez un nom pour le jeu: ');
        const nomOk = this.creationJeuService.verificationNom(nomEntre);
        const nbrDifferenceOk = this.creationJeuService.verificationNbrDifference(this.nbrDifference);
        if (nomOk && nbrDifferenceOk && nomEntre) {
            const planFusionneOriginal = this.fusionPlansOriginaux();
            const planFusionneModifie = this.fusionPlansModifies();
            this.assistantCanvas.dessinerImageData(this.creationJeuService.obtenirContexteDeRefCanvas(this.canvasOriginal), planFusionneOriginal);
            this.assistantCanvas.dessinerImageData(this.creationJeuService.obtenirContexteDeRefCanvas(this.canvasModifiee), planFusionneModifie);
            const canvasOriginalBlob = this.creationJeuService.transformationCanvasEnBlob(this.canvasOriginal);
            const canvasModifieeBlob = this.creationJeuService.transformationCanvasEnBlob(this.canvasModifiee);
            Promise.all([canvasOriginalBlob, canvasModifieeBlob]).then((valeurs) => {
                this.creationJeuService.nomJeu = nomEntre;
                this.creationJeuService.enregistrementServeur(
                    this.detectionDifferencesService.obtenirMapDifferences(),
                    this.detectionDifferencesService.obtenirImgDifferences().data,
                    valeurs,
                );
            });
        }
    }

    changerOutil(outil: string): void {
        const outilEstChange = this.outilsService.changerOutil(outil);
        this.changerEtatBoutonOutil(outilEstChange, outil);
    }

    etablirEpaisseurOutil(evenement: MatSliderChange): void {
        this.outilsService.etablirEpaisseurOutil(evenement.value as number);
    }

    unBoutonOutilEstActif(): boolean {
        return (this.etatBoutonOutil.get('crayon') || this.etatBoutonOutil.get('efface') || this.etatBoutonOutil.get('palette')) as boolean;
    }

    private changerEtatBoutonOutil(outilEstChange: boolean, outil: string): void {
        if (outilEstChange) {
            this.etatBoutonOutil.set(outil, true);
            const outilPrecedent = this.outilsService.outilPrecedent;
            this.outilsService.etablirEpaisseurOutil(1);
            if (outilPrecedent) this.etatBoutonOutil.set(outilPrecedent.nomOutil, false);
        } else {
            this.etatBoutonOutil.set(outil, false);
        }
    }
    private creationImageData(canvas: ElementRef<HTMLCanvasElement>): ImageData {
        return this.assistantCanvas.obtenirImageData(this.creationJeuService.obtenirContexteDeRefCanvas(canvas));
    }
    private recuperationDesDifferences() {
        const planFusionneOriginal = this.fusionPlansOriginaux();
        const planFusionneModifie = this.fusionPlansModifies();
        const rayon = this.rayonElargissement.nativeElement.value as unknown as number;
        this.detectionDifferencesService.initialisation(planFusionneOriginal, planFusionneModifie, rayon);
        this.detectionDifferencesService.trouverLesDifferences();
        this.nbrDifference = this.detectionDifferencesService.obtenirNombreDifferences();
    }
    private fusionPlansOriginaux(): ImageData {
        return this.creationJeuService.fusionImageData(
            this.creationImageData(this.canvasOriginal),
            this.affichageDessinService.obtenirImageDataOriginale(),
        );
    }
    private fusionPlansModifies(): ImageData {
        return this.creationJeuService.fusionImageData(
            this.creationImageData(this.canvasModifiee),
            this.affichageDessinService.obtenirImageDataModifiee(),
        );
    }
    private reinitialisationCanvasOriginalParDefaut(): void {
        this.creationJeuService.reinitialisationUneImg(this.canvasOriginal);
        this.creationJeuService.dessinerCanvasValeurParDefaut(this.canvasOriginal);
    }
    private reinitialisationCanvasModifieParDefaut(): void {
        this.creationJeuService.reinitialisationUneImg(this.canvasModifiee);
        this.creationJeuService.dessinerCanvasValeurParDefaut(this.canvasModifiee);
    }
}
