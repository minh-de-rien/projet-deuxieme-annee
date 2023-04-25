import { Injectable } from '@angular/core';
import { Vec2 } from '@common/interface/vec2';
import { ElargissementDifferencesService } from './elargissement-differences.service';
import { IdentificationDifferencesService } from './identification-differences.service';
import { RegroupementDifferencesService } from './regroupement-differences.service';

@Injectable({
    providedIn: 'root',
})
export class DetectionDifferencesService {
    imgDeDifferences: ImageData;
    listeDePositionDesDifferencesEnXY: Vec2[];
    nombreDifferences: number;

    private imgOriginale: ImageData;
    private imgModifiee: ImageData;
    private rayonElargissement: number;
    private mapDifferencesRegroupees: Map<number, Vec2[]>;

    constructor(
        private identificationDeDifferencesService: IdentificationDifferencesService,
        private elargissementDeDifferencesService: ElargissementDifferencesService,
        private regroupementDeDifferences: RegroupementDifferencesService,
    ) {}

    initialisation(imgOriginale: ImageData, imgModifiee: ImageData, rayonElargissement: number) {
        this.imgOriginale = imgOriginale;
        this.imgModifiee = imgModifiee;
        this.rayonElargissement = rayonElargissement;
        this.regroupementDeDifferences.reinitialiserMapDifferences();
    }

    trouverLesDifferences() {
        this.regrouperLesDifferences();
        this.imgDeDifferences = this.regroupementDeDifferences.obtenirImgDeDifferences();
        this.nombreDifferences = this.regroupementDeDifferences.obtenirNombreDifferences();
        this.mapDifferencesRegroupees = this.regroupementDeDifferences.obtenirMapDifferences();
    }

    obtenirImgDifferences() {
        return this.imgDeDifferences;
    }

    obtenirNombreDifferences() {
        return this.nombreDifferences;
    }

    obtenirMapDifferences() {
        return this.mapDifferencesRegroupees;
    }

    private imageDeDifferences(): ImageData {
        this.identificationDeDifferencesService.initialisation(this.imgOriginale, this.imgModifiee);
        return this.identificationDeDifferencesService.trouverLaDifference();
    }

    private matriceDeDifferencesElargie(): Uint8ClampedArray {
        this.elargissementDeDifferencesService.initialisation(this.imageDeDifferences(), this.rayonElargissement);
        const matriceDeDifferencesElargie = this.elargissementDeDifferencesService.elargirLesDifferences();
        this.listeDePositionDesDifferencesEnXY = this.elargissementDeDifferencesService.obtenirListeDePositionXY();

        return matriceDeDifferencesElargie;
    }

    private regrouperLesDifferences() {
        this.regroupementDeDifferences.initialisation(this.matriceDeDifferencesElargie(), this.listeDePositionDesDifferencesEnXY, this.imgOriginale);
        this.regroupementDeDifferences.regrouperLesDifferences();
    }
}
