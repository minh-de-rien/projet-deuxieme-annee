import { TestBed } from '@angular/core/testing';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { Vec2 } from '@common/interface/vec2';
import { HAUTEUR_CANVAS_PALETTE, LARGEUR_CANVAS_PALETTE, Palette } from '@common/valeurs-par-defaut';
import { PaletteCouleurService } from './palette-couleur.service';

/* eslint @typescript-eslint/no-explicit-any: "off"*/ // Raison: on en a besoin pour les tests
/* eslint @typescript-eslint/no-magic-numbers: "off"*/

describe('PaletteCouleurService', () => {
    let service: PaletteCouleurService;
    let serviceAffichage: AffichageDessinService;

    let positionSouris: Vec2;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let canvasGradientSpy: CanvasGradient;
    let imageStub: ImageData;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AffichageDessinService],
        });
        service = TestBed.inject(PaletteCouleurService);
        serviceAffichage = TestBed.inject(AffichageDessinService);

        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        positionSouris = { x: 1, y: 1 };
        canvasGradientSpy = ctx.createLinearGradient(0, 0, 0, HAUTEUR_CANVAS_PALETTE);
        imageStub = new ImageData(new Uint8ClampedArray(16), 2, 2);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('dessiner devrait dessiner les six couleurs en dégradée', () => {
        const clearRectSpy = spyOn(ctx, 'clearRect');
        const createLinearGradientSpy = spyOn(ctx, 'createLinearGradient').and.callFake(() => {
            return canvasGradientSpy;
        });
        const addColorStopSpy = spyOn(canvasGradientSpy, 'addColorStop');
        const beginPathSpy = spyOn(ctx, 'beginPath');
        const rectSpy = spyOn(ctx, 'rect');
        const fillSpy = spyOn(ctx, 'fill');
        const closePathSpy = spyOn(ctx, 'closePath');

        service.dessiner(ctx);

        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, LARGEUR_CANVAS_PALETTE, HAUTEUR_CANVAS_PALETTE);
        expect(createLinearGradientSpy).toHaveBeenCalledWith(0, 0, 0, HAUTEUR_CANVAS_PALETTE);
        expect(addColorStopSpy).toHaveBeenCalledWith(0, Palette.Rouge);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(rectSpy).toHaveBeenCalledWith(0, 0, LARGEUR_CANVAS_PALETTE, HAUTEUR_CANVAS_PALETTE);
        expect(fillSpy).toHaveBeenCalled();
        expect(closePathSpy).toHaveBeenCalled();
    });

    it('obtenirCouleurALaPosition devrait appeler etablirCouleur avec la bonne ImageData', () => {
        service.ctxPaletteCouleur = canvas.getContext('2d') as CanvasRenderingContext2D;

        const getImageDataSpy = spyOn(service.ctxPaletteCouleur, 'getImageData').and.callFake(() => {
            return imageStub;
        });
        const obtenirCouleurRgbaSpy = spyOn<any>(service, 'obtenirCouleurRgba').and.callFake(() => {
            return 'rgba(1, 1, 1, 1)';
        });
        const obtenirCouleurRgbaServiceAffichageSpy = spyOn(serviceAffichage, 'etablirCouleur');

        service.obtenirCouleurALaPosition(positionSouris.x, positionSouris.y);

        expect(getImageDataSpy).toHaveBeenCalledWith(positionSouris.x, positionSouris.y, 1, 1);
        expect(obtenirCouleurRgbaSpy).toHaveBeenCalledWith(imageStub.data);
        expect(obtenirCouleurRgbaServiceAffichageSpy).toHaveBeenCalledWith('rgba(1, 1, 1, 1)');
    });

    it('obtenirCouleurRgba() devrait retourner un string de couleurs rgba', () => {
        const donneesImageStub = imageStub.data;
        const couleursAttendue = 'rgba(' + donneesImageStub[0] + ',' + donneesImageStub[1] + ',' + donneesImageStub[2] + ',1)';
        const couleurs = service['obtenirCouleurRgba'](donneesImageStub);
        expect(couleurs).toEqual(couleursAttendue);
    });
});
