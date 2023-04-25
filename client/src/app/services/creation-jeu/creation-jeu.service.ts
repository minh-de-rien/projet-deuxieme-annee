import { ElementRef, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import {
    BORNE_INF_TAILLE_FICHIER_POUR_BPP_24,
    BORNE_SUP_TAILLE_FICHIER_POUR_BPP_24,
    DUREE_SNACK_BAR,
    HAUTEUR_IMAGE,
    LARGEUR_IMAGE,
    NOMBRE_DE_COULEURS_PAR_PIXEL,
    NOMBRE_DE_DIFFERENCES_MAX,
    NOMBRE_DE_DIFFERENCES_MIN,
} from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class CreationJeuService {
    nomJeu: string;
    urlImageOrig: string;
    urlImageModif: string;
    private listeNomJeux: string[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private communicationServeur: CommunicationService,
        private router: Router,
        private socketService: GestionSocketClientService,
        private readonly snackBar: MatSnackBar,
    ) {
        this.socketService.on(SocketEvenements.Jeux, (listeJeux: InterfaceJeux[]) => {
            this.listeNomJeux = [];
            for (const jeu of listeJeux) {
                this.listeNomJeux.push(jeu.nom);
            }
        });
    }

    reinitialisationFormulaire(formulaire: ElementRef<HTMLFormElement>) {
        formulaire.nativeElement.reset();
    }

    reinitialisationUneImg(canvas: ElementRef<HTMLCanvasElement>): void {
        this.obtenirContexteDeRefCanvas(canvas).clearRect(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    }

    dessinerCanvasValeurParDefaut(canvas: ElementRef<HTMLCanvasElement>): void {
        const contexte = this.obtenirContexteDeRefCanvas(canvas);
        contexte.fillStyle = 'white';
        contexte.fillRect(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    }

    verification(fichier: File, imgBmp: ImageBitmap): boolean {
        const bppOk: boolean = this.verificationTaille(fichier);
        const dimensionOk: boolean = this.verificationDimension(imgBmp);
        if (bppOk && dimensionOk) {
            return true;
        } else {
            this.ouvrirSnackBar(MessageAlerte.NonRespectFormatImage);
            return false;
        }
    }
    async televersementDeuxZones(canvasOriginal: ElementRef<HTMLCanvasElement>, canvasModifiee: ElementRef<HTMLCanvasElement>, fichier: File) {
        createImageBitmap(fichier).then((imgBmp) => {
            if (this.verification(fichier, imgBmp)) {
                this.generationImage(imgBmp, canvasOriginal);
                this.generationImage(imgBmp, canvasModifiee);
            }
        });
    }
    async televersementUneZone(canvas: ElementRef<HTMLCanvasElement>, fichier: File) {
        createImageBitmap(fichier).then((imgBmp) => {
            if (this.verification(fichier, imgBmp)) {
                this.generationImage(imgBmp, canvas);
            }
        });
    }
    async enregistrementServeur(mapRegroupements: Map<number, Vec2[]>, matriceDifferences: Uint8ClampedArray, valeurs: [Blob, Blob]) {
        const imageOriginale = this.enregistrementBlobOriginalEnFichier(valeurs[0]);
        const imageModifiee = this.enregistrementBlobModifieEnFichier(valeurs[1]);

        this.urlImageOrig = await this.obtenirImageBase64(imageOriginale);
        this.urlImageModif = await this.obtenirImageBase64(imageModifiee);

        const tableauRegroupements: Vec2[][] = new Array();
        mapRegroupements.forEach((difference) => {
            tableauRegroupements.push(difference);
        });

        const tableauDifferences = new Array();
        matriceDifferences.forEach((element) => {
            tableauDifferences.push(element);
        });
        const nouveauJeu: InterfaceJeux = {
            id: Number.MAX_SAFE_INTEGER,
            nom: this.nomJeu,
            meilleursTempsSolo: [],
            meilleursTemps1v1: [],
            imgOriginale: this.urlImageOrig,
            imgModifiee: this.urlImageModif,
            nombreDifferences: tableauRegroupements.length,
            tableauRegroupements,
            matriceDifferences: tableauDifferences,
        };

        this.communicationServeur.envoyerJeuAuServeur(nouveauJeu).subscribe({
            next: () => {
                this.socketService.send(SocketEvenements.ChargerNouveauxJeux);
                this.router.navigate(['/admin']);
            },
        });
    }
    verificationNom(nomEntre: string | null): boolean {
        if (nomEntre === null || nomEntre === '') {
            this.ouvrirSnackBar(MessageAlerte.NomResquisPourEnregistrer);
            return false;
        } else if (this.estPresentDansLaListe(nomEntre)) {
            this.ouvrirSnackBar(MessageAlerte.NomDejaExistant);
            return false;
        }
        return true;
    }
    verificationNbrDifference(nbrDifference: number): boolean {
        if (nbrDifference < NOMBRE_DE_DIFFERENCES_MIN || nbrDifference > NOMBRE_DE_DIFFERENCES_MAX) {
            this.ouvrirSnackBar(MessageAlerte.NombreDeDifferencesInvalide);
            return false;
        }
        return true;
    }
    fusionImageData(arrierePlan: ImageData, avantPlan: ImageData): ImageData {
        const imageDataFusionne = arrierePlan;
        for (let positionPixel = 0; positionPixel < arrierePlan.data.length; positionPixel += NOMBRE_DE_COULEURS_PAR_PIXEL) {
            if (!this.pixelEstTransparent(avantPlan, positionPixel)) {
                this.transfertPixelImageData(imageDataFusionne, avantPlan, positionPixel);
            }
        }
        return imageDataFusionne;
    }
    obtenirContexteDeRefCanvas(canvas: ElementRef<HTMLCanvasElement>): CanvasRenderingContext2D {
        return canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
    async transformationCanvasEnBlob(referenceCanvas: ElementRef<HTMLCanvasElement>): Promise<Blob> {
        const canvas = referenceCanvas.nativeElement;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        return blob as Promise<Blob>;
    }
    enregistrementBlobOriginalEnFichier(valeur: Blob): File {
        return new File([valeur], this.nomJeu + '_O.bmp');
    }
    enregistrementBlobModifieEnFichier(valeur: Blob): File {
        return new File([valeur], this.nomJeu + '_M.bmp');
    }

    private verificationTaille(fichier: File): boolean {
        return fichier.size <= BORNE_SUP_TAILLE_FICHIER_POUR_BPP_24 && fichier.size >= BORNE_INF_TAILLE_FICHIER_POUR_BPP_24;
    }
    private verificationDimension(imgbmp: ImageBitmap) {
        return imgbmp.width === LARGEUR_IMAGE && imgbmp.height === HAUTEUR_IMAGE;
    }
    private generationImage(imgBmp: ImageBitmap, canvas: ElementRef<HTMLCanvasElement>) {
        this.obtenirContexteDeRefCanvas(canvas).drawImage(imgBmp, 0, 0);
    }
    private pixelEstTransparent(imageData: ImageData, positionPixel: number): boolean {
        return (
            imageData.data[positionPixel] === 0 &&
            imageData.data[positionPixel + 1] === 0 &&
            imageData.data[positionPixel + 2] === 0 &&
            imageData.data[positionPixel + 3] === 0
        );
    }
    private transfertPixelImageData(imageDataModifie: ImageData, imageDataTransfere: ImageData, positionPixel: number): void {
        imageDataModifie.data[positionPixel] = imageDataTransfere.data[positionPixel];
        imageDataModifie.data[positionPixel + 1] = imageDataTransfere.data[positionPixel + 1];
        imageDataModifie.data[positionPixel + 2] = imageDataTransfere.data[positionPixel + 2];
    }
    private async obtenirImageBase64(imageModifiee: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const readerModif = new FileReader();
            readerModif.readAsDataURL(imageModifiee);
            readerModif.onload = () => {
                resolve(readerModif.result as string);
            };
            readerModif.onerror = (err) => {
                reject(err);
            };
        });
    }
    private estPresentDansLaListe(nomEntre: string): boolean {
        return this.listeNomJeux.find((nom) => nom.toLowerCase() === nomEntre.toLowerCase()) !== undefined;
    }
    private ouvrirSnackBar(message: string) {
        this.snackBar.open(message, '', {
            duration: DUREE_SNACK_BAR,
        });
    }
}
