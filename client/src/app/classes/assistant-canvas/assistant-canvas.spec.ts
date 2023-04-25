import { TestBed } from '@angular/core/testing';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { COULEUR_NOIR, HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
describe('AssistantCanvas', () => {
    let assistantCanvas: AssistantCanvas;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        assistantCanvas = TestBed.inject(AssistantCanvas);
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('devrait être créé', () => {
        expect(assistantCanvas).toBeTruthy();
    });

    it('creerCanvas devrait créer un HTMLCanvasElement avec les bonnes dimensions', () => {
        const largeur = 15;
        const hauteur = 25;
        // eslint-disable-next-line -- createCanvas is private and we need access for the test
        const canvas = AssistantCanvas.creerCanvas(largeur, hauteur);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(largeur);
        expect(canvas.height).toBe(hauteur);
    });

    it('creerContexte() devrait retourner une valeur de type CanvasRenderingContext2D', () => {
        const canvasTest = { nativeElement: jasmine.createSpyObj('nativeElement', ['getContext']) };
        const contexte = assistantCanvas.creerContexte(canvasTest);
        expect(contexte).toEqual(canvasTest.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D);
    });

    it('viderCanvas devrait appeler clearRect sur le contexte', () => {
        const clearRectSpy = spyOn(ctx, 'clearRect');
        assistantCanvas.viderCanvas(ctx);
        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });

    it('obtenirImageData devrait appeler getImageData sur le contexte', () => {
        const getImageDataSpy = spyOn(ctx, 'getImageData');
        assistantCanvas.obtenirImageData(ctx);
        expect(getImageDataSpy).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });

    it('dessinerImageData devrait appeler putImageData sur le contexte', () => {
        const imageDataTest = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const putImageDataSpy = spyOn(ctx, 'putImageData');

        assistantCanvas.dessinerImageData(ctx, imageDataTest);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('dessinerPixel devrait mettre le pixel de la bonne couleur', () => {
        const imageDataTest = new ImageData(new Uint8ClampedArray(16), 2, 2);
        assistantCanvas.dessinerPixel(imageDataTest, 0, COULEUR_NOIR);
        expect(imageDataTest.data[0]).toEqual(COULEUR_NOIR.R);
        expect(imageDataTest.data[1]).toEqual(COULEUR_NOIR.G);
        expect(imageDataTest.data[2]).toEqual(COULEUR_NOIR.B);
        expect(imageDataTest.data[3]).toEqual(COULEUR_NOIR.A);
    });
});
