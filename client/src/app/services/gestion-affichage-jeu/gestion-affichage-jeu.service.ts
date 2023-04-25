import { Injectable } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { GestionPixelService } from '@app/services/gestion-pixel/gestion-pixel.service';
import { InterfaceCadranIndice } from '@common/interface/interface-cadran-indice';
import { Vec2 } from '@common/interface/vec2';
import {
    AJUSTEMENT_X_ERREUR,
    COULEUR_JAUNE,
    DELAI_CLIGNOTEMENT_MASQUE,
    DELAI_CLIGNOTEMENT_TRICHE,
    DELAI_SECONDE,
    HAUTEUR_IMAGE,
    LARGEUR_IMAGE,
    Palette,
    REPETITION_CLIGNOTEMENT_MASQUE,
} from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class GestionAffichageJeuService {
    contexteImageOriginaleBot: CanvasRenderingContext2D;
    contexteImageModifieeBot: CanvasRenderingContext2D;
    contexteImageOriginaleTop: CanvasRenderingContext2D;
    contexteImageModifieeTop: CanvasRenderingContext2D;
    contexteImageOriginaleTriche: CanvasRenderingContext2D;
    contexteImageModifieeTriche: CanvasRenderingContext2D;
    compteurClignotement: number;
    clicsDeverouilles: boolean = true;
    dataMasques: ImageData;
    private intervalleTriche: number;
    private imageOriginale: ImageData;
    private imageModifiee: ImageData;

    private assistantCanvas = new AssistantCanvas();

    constructor(private gestionPixelService: GestionPixelService) {}

    dessinerImage(img: string, context: CanvasRenderingContext2D): void {
        const imageJeu: HTMLImageElement = new Image();
        imageJeu.crossOrigin = 'Anonymous';
        imageJeu.src = img as string;
        imageJeu.onload = () => {
            context.drawImage(imageJeu, 0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        };
    }

    mettreAJourImageModifiee(imgData: ImageData): void {
        this.contexteImageModifieeBot.putImageData(imgData, 0, 0);
    }

    recupererImageDataModifiee(): ImageData {
        return this.assistantCanvas.obtenirImageData(this.contexteImageModifieeBot);
    }

    recupererImageDataOriginale(): ImageData {
        return this.assistantCanvas.obtenirImageData(this.contexteImageOriginaleBot);
    }

    afficheErreur(coord: Vec2, isOriginal: boolean): void {
        this.clicsDeverouilles = false;
        if (isOriginal) {
            this.ecrireMotErreur(this.contexteImageOriginaleBot, coord);
        } else {
            this.ecrireMotErreur(this.contexteImageModifieeBot, coord);
        }
    }

    updateMasques(differences: Vec2[]): void {
        this.assistantCanvas.viderCanvas(this.contexteImageOriginaleTop);
        this.assistantCanvas.viderCanvas(this.contexteImageModifieeTop);
        this.dataMasques = this.assistantCanvas.obtenirImageData(this.contexteImageOriginaleTop);
        for (const pixel of differences) {
            const indexPixel: number = this.gestionPixelService.getIndexPixel(pixel);
            this.assistantCanvas.dessinerPixel(this.dataMasques, indexPixel, COULEUR_JAUNE);
        }
        this.contexteImageModifieeTop.putImageData(this.dataMasques, 0, 0);
        this.contexteImageOriginaleTop.putImageData(this.dataMasques, 0, 0);
    }

    clignotementCanvasTriche(): void {
        this.intervalleTriche = window.setInterval(() => {
            if (this.contexteImageOriginaleTriche.canvas.hidden) {
                this.contexteImageOriginaleTriche.canvas.hidden = false;
                this.contexteImageModifieeTriche.canvas.hidden = false;
            } else {
                this.contexteImageOriginaleTriche.canvas.hidden = true;
                this.contexteImageModifieeTriche.canvas.hidden = true;
            }
        }, DELAI_CLIGNOTEMENT_TRICHE);
    }

    desactivationClignotementTriche(): void {
        clearInterval(this.intervalleTriche);
        this.contexteImageOriginaleTriche.canvas.hidden = true;
        this.contexteImageModifieeTriche.canvas.hidden = true;
    }

    debutClignotement(): void {
        this.compteurClignotement = 0;
        this.clignotement();
    }

    afficherCadranIndice(cadran: InterfaceCadranIndice): void {
        this.assistantCanvas.viderCanvas(this.contexteImageOriginaleTop);
        this.assistantCanvas.viderCanvas(this.contexteImageModifieeTop);
        this.contexteImageOriginaleTop.fillStyle = Palette.Jaune;
        this.contexteImageModifieeTop.fillStyle = Palette.Jaune;
        this.contexteImageOriginaleTop.fillRect(cadran.x, cadran.y, cadran.largeur, cadran.hauteur);
        this.contexteImageModifieeTop.fillRect(cadran.x, cadran.y, cadran.largeur, cadran.hauteur);
        this.debutClignotement();
    }
    afficherDifferenceTrouvee(difference: Vec2[]): void {
        this.updateMasques(difference);
        this.debutClignotement();
        this.updateImage(difference);
    }
    miseAJourCanvasTriche(tableauRegroupements: Vec2[][]): void {
        this.assistantCanvas.viderCanvas(this.contexteImageOriginaleTriche);
        this.assistantCanvas.viderCanvas(this.contexteImageModifieeTriche);
        const dataCanvasTriche: ImageData = this.assistantCanvas.obtenirImageData(this.contexteImageOriginaleTriche);
        for (const difference of tableauRegroupements) {
            for (const pixel of difference) {
                const index: number = this.gestionPixelService.getIndexPixel(pixel);
                this.assistantCanvas.dessinerPixel(dataCanvasTriche, index, COULEUR_JAUNE);
            }
        }
        this.contexteImageOriginaleTriche.putImageData(dataCanvasTriche, 0, 0);
        this.contexteImageModifieeTriche.putImageData(dataCanvasTriche, 0, 0);
    }
    private updateImage(difference: Vec2[]): void {
        this.imageModifiee = this.recupererImageDataModifiee();
        this.imageOriginale = this.recupererImageDataOriginale();
        for (const pixel of difference) {
            this.transfertPixel(this.gestionPixelService.getIndexPixel(pixel));
        }
        this.mettreAJourImageModifiee(this.imageModifiee);
    }

    private transfertPixel(index: number): void {
        this.imageModifiee.data[index] = this.imageOriginale.data[index];
        this.imageModifiee.data[index + 1] = this.imageOriginale.data[index + 1];
        this.imageModifiee.data[index + 2] = this.imageOriginale.data[index + 2];
    }

    private clignotement(): void {
        const interval: number = window.setInterval(() => {
            this.compteurClignotement += 1;
            if (this.compteurClignotement === REPETITION_CLIGNOTEMENT_MASQUE) {
                this.compteurClignotement = 0;
                this.contexteImageOriginaleTop.canvas.hidden = true;
                this.contexteImageModifieeTop.canvas.hidden = true;
                clearInterval(interval);
            } else if (this.contexteImageOriginaleTop.canvas.hidden) {
                this.contexteImageOriginaleTop.canvas.hidden = false;
                this.contexteImageModifieeTop.canvas.hidden = false;
            } else {
                this.contexteImageOriginaleTop.canvas.hidden = true;
                this.contexteImageModifieeTop.canvas.hidden = true;
            }
        }, DELAI_CLIGNOTEMENT_MASQUE);
    }

    private ecrireMotErreur(context: CanvasRenderingContext2D, coord: Vec2): void {
        const imageAvantText: ImageData = context.getImageData(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        context.font = 'bold 12px verdana';
        context.fillStyle = '#ff0000';
        context.fillText('ERREUR', coord.x - AJUSTEMENT_X_ERREUR, coord.y);
        setTimeout(() => {
            context.putImageData(imageAvantText, 0, 0);
            this.clicsDeverouilles = true;
        }, DELAI_SECONDE);
    }
}
