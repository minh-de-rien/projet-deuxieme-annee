import { Injectable } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { GestionPixelService } from '@app/services/gestion-pixel/gestion-pixel.service';
import { InterfaceCadranIndice } from '@common/interface/interface-cadran-indice';
import { Vec2 } from '@common/interface/vec2';
import { CENTRE_CANVAS_INDICE_SPECIAL, COULEUR_NOIR, HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class GestionIndicesService {
    private assistantCanvas = new AssistantCanvas();

    constructor(private gestionPixelService: GestionPixelService) {}

    etablirIndice(difference: Vec2[], identifiantIndice: number): InterfaceCadranIndice {
        const pixelDeReference: Vec2 = this.trouverPixelDeReference(difference);
        const largeurDuCadran: number = LARGEUR_IMAGE / (2 * identifiantIndice);
        const hauteurDuCadran: number = HAUTEUR_IMAGE / (2 * identifiantIndice);
        const coordXDuCadran: number = this.calculerLesCoordsDuCoteDuCadran(pixelDeReference.x, largeurDuCadran);
        const coordYDuCadran: number = this.calculerLesCoordsDuCoteDuCadran(pixelDeReference.y, hauteurDuCadran);
        const cadran: InterfaceCadranIndice = { x: coordXDuCadran, y: coordYDuCadran, largeur: largeurDuCadran, hauteur: hauteurDuCadran };
        return cadran;
    }

    etablirIndiceSpecial(difference: Vec2[], canvasIndiceSpecial: CanvasRenderingContext2D): void {
        const pixelDeReference: Vec2 = this.trouverPixelDeReference(difference);
        const translation: Vec2 = { x: pixelDeReference.x - CENTRE_CANVAS_INDICE_SPECIAL, y: pixelDeReference.y - CENTRE_CANVAS_INDICE_SPECIAL };
        const contextData: ImageData = this.assistantCanvas.obtenirImageData(canvasIndiceSpecial);
        for (const pixel of difference) {
            pixel.x -= translation.x;
            pixel.y -= translation.y;
            const indexPixel = this.gestionPixelService.getIndexPixel(pixel);
            this.assistantCanvas.dessinerPixel(contextData, indexPixel, COULEUR_NOIR);
        }
        canvasIndiceSpecial.putImageData(contextData, 0, 0);
    }

    private calculerLesCoordsDuCoteDuCadran(position: number, tailleDuCote: number): number {
        const positionDuCadran: number = Math.floor(position / tailleDuCote);
        const coordMinDuCadran: number = positionDuCadran * tailleDuCote;
        return coordMinDuCadran;
    }
    private trouverPixelDeReference(difference: Vec2[]): Vec2 {
        return difference[Math.floor(difference.length / 2)];
    }
}
