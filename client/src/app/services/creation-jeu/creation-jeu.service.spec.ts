import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { CreationJeuService } from '@app/services/creation-jeu/creation-jeu.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { BORNE_INF_TAILLE_FICHIER_POUR_BPP_24, HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';
import { Subject } from 'rxjs';
import SpyObj = jasmine.SpyObj;
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('CreationJeuService', () => {
    let service: CreationJeuService;
    let communicationService: CommunicationService;
    let socketService: GestionSocketClientService;
    let mockFichier: File;
    let mockImgBmp: ImageBitmap;
    let mockCtx: SpyObj<CanvasRenderingContext2D>;
    const routerSpy = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, BrowserAnimationsModule],
            providers: [{ provide: CreationJeuService }, CommunicationService, GestionSocketClientService, { provide: Router, useValue: routerSpy }],
            schemas: [NO_ERRORS_SCHEMA],
        });
        service = TestBed.inject(CreationJeuService);
        communicationService = TestBed.inject(CommunicationService);
        socketService = TestBed.inject(GestionSocketClientService);
    });
    beforeEach(() => {
        mockFichier = new File([''], 'fichierTest');
        mockImgBmp = {} as ImageBitmap;
        mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', ['clearRect', 'drawImage', 'fillRect']);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('la méthode reinitialisationFormulaire devrait réinitialiser le formulaire entré en paramètre', () => {
        const mockFormulaire = jasmine.createSpyObj('HTMLFormElement', ['reset']);
        const elementRefMock = { nativeElement: mockFormulaire };
        service.reinitialisationFormulaire(elementRefMock);
        expect(mockFormulaire.reset).toHaveBeenCalled();
    });

    it('la méthode reinitialisationUneImg efface le canvas entré en paramètre', () => {
        const mockRefCanvas = {} as ElementRef<HTMLCanvasElement>;
        spyOn(service, 'obtenirContexteDeRefCanvas').and.returnValue(mockCtx);
        service.reinitialisationUneImg(mockRefCanvas);
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });

    it('dessinerCanvasValeurParDefaut rempli un canvas en blanc', () => {
        const mockRefCanvas = {} as ElementRef<HTMLCanvasElement>;
        mockCtx.fillStyle = 'black';
        spyOn(service, 'obtenirContexteDeRefCanvas').and.returnValue(mockCtx);
        service.dessinerCanvasValeurParDefaut(mockRefCanvas);
        expect(mockCtx.fillStyle).toEqual('white');
        expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, LARGEUR_IMAGE, HAUTEUR_IMAGE);
    });

    it('la méthode verification retourne vrai si le nombre de bpp et les dimensions sont ok', () => {
        const spyVerifTaille = spyOn<any>(service, 'verificationTaille').and.returnValue(true);
        const spyVerifDimension = spyOn<any>(service, 'verificationDimension').and.returnValue(true);
        expect(service.verification(mockFichier, mockImgBmp)).toEqual(true);
        spyVerifTaille.and.returnValue(false);
        spyVerifDimension.and.returnValue(false);
        expect(service.verification(mockFichier, mockImgBmp)).toEqual(false);
    });

    it('la méthode televersementDeuxZones devrait appeler generationImage deux fois', (done) => {
        const mockRefCanvasOriginal = {} as ElementRef<HTMLCanvasElement>;
        const mockRefCanvasModifie = {} as ElementRef<HTMLCanvasElement>;
        spyOn(service, 'verification').and.returnValue(true);
        const spy = spyOn(window, 'createImageBitmap').and.returnValue(Promise.resolve(mockImgBmp));
        spyOn<any>(service, 'generationImage');
        service.televersementDeuxZones(mockRefCanvasOriginal, mockRefCanvasModifie, mockFichier);
        spy.calls.mostRecent().returnValue.then(() => {
            expect((service as any).generationImage).toHaveBeenCalledWith(mockImgBmp, mockRefCanvasOriginal);
            expect((service as any).generationImage).toHaveBeenCalledWith(mockImgBmp, mockRefCanvasModifie);
            done();
        });
    });

    it('la méthode televersementUneZone devrait appeler generationImage', (done) => {
        const mockRefCanvas = {} as ElementRef<HTMLCanvasElement>;
        spyOn(service, 'verification').and.returnValue(true);
        const spy = spyOn(window, 'createImageBitmap').and.returnValue(Promise.resolve(mockImgBmp));
        spyOn<any>(service, 'generationImage');
        service.televersementUneZone(mockRefCanvas, mockFichier);
        spy.calls.mostRecent().returnValue.then(() => {
            expect((service as any).generationImage).toHaveBeenCalledWith(mockImgBmp, mockRefCanvas);
            done();
        });
    });

    it('enregistrementServeur devrait enregistrer une image sur le serveur ou ne rien faire le cas échéant', async () => {
        const mapMock = new Map<number, Vec2[]>();
        mapMock.set(1, [{ x: 1, y: 1 }]);
        const arrayMock = new Uint8ClampedArray(2);
        arrayMock[0] = 1;
        const mockBlob = {} as Blob;
        const valeursMock: [Blob, Blob] = [mockBlob, mockBlob];
        const mockInterface = {} as InterfaceJeux;
        const mockObservable = new Subject<InterfaceJeux>();
        spyOn(service, 'enregistrementBlobOriginalEnFichier').and.returnValue(mockFichier);
        spyOn(service, 'enregistrementBlobModifieEnFichier').and.returnValue(mockFichier);
        spyOn(communicationService, 'envoyerJeuAuServeur').and.callFake(() => {
            return mockObservable;
        });
        spyOn(socketService, 'send').and.callFake(() => {
            return;
        });
        await service.enregistrementServeur(mapMock, arrayMock, valeursMock);
        expect(service.enregistrementBlobOriginalEnFichier).toHaveBeenCalledWith(mockBlob);
        expect(service.enregistrementBlobModifieEnFichier).toHaveBeenCalledWith(mockBlob);
        mockObservable.next(mockInterface);
        expect(socketService.send).toHaveBeenCalledWith('chargerNouveauxJeux');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('la méthode verificationNom devrait retourner faux si un nom incorrect a été rentré ou retourner vrai si le nom est valide', () => {
        spyOn<any>(service, 'ouvrirSnackBar');
        const verificationNomSpy = service.verificationNom('');
        expect(verificationNomSpy).toBeFalsy();
        expect(service.verificationNom('Thomas')).toBeTruthy();
        spyOn<any>(service, 'estPresentDansLaListe').and.returnValue(true);
        expect(service.verificationNom('mark')).toBeFalsy();
    });

    it("la méthode verificationNbrDifference devrait être fausse si les images n'ont pas un bon nombre de différences et vrai le cas échéant", () => {
        const nbrDifference1 = 1;
        expect(service.verificationNbrDifference(nbrDifference1)).toBeFalsy();
        const nbrDifference2 = 5;
        expect(service.verificationNbrDifference(nbrDifference2)).toBeTruthy();
    });

    it("la fonction fusionImageData devrait prendre les pixel non transparent de l'avantPlan et les mettre sur l'arrierePlan", () => {
        const mockArrierePlan = { data: { length: 5 } } as ImageData;
        const mockAvantPlan = {} as ImageData;
        spyOn<any>(service, 'pixelEstTransparent').and.returnValue(false);
        spyOn<any>(service, 'transfertPixelImageData').and.stub();
        service.fusionImageData(mockArrierePlan, mockAvantPlan);
        expect((service as any).transfertPixelImageData).toHaveBeenCalledWith(mockArrierePlan, mockAvantPlan, 0);
    });

    it("obtenirContexteDeRefCanvas retourne le contexte à partir d'un  ElementRef<HTMLCanvasElement>", () => {
        const mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);
        mockCanvas.getContext.and.returnValue(mockCtx);
        const elementRefMock = { nativeElement: mockCanvas } as ElementRef<HTMLCanvasElement>;
        expect(service.obtenirContexteDeRefCanvas(elementRefMock)).toEqual(mockCtx);
    });

    it('la fonction transformationCanvasEnBlob devrait transformer la reference de canvas en blob', (done) => {
        const mockCanvas = {} as HTMLCanvasElement;
        const blobTest = new Blob();
        mockCanvas.toBlob = (cb) => {
            const blob = blobTest;
            cb(blob);
        };
        spyOn(mockCanvas, 'toBlob').and.callThrough();
        const elementRefMock = { nativeElement: mockCanvas };
        const blobResultat = service.transformationCanvasEnBlob(elementRefMock);
        blobResultat.then(() => {
            expect(mockCanvas.toBlob).toHaveBeenCalled();
            done();
        });
    });

    it("enregistrementBlobOriginalEnFichier et enregistrementBlobModifieEnFichier devrait cree un fichier à partir d'un blob", () => {
        const mockBlob = {} as Blob;
        spyOn(window, 'File').and.returnValue(mockFichier);
        service.nomJeu = 'test';
        service.enregistrementBlobOriginalEnFichier(mockBlob);
        expect(window.File).toHaveBeenCalledWith([mockBlob], 'test_O.bmp');
        service.enregistrementBlobModifieEnFichier(mockBlob);
        expect(window.File).toHaveBeenCalledWith([mockBlob], 'test_M.bmp');
    });

    it('la méthode verificationTaille retourne faux si la taille du fichier est trop gros ou trop petit et vrai dans le cas échéant', () => {
        Object.defineProperty(mockFichier, 'size', { value: BORNE_INF_TAILLE_FICHIER_POUR_BPP_24 - 1, configurable: true });
        expect((service as any).verificationTaille(mockFichier)).toEqual(false);
    });

    it("la méthode verificationDimension retourne vrai si la hauteur et la largeur sont bonnes ou faux si ce n'est pas le cas", () => {
        Object.defineProperty(mockImgBmp, 'width', { value: LARGEUR_IMAGE, configurable: true });
        Object.defineProperty(mockImgBmp, 'height', { value: HAUTEUR_IMAGE, configurable: true });
        expect((service as any).verificationDimension(mockImgBmp)).toEqual(true);
        Object.defineProperty(mockImgBmp, 'width', { value: LARGEUR_IMAGE + 1, configurable: true });
        Object.defineProperty(mockImgBmp, 'height', { value: HAUTEUR_IMAGE + 1, configurable: true });
        expect((service as any).verificationDimension(mockImgBmp)).toEqual(false);
    });

    it("la méthode generationImage devrait dessiner l'image dans le canvas entré en paramètre", () => {
        const mockRefCanvas = {} as ElementRef<HTMLCanvasElement>;
        spyOn(service, 'obtenirContexteDeRefCanvas').and.returnValue(mockCtx);
        (service as any).generationImage(mockImgBmp, mockRefCanvas);
        expect(mockCtx.drawImage).toHaveBeenCalled();
    });

    it("pixelEstTransparent verifie si le pixel de l'imageData est transparent", () => {
        const mockArray = [0, 0, 0, 0] as unknown as Uint8ClampedArray;
        const mockImgData = { data: mockArray } as ImageData;
        expect((service as any).pixelEstTransparent(mockImgData, 0)).toEqual(true);
    });

    it('transfertPixelImageData transfert un pixel entre 2 imageData', () => {
        const mockArrayModifie = [0, 0, 0] as unknown as Uint8ClampedArray;
        const mockImgDataModifie = { data: mockArrayModifie } as ImageData;
        const mockArrayTransfere = [1, 0, 3] as unknown as Uint8ClampedArray;
        const mockImgDataTransfere = { data: mockArrayTransfere } as ImageData;
        (service as any).transfertPixelImageData(mockImgDataModifie, mockImgDataTransfere, 0);
        expect(mockArrayModifie).toEqual(mockArrayTransfere);
    });
});
