import { TestBed } from '@angular/core/testing';

import { BLANC, NOIR, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';
import { IdentificationDifferencesService } from './identification-differences.service';

describe('IdentificationDeDifferencesService', () => {
    let service: IdentificationDifferencesService;

    const LARGEUR_IMAGE_TEST = 7;
    const HAUTEUR_IMAGE_TEST = 7;
    const TAILLE_IMAGE_TEST = LARGEUR_IMAGE_TEST * HAUTEUR_IMAGE_TEST;
    const TAILLE_IMAGE_TEST_RGBA = TAILLE_IMAGE_TEST * NOMBRE_DE_COULEURS_PAR_PIXEL;
    const FIN_MATRICE = TAILLE_IMAGE_TEST_RGBA;

    const GRIS = 240;

    const matriceImageOriginale: Uint8ClampedArray = new Uint8ClampedArray(TAILLE_IMAGE_TEST_RGBA);
    const matriceImageModifiee: Uint8ClampedArray = new Uint8ClampedArray(TAILLE_IMAGE_TEST_RGBA);
    const matriceDeDifferencesAttendue: Uint8ClampedArray = new Uint8ClampedArray(TAILLE_IMAGE_TEST_RGBA);

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [IdentificationDifferencesService],
        });

        service = TestBed.inject(IdentificationDifferencesService);
    });

    it('devrait être défini', () => {
        expect(service).toBeTruthy();
    });

    it('devrait identifier le pixel different', () => {
        matriceImageOriginale.fill(BLANC, 0, NOMBRE_DE_COULEURS_PAR_PIXEL);
        matriceImageOriginale.fill(GRIS, NOMBRE_DE_COULEURS_PAR_PIXEL, FIN_MATRICE);

        matriceImageModifiee.fill(GRIS);

        matriceDeDifferencesAttendue.fill(NOIR, 0, NOMBRE_DE_COULEURS_PAR_PIXEL);
        matriceDeDifferencesAttendue.fill(BLANC, NOMBRE_DE_COULEURS_PAR_PIXEL, FIN_MATRICE);

        const imageOriginale = new ImageData(matriceImageOriginale, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);
        const imageModifiee = new ImageData(matriceImageModifiee, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);
        const imageDeDifferencesAttendue = new ImageData(matriceDeDifferencesAttendue, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);

        service.initialisation(imageOriginale, imageModifiee);
        const imageDeDifferences = service.trouverLaDifference();

        expect(imageDeDifferences).toEqual(imageDeDifferencesAttendue);
    });

    it('devrait identifier les deux pixels differents', () => {
        const MILIEU_MATRICE = Math.floor(TAILLE_IMAGE_TEST / 2);
        const TROIS_QUART_MATRICE = TAILLE_IMAGE_TEST_RGBA - NOMBRE_DE_COULEURS_PAR_PIXEL;

        matriceImageOriginale.fill(BLANC, 0, NOMBRE_DE_COULEURS_PAR_PIXEL);
        matriceImageOriginale.fill(GRIS, NOMBRE_DE_COULEURS_PAR_PIXEL, MILIEU_MATRICE);
        matriceImageOriginale.fill(BLANC, MILIEU_MATRICE, TROIS_QUART_MATRICE);
        matriceImageOriginale.fill(GRIS, TROIS_QUART_MATRICE, FIN_MATRICE);

        matriceImageModifiee.fill(GRIS);

        matriceDeDifferencesAttendue.fill(NOIR, 0, NOMBRE_DE_COULEURS_PAR_PIXEL);
        matriceDeDifferencesAttendue.fill(BLANC, NOMBRE_DE_COULEURS_PAR_PIXEL, MILIEU_MATRICE);
        matriceDeDifferencesAttendue.fill(NOIR, MILIEU_MATRICE, TROIS_QUART_MATRICE);
        matriceDeDifferencesAttendue.fill(BLANC, TROIS_QUART_MATRICE, FIN_MATRICE);

        const imageOriginale = new ImageData(matriceImageOriginale, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);
        const imageModifiee = new ImageData(matriceImageModifiee, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);
        const imageDeDifferencesAttendue = new ImageData(matriceDeDifferencesAttendue, LARGEUR_IMAGE_TEST, HAUTEUR_IMAGE_TEST);

        service.initialisation(imageOriginale, imageModifiee);
        const imageDeDifferences = service.trouverLaDifference();

        expect(imageDeDifferences).toEqual(imageDeDifferencesAttendue);
    });
});
