import { ElementRef, Injectable } from '@angular/core';
import { InterfaceCouleur } from '@common/interface/interface-couleur';
import { HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class AssistantCanvas {
    get largeur(): number {
        return LARGEUR_IMAGE;
    }
    get hauteur(): number {
        return HAUTEUR_IMAGE;
    }

    static creerCanvas(largeur: number, hauteur: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = largeur;
        canvas.height = hauteur;
        return canvas;
    }

    creerContexte(canvas: ElementRef<HTMLCanvasElement>): CanvasRenderingContext2D {
        return canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    viderCanvas(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    }

    obtenirImageData(ctx: CanvasRenderingContext2D): ImageData {
        return ctx.getImageData(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    }

    dessinerImageData(ctx: CanvasRenderingContext2D, imageData: ImageData): void {
        ctx.putImageData(imageData, 0, 0);
    }

    dessinerPixel(imageData: ImageData, indexPixel: number, couleur: InterfaceCouleur): void {
        imageData.data[indexPixel] = couleur.R;
        imageData.data[indexPixel + 1] = couleur.G;
        imageData.data[indexPixel + 2] = couleur.B;
        imageData.data[indexPixel + 3] = couleur.A;
    }
}
