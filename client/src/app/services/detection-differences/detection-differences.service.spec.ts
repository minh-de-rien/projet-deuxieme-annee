import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@common/interface/vec2';
import { of } from 'rxjs';

import { DetectionDifferencesService } from './detection-differences.service';
import { ElargissementDifferencesService } from './elargissement-differences.service';
import { IdentificationDifferencesService } from './identification-differences.service';
import { RegroupementDifferencesService } from './regroupement-differences.service';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint @typescript-eslint/no-magic-numbers: "off"*/

describe('DetectionDeDifferencesService', () => {
    let serviceDetection: DetectionDifferencesService;
    let serviceIdentification: IdentificationDifferencesService;
    let serviceElargissement: ElargissementDifferencesService;
    let serviceRegroupement: RegroupementDifferencesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IdentificationDifferencesService, ElargissementDifferencesService, RegroupementDifferencesService],
        });
        serviceDetection = TestBed.inject(DetectionDifferencesService);
        serviceIdentification = TestBed.inject(IdentificationDifferencesService);
        serviceElargissement = TestBed.inject(ElargissementDifferencesService);
        serviceRegroupement = TestBed.inject(RegroupementDifferencesService);
    });

    it('devrait être créé', () => {
        expect(serviceDetection).toBeTruthy();
    });

    it("les valeurs à l'initialisation devraient être égales aux valeurs des attributs privés", () => {
        const imgOriginale: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const imgModifiee: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const rayonElargissement = 3;

        serviceDetection.initialisation(imgOriginale, imgModifiee, rayonElargissement);

        expect(serviceDetection['imgOriginale']).toEqual(imgOriginale);
        expect(serviceDetection['imgModifiee']).toEqual(imgModifiee);
        expect(serviceDetection['rayonElargissement']).toEqual(rayonElargissement);
    });

    it("obtenirImgDifferences() devrait retourné l'image de différences", () => {
        const imageDiffenreces = serviceDetection.obtenirImgDifferences();
        expect(imageDiffenreces).toEqual(serviceDetection['imgDeDifferences']);
    });
    it('obtenirNombreDifferences() devrait retourné le nombre de différences', () => {
        const nombreDiffenreces = serviceDetection.obtenirNombreDifferences();
        expect(nombreDiffenreces).toEqual(serviceDetection['nombreDifferences']);
    });
    it('obtenirMapDifferences() devrait retourné le map des différences regroupées', () => {
        const mapDiffenrecesRegroupees = serviceDetection.obtenirMapDifferences();
        expect(mapDiffenrecesRegroupees).toEqual(serviceDetection['mapDifferencesRegroupees']);
    });

    it('trouverLesDifferences() devrait appeler regroupementDeDifferences()', () => {
        const regrouperLesDifferencesSpy = spyOn<any>(serviceDetection, 'regrouperLesDifferences').and.stub();
        const imgOriginale: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const imgModifiee: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const tableau: Vec2[] = [];
        const rayonElargissement = 3;
        serviceDetection.initialisation(imgOriginale, imgModifiee, rayonElargissement);
        serviceRegroupement.initialisation(new Uint8ClampedArray(16), tableau, imgOriginale);
        serviceDetection.trouverLesDifferences();
        expect(regrouperLesDifferencesSpy).toHaveBeenCalled();
    });

    it('obtenirImgDeDifferences() de RegroupementDeDifferences devrait être appelé', () => {
        spyOn<any>(serviceDetection, 'regrouperLesDifferences').and.stub();
        spyOn<any>(serviceRegroupement, 'obtenirImgDeDifferences').and.callFake(() => {
            return of(ImageData);
        });

        const imgOriginale: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const imgModifiee: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const tableau: Vec2[] = [];
        const rayonElargissement = 3;

        serviceDetection.initialisation(imgOriginale, imgModifiee, rayonElargissement);
        serviceRegroupement.initialisation(new Uint8ClampedArray(16), tableau, imgOriginale);
        serviceDetection.trouverLesDifferences();

        expect(serviceRegroupement.obtenirImgDeDifferences).toHaveBeenCalled();
    });

    it('obtenirNombreDifferences() de RegroupementDeDifferences devrait être appelé', () => {
        spyOn<any>(serviceDetection, 'regrouperLesDifferences').and.stub();
        spyOn<any>(serviceRegroupement, 'obtenirNombreDifferences').and.callFake(() => {
            return of(Number);
        });

        const imgOriginale: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const imgModifiee: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const tableau: Vec2[] = [];
        const rayonElargissement = 3;

        serviceDetection.initialisation(imgOriginale, imgModifiee, rayonElargissement);
        serviceRegroupement.initialisation(new Uint8ClampedArray(16), tableau, imgOriginale);
        serviceDetection.trouverLesDifferences();

        expect(serviceRegroupement.obtenirNombreDifferences).toHaveBeenCalled();
    });

    it('imageDeDifferences() devrait retourné une matrice de type ImageData', () => {
        const identificationSpy = spyOn<any>(serviceIdentification, 'initialisation').and.stub();
        const trouverDifferencesSpy = spyOn<any>(serviceIdentification, 'trouverLaDifference').and.stub();

        serviceDetection['imageDeDifferences']();

        expect(identificationSpy).toHaveBeenCalled();
        expect(trouverDifferencesSpy).toHaveBeenCalled();
    });

    it('matriceDeDifferencesElargie() devrait retourné une matrice de type Uint8ClampedArray', () => {
        spyOn<any>(serviceDetection, 'imageDeDifferences').and.stub();
        const identificationSpy = spyOn<any>(serviceElargissement, 'initialisation').and.stub();
        const elargirDifferencesSpy = spyOn<any>(serviceElargissement, 'elargirLesDifferences').and.stub();

        serviceDetection['matriceDeDifferencesElargie']();
        expect(identificationSpy).toHaveBeenCalled();
        expect(elargirDifferencesSpy).toHaveBeenCalled();
    });

    it('regrouperLesDifferences() de DetectionDeDifferences devrait appelé regrouperLesDifferences de RegroupementDeDifferences', () => {
        spyOn<any>(serviceDetection, 'matriceDeDifferencesElargie').and.stub();
        const initialisationSpy = spyOn<any>(serviceRegroupement, 'initialisation').and.stub();
        const regrouperDifferencesSpy = spyOn<any>(serviceRegroupement, 'regrouperLesDifferences').and.stub();
        const imgOriginale: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const imgModifiee: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const tableau: Vec2[] = [];
        const rayonElargissement = 3;

        serviceDetection.initialisation(imgOriginale, imgModifiee, rayonElargissement);
        serviceRegroupement.initialisation(new Uint8ClampedArray(16), tableau, imgOriginale);
        serviceDetection['regrouperLesDifferences']();

        expect(initialisationSpy).toHaveBeenCalled();
        expect(regrouperDifferencesSpy).toHaveBeenCalled();
    });
});
