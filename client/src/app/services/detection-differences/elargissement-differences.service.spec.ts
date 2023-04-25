import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@common/interface/vec2';
import { BLANC, NOIR, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';
import { ElargissementDifferencesService } from './elargissement-differences.service';
import { testMatriceDeDifferencesElargieAttendue } from './test-matrice-de-differences';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
const RAYON_ELARGISSEMENT = 3;
const LARGEUR_MATRICE_TEST = 7;
const HAUTEUR_MATRICE_TEST = 7;
const TAILLE_MATRICE_TEST = LARGEUR_MATRICE_TEST * HAUTEUR_MATRICE_TEST;
const TAILLE_MATRICE_TEST_RGBA = TAILLE_MATRICE_TEST * NOMBRE_DE_COULEURS_PAR_PIXEL;
const POSITION_PIXEL_DIFFERENT = LARGEUR_MATRICE_TEST * RAYON_ELARGISSEMENT + RAYON_ELARGISSEMENT;

describe('ElargissementDeDifferencesService', () => {
    let service: ElargissementDifferencesService;
    const matriceDeDifferences = new Uint8ClampedArray(TAILLE_MATRICE_TEST_RGBA);
    const matriceDeDifferencesElargieAttendue = new Uint8ClampedArray(TAILLE_MATRICE_TEST_RGBA);

    beforeEach(() => {
        matriceDeDifferences.fill(BLANC);
        const imageDeDifferences = new ImageData(matriceDeDifferences, LARGEUR_MATRICE_TEST, HAUTEUR_MATRICE_TEST);
        TestBed.configureTestingModule({
            providers: [ElargissementDifferencesService],
        });
        service = TestBed.inject(ElargissementDifferencesService);
        service.initialisation(imageDeDifferences, RAYON_ELARGISSEMENT);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('devrait identifier toutes les couleurs du pixel comme NOIR', () => {
        service['identifierPixelCommeDifferent'](0);

        const pixelElargis: Uint8ClampedArray = service['matriceDeDifferencesElargie'];
        const pixelElargisAttendu: Uint8ClampedArray = new Uint8ClampedArray(TAILLE_MATRICE_TEST_RGBA);
        pixelElargisAttendu.fill(BLANC);
        pixelElargisAttendu.fill(NOIR, 0, NOMBRE_DE_COULEURS_PAR_PIXEL);

        expect(pixelElargis).toEqual(pixelElargisAttendu);
    });

    it('devrait retourner la bonne distance entre le pixel du centre et le pixel actuel en parallèle', () => {
        const distance: number = service['trouverLaDistanceAuCarreEntre'](POSITION_PIXEL_DIFFERENT, 3);
        expect(distance).toEqual(9);
    });
    it('devrait retourner la bonne distance entre le pixel du centre et le pixel actuel en diagonale', () => {
        const distance: number = service['trouverLaDistanceAuCarreEntre'](POSITION_PIXEL_DIFFERENT, 2);
        expect(distance).toEqual(10);
    });
    it("devrait retourner la bonne distance entre le pixel du centre et le pixel hors rayon d'élargissement", () => {
        const distance: number = service['trouverLaDistanceAuCarreEntre'](POSITION_PIXEL_DIFFERENT, 6);
        expect(distance).toEqual(18);
    });

    it("devrait détecter que le pixel traité est dans le rayon d'élargissement", () => {
        const valeur: boolean = service['estDansRayonElargissement'](0);
        expect(valeur).toBe(true);
    });
    it("devrait détecter que le pixel traité n'est pas dans le rayon d'élargissement", () => {
        const valeur: boolean = service['estDansRayonElargissement'](18);
        expect(valeur).toBe(false);
    });
    it('devrait convertir le position du pixel en coordonnée XY', () => {
        const positionPixel: Vec2 = service['convertirEnPositionXY'](POSITION_PIXEL_DIFFERENT);
        const positionPixelAttendue: Vec2 = { x: 3, y: 3 };

        expect(positionPixel).toEqual(positionPixelAttendue);
    });

    it('devrait élargir le pixel différent', () => {
        const POSITION_PIXEL_DIFFERENT_RGBA = POSITION_PIXEL_DIFFERENT * NOMBRE_DE_COULEURS_PAR_PIXEL;

        matriceDeDifferences.fill(BLANC);
        matriceDeDifferences.fill(NOIR, POSITION_PIXEL_DIFFERENT_RGBA, POSITION_PIXEL_DIFFERENT_RGBA + NOMBRE_DE_COULEURS_PAR_PIXEL);

        // convertir la matriceTest en matriceTestRgba
        for (let indexPixel = 0; indexPixel < TAILLE_MATRICE_TEST_RGBA; indexPixel++) {
            for (let indexCouleurRgba = 0; indexCouleurRgba < 4; indexCouleurRgba++) {
                matriceDeDifferencesElargieAttendue[indexPixel * NOMBRE_DE_COULEURS_PAR_PIXEL + indexCouleurRgba] =
                    testMatriceDeDifferencesElargieAttendue[indexPixel];
            }
        }
        const imageDeDifferences = new ImageData(matriceDeDifferences, LARGEUR_MATRICE_TEST, HAUTEUR_MATRICE_TEST);

        service.initialisation(imageDeDifferences, RAYON_ELARGISSEMENT);
        service.elargirLesDifferences();

        expect(service['matriceDeDifferencesElargie']).toEqual(matriceDeDifferencesElargieAttendue);
    });
});
