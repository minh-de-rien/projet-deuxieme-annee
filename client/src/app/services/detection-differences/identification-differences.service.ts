import { Injectable } from '@angular/core';
import { BLANC, NOIR, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';

@Injectable()
export class IdentificationDifferencesService {
    private matriceDeDifferences: Uint8ClampedArray;
    private imgOriginale: ImageData;
    private imgModifiee: ImageData;
    private largeurImage: number;
    private hauteurImage: number;

    initialisation(donneesImgOriginale: ImageData, donneesImgModifiee: ImageData) {
        this.imgOriginale = donneesImgOriginale;
        this.imgModifiee = donneesImgModifiee;
        this.largeurImage = donneesImgOriginale.width;
        this.hauteurImage = donneesImgOriginale.height;
    }

    trouverLaDifference(): ImageData {
        const tailleDonnesImage = this.imgOriginale.data.length;
        this.matriceDeDifferences = new Uint8ClampedArray(tailleDonnesImage);

        for (let positionPixel = 0; positionPixel < tailleDonnesImage; positionPixel += NOMBRE_DE_COULEURS_PAR_PIXEL) {
            const pixelEstPareil = this.pixelEstPareil(positionPixel);
            const couleurAssignee = pixelEstPareil ? BLANC : NOIR;

            for (let positionRgbaPixel = 0; positionRgbaPixel < NOMBRE_DE_COULEURS_PAR_PIXEL; positionRgbaPixel++) {
                this.matriceDeDifferences[positionPixel + positionRgbaPixel] = couleurAssignee;
            }
        }

        return this.imageDeDifferences();
    }

    private pixelEstPareil(positionPixel: number): boolean {
        let pixelEstPareil = true;

        for (let positionRgbaPixel = 0; positionRgbaPixel < NOMBRE_DE_COULEURS_PAR_PIXEL && pixelEstPareil; positionRgbaPixel++) {
            pixelEstPareil = this.imgOriginale.data[positionPixel + positionRgbaPixel] === this.imgModifiee.data[positionPixel + positionRgbaPixel];
        }

        return pixelEstPareil;
    }

    private imageDeDifferences() {
        return new ImageData(this.matriceDeDifferences, this.largeurImage, this.hauteurImage);
    }
}
