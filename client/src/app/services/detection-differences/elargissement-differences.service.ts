import { Injectable } from '@angular/core';
import { GestionPixelService } from '@app/services/gestion-pixel/gestion-pixel.service';
import { Vec2 } from '@common/interface/vec2';
import { NOIR, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';

@Injectable()
export class ElargissementDifferencesService {
    private matriceDeDifferencesElargie: Uint8ClampedArray;
    private matriceDeDifferencesElargieEnPositionXY: Vec2[] = [];

    private matriceDeDifferences: Uint8ClampedArray;
    private largeurImage: number;
    private hauteurImage: number;
    private rayonElargissement: number;

    constructor(private gestionPixelService: GestionPixelService) {}
    initialisation(imageDeDifferences: ImageData, rayonElargissement: number) {
        this.matriceDeDifferences = imageDeDifferences.data;
        this.largeurImage = imageDeDifferences.width;
        this.hauteurImage = imageDeDifferences.height;
        this.rayonElargissement = rayonElargissement;
        this.matriceDeDifferencesElargie = new Uint8ClampedArray(imageDeDifferences.data);
    }

    elargirLesDifferences(): Uint8ClampedArray {
        for (let positionRgbaPixel = 0; positionRgbaPixel < this.tailleMatriceRgba(); positionRgbaPixel += NOMBRE_DE_COULEURS_PAR_PIXEL) {
            if (this.matriceDeDifferences[positionRgbaPixel] === NOIR) {
                const positionPixel = this.gestionPixelService.convertirEnPositionPixel(positionRgbaPixel);
                this.elargirPixel(positionPixel);
            }
        }
        return this.matriceDeDifferencesElargie;
    }

    obtenirListeDePositionXY(): Vec2[] {
        return this.matriceDeDifferencesElargieEnPositionXY;
    }

    private tailleMatriceRgba() {
        return this.largeurImage * this.hauteurImage * NOMBRE_DE_COULEURS_PAR_PIXEL;
    }

    private elargirPixel(positionPixelCentre: number) {
        for (let ligne = 0; ligne < this.largeurZoneElargissement(); ligne++) {
            for (let colonne = 0; colonne < this.largeurZoneElargissement(); colonne++) {
                this.traiterPixel(positionPixelCentre, this.positionPixelActuel(ligne, colonne, positionPixelCentre));
            }
        }
    }

    private traiterPixel(positionPixelCentre: number, positionPixelActuel: number): void {
        if (this.pixelRepondAuxCriteres(positionPixelCentre, positionPixelActuel)) {
            this.identifierPixelCommeDifferent(positionPixelActuel);
            this.enregistrerPositionEnXYDuPixelDifferent(positionPixelActuel);
        }
    }

    private pixelRepondAuxCriteres(positionPixelCentre: number, positionPixelActuel: number): boolean {
        return (
            this.estDansLesLimitesDeImage(positionPixelActuel) &&
            this.estDansRayonElargissement(this.trouverLaDistanceAuCarreEntre(positionPixelCentre, positionPixelActuel))
        );
    }

    private identifierPixelCommeDifferent(positionPixel: number): void {
        positionPixel = this.gestionPixelService.convertirEnPositionRgbaPixel(positionPixel);

        for (let positionRgbaPixel = 0; positionRgbaPixel < NOMBRE_DE_COULEURS_PAR_PIXEL; positionRgbaPixel++) {
            this.matriceDeDifferencesElargie[positionRgbaPixel + positionPixel] = NOIR;
        }
    }

    private largeurZoneElargissement(): number {
        return this.rayonElargissement * 2 + 1;
    }

    private positionPixelActuel(ligne: number, colonne: number, positionPixelCentre: number) {
        return this.largeurImage * ligne + colonne + this.positionPixelDebut(positionPixelCentre);
    }

    private positionPixelDebut(positionPixelCentre: number): number {
        return positionPixelCentre - this.largeurImage * this.rayonElargissement - this.rayonElargissement;
    }

    private estDansLesLimitesDeImage(positionPixel: number): boolean {
        return positionPixel >= 0 && positionPixel < this.tailleImage();
    }

    private tailleImage(): number {
        return this.largeurImage * this.hauteurImage;
    }
    private trouverLaDistanceAuCarreEntre(positionPixelCentre: number, positionPixelExterieur: number): number {
        const positionXYPixelExterieur: Vec2 = this.convertirEnPositionXY(positionPixelExterieur);
        const positionXYPixelCentre: Vec2 = this.convertirEnPositionXY(positionPixelCentre);

        return Math.pow(positionXYPixelExterieur.x - positionXYPixelCentre.x, 2) + Math.pow(positionXYPixelExterieur.y - positionXYPixelCentre.y, 2);
    }

    private estDansRayonElargissement(distanceAuCarre: number): boolean {
        return distanceAuCarre <= Math.pow(this.rayonElargissement, 2);
    }

    private convertirEnPositionXY(positionPixel: number): Vec2 {
        const x: number = positionPixel % this.largeurImage;
        const y: number = Math.floor(positionPixel / this.largeurImage);
        return { x, y };
    }

    private enregistrerPositionEnXYDuPixelDifferent(positionPixel: number): void {
        const positionPixelXY: Vec2 = this.convertirEnPositionXY(positionPixel);
        this.matriceDeDifferencesElargieEnPositionXY.push(positionPixelXY);
    }
}
