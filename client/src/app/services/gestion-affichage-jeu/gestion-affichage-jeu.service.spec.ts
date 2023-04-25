import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { GestionPixelService } from '@app/services/gestion-pixel/gestion-pixel.service';
import { InterfaceCadranIndice } from '@common/interface/interface-cadran-indice';
import { Vec2 } from '@common/interface/vec2';
import { HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';
import { GestionAffichageJeuService } from './gestion-affichage-jeu.service';

const difference = [
    { x: 23, y: 43 },
    { x: 50, y: 3 },
    { x: 68, y: 4 },
] as Vec2[];
/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/

describe('GestionAffichageJeuService', () => {
    let service: GestionAffichageJeuService;
    let ctxStub: CanvasRenderingContext2D;
    let gestionPixelService: GestionPixelService;

    const LARGEUR_CANVAS = 640;
    const HAUTEUR_CANVAS = 480;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GestionPixelService],
        });
        service = TestBed.inject(GestionAffichageJeuService);
        ctxStub = AssistantCanvas.creerCanvas(LARGEUR_CANVAS, HAUTEUR_CANVAS).getContext('2d') as CanvasRenderingContext2D;
        service.contexteImageOriginaleBot = ctxStub;
        gestionPixelService = TestBed.inject(GestionPixelService);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('mettreAJourImageModifiee devrait mettre un ImageData dans le contexte modifiee', () => {
        const mockImgData = {} as ImageData;
        const mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);

        service.contexteImageModifieeBot = mockCtx;
        service.mettreAJourImageModifiee(mockImgData);
        expect(service.contexteImageModifieeBot.putImageData).toHaveBeenCalled();
    });
    it('recupererImageDataModifiee devrait recupérer un ImageData dans le contexte modifiee', () => {
        const mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        service.contexteImageModifieeBot = mockCtx;

        service.recupererImageDataModifiee();
        expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });
    it('recupererImageDataOriginale devrait recupérer un ImageData dans le contexte originale', () => {
        const mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        service.contexteImageOriginaleBot = mockCtx;

        service.recupererImageDataOriginale();
        expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });
    it('la méthode afficheErreur devrait appeler ecrireMotErreur dans le contexte du canvas originale et verouiller les clics', () => {
        const coord = { x: 23, y: 43 } as Vec2;
        const isOriginal = true;

        spyOn<any>(service, 'ecrireMotErreur').and.stub();
        service.afficheErreur(coord, isOriginal);

        expect(service.clicsDeverouilles).toEqual(false);
        expect((service as any).ecrireMotErreur).toHaveBeenCalledWith(service.contexteImageOriginaleBot, coord);
    });
    it('la méthode afficheErreur devrait appeler ecrireMotErreur dans le contexte du canvas modifiee et verouiller les clics', () => {
        const coord = { x: 23, y: 43 } as Vec2;
        const isOriginal = false;

        spyOn<any>(service, 'ecrireMotErreur').and.stub();
        service.afficheErreur(coord, isOriginal);

        expect(service.clicsDeverouilles).toEqual(false);
        expect((service as any).ecrireMotErreur).toHaveBeenCalledWith(service.contexteImageModifieeBot, coord);
    });
    it('updateMasque modifie correctement les masques (canvas superposés qui permettent le clignotement)', () => {
        const mockImgData = new ImageData(10, 10);

        const mockMasqueOriginal = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'clearRect', 'putImageData']);
        service.contexteImageOriginaleTop = mockMasqueOriginal;
        mockMasqueOriginal.getImageData.and.callFake(() => {
            return mockImgData;
        });
        const mockMasqueModifiee = jasmine.createSpyObj('CanvasRenderingContext2D', ['clearRect', 'putImageData']);
        service.contexteImageModifieeTop = mockMasqueModifiee;

        spyOn(gestionPixelService, 'getIndexPixel').and.callFake(() => {
            return 1;
        });

        service.updateMasques(difference);
        expect(mockMasqueOriginal.clearRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(mockMasqueModifiee.clearRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(mockMasqueOriginal.getImageData).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(gestionPixelService.getIndexPixel).toHaveBeenCalledTimes(3);
        expect(mockMasqueModifiee.putImageData).toHaveBeenCalledWith(mockImgData, 0, 0);
        expect(mockMasqueOriginal.putImageData).toHaveBeenCalledWith(mockImgData, 0, 0);
    });
    it('debutClignotement devrait remettre le compteur de clignotement à 0 et partir le clignotement', () => {
        spyOn<any>(service, 'clignotement').and.stub();
        service.debutClignotement();
        expect(service.compteurClignotement).toEqual(0);
        expect((service as any).clignotement).toHaveBeenCalled();
    });
    it('le clignotement devrait fonctionner correctement', fakeAsync(() => {
        const mockCanvas = {} as HTMLCanvasElement;
        mockCanvas.hidden = true;
        const mockCtx = { canvas: mockCanvas } as CanvasRenderingContext2D;

        service.contexteImageModifieeTop = mockCtx;
        service.contexteImageOriginaleTop = mockCtx;
        service.compteurClignotement = 3;

        spyOn(window, 'clearInterval').and.callThrough();
        (service as any).clignotement();
        tick(100);
        expect(service.contexteImageOriginaleTop.canvas.hidden).toEqual(false);
        expect(service.contexteImageModifieeTop.canvas.hidden).toEqual(false);
        tick(100);
        expect(service.contexteImageOriginaleTop.canvas.hidden).toEqual(true);
        expect(service.contexteImageModifieeTop.canvas.hidden).toEqual(true);
        tick(100);
        expect(service.compteurClignotement).toEqual(0);
        expect(service.contexteImageOriginaleTop.canvas.hidden).toEqual(true);
        expect(service.contexteImageModifieeTop.canvas.hidden).toEqual(true);
        expect(window.clearInterval).toHaveBeenCalled();
    }));
    it('afficherCadranIndice devrait mettre un cadran sur le contexte', () => {
        const cadran: InterfaceCadranIndice = {
            x: 0,
            y: 0,
            largeur: 10,
            hauteur: 10,
        };
        const mockMasqueOriginal = jasmine.createSpyObj('CanvasRenderingContext2D', ['clearRect', 'fillRect']);
        service.contexteImageOriginaleTop = mockMasqueOriginal;

        const mockMasqueModifiee = jasmine.createSpyObj('CanvasRenderingContext2D', ['clearRect', 'fillRect']);
        service.contexteImageModifieeTop = mockMasqueModifiee;
        const debutClignotementSpy = spyOn(service, 'debutClignotement');

        service.afficherCadranIndice(cadran);
        expect(mockMasqueOriginal.clearRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(mockMasqueModifiee.clearRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(mockMasqueModifiee.fillRect).toHaveBeenCalledWith(cadran.x, cadran.y, cadran.largeur, cadran.hauteur);
        expect(mockMasqueOriginal.fillRect).toHaveBeenCalledWith(cadran.x, cadran.y, cadran.largeur, cadran.hauteur);
        expect(debutClignotementSpy).toHaveBeenCalled();
    });
    it('afficherDifferenceTrouvee devrait appeler updateMasque, updateImage, et debutClignotement', () => {
        const debutClignotementSpy = spyOn(service, 'debutClignotement');
        const updateMasquesSpy = spyOn<any>(service, 'updateMasques');
        const updateImageSpy = spyOn<any>(service, 'updateImage');

        service.afficherDifferenceTrouvee(difference);
        expect(debutClignotementSpy).toHaveBeenCalled();
        expect(updateMasquesSpy).toHaveBeenCalledWith(difference);
        expect(updateImageSpy).toHaveBeenCalledWith(difference);
    });
    it('miseAJourCanvasTriche met le tableau de regroupement reçu en paramètre dans les canvas', () => {
        const tableauRegroupementsMock = [
            [
                { x: 30, y: 43 },
                { x: 31, y: 43 },
            ],
            [
                { x: 23, y: 43 },
                { x: 24, y: 43 },
            ],
        ] as Vec2[][];
        const mockContext = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'clearRect', 'putImageData']);
        service.contexteImageOriginaleTriche = mockContext;
        service.contexteImageModifieeTriche = mockContext;
        const mockImgData = new ImageData(480, 640);
        mockContext.getImageData.and.callFake(() => {
            return mockImgData;
        });
        (service as any).miseAJourCanvasTriche(tableauRegroupementsMock);
        expect(mockContext.putImageData).toHaveBeenCalledWith(mockImgData, 0, 0);
    });
    it('updateImage() devraitmettre à jour image modifiee', () => {
        const imageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        spyOn(service, 'recupererImageDataModifiee').and.callFake(() => {
            return imageData;
        });
        spyOn(service, 'recupererImageDataOriginale').and.callFake(() => {
            return imageData;
        });
        const transfertPixelSpy = spyOn<any>(service, 'transfertPixel');
        const mettreAJourImageModifieeSpy = spyOn<any>(service, 'mettreAJourImageModifiee');

        service['updateImage']([{ x: 3, y: 4 }]);
        expect(service.recupererImageDataModifiee).toHaveBeenCalled();
        expect(service.recupererImageDataOriginale).toHaveBeenCalled();

        expect(transfertPixelSpy).toHaveBeenCalledTimes(1);
        expect(mettreAJourImageModifieeSpy).toHaveBeenCalledWith(imageData);
    });
    it("transfertPixel() devrait transférer le pixel de l'image originale à modifiée", () => {
        service['imageModifiee'] = new ImageData(Uint8ClampedArray.from([0, 0, 0, 0, 0, 0, 0, 0]), 1, 2);
        service['imageOriginale'] = new ImageData(Uint8ClampedArray.from([1, 1, 1, 0, 0, 0, 0, 0]), 1, 2);
        service['transfertPixel'](0);
        expect(service['imageModifiee'].data).toEqual(service['imageOriginale'].data);
    });
    it('ecrireMotErreur devrait ecrire un message à une coordonnée spécifique et verouiller les clics pendant 1 seconde', fakeAsync(() => {
        const mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'fillText', 'putImageData']);
        const mockImgData = {} as ImageData;
        mockCtx.getImageData.and.callFake(() => {
            return mockImgData;
        });
        mockCtx.fillText.and.stub();

        const coord = { x: 23, y: 43 } as Vec2;
        (service as any).ecrireMotErreur(mockCtx, coord);
        tick(1000);

        expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
        expect(mockCtx.font).toEqual('bold 12px verdana');
        expect(mockCtx.fillStyle).toEqual('#ff0000');
        expect(mockCtx.fillText).toHaveBeenCalledWith('ERREUR', -17, 43);
        expect(mockCtx.putImageData).toHaveBeenCalledWith(mockImgData, 0, 0);
        expect(service.clicsDeverouilles).toEqual(true);
    }));
    it('clignotementCanvasTriche fait clignoter le canvas triche, desactivationClignotementTriche arrete le clignotement', fakeAsync(() => {
        const mockCanvas = {} as HTMLCanvasElement;
        mockCanvas.hidden = true;
        const mockCtx = { canvas: mockCanvas } as CanvasRenderingContext2D;
        service.contexteImageOriginaleTriche = mockCtx;
        service.contexteImageModifieeTriche = mockCtx;
        service.clignotementCanvasTriche();
        tick(125);
        expect(service.contexteImageOriginaleTriche.canvas.hidden).toEqual(false);
        expect(service.contexteImageModifieeTriche.canvas.hidden).toEqual(false);
        tick(125);
        expect(service.contexteImageOriginaleTriche.canvas.hidden).toEqual(true);
        expect(service.contexteImageModifieeTriche.canvas.hidden).toEqual(true);
        spyOn(window, 'clearInterval').and.callThrough();
        service.desactivationClignotementTriche();
        expect(window.clearInterval).toHaveBeenCalled();
    }));
});
