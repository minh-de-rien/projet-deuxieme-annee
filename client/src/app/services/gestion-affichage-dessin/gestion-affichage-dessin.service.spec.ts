import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanvasDessin } from '@common/valeurs-par-defaut';

import { AffichageDessinService } from './gestion-affichage-dessin.service';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
describe('AffichageDessinService', () => {
    let service: AffichageDessinService;
    let canvas: HTMLCanvasElement;
    let imageStub: ImageData;
    let obtenirImageDataSpy: jasmine.Spy<(ctx: CanvasRenderingContext2D) => ImageData>;
    let dessinerImageDataSpy: jasmine.Spy<(ctx: CanvasRenderingContext2D, imageData: ImageData) => void>;
    let element: [CanvasDessin, ImageData];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AffichageDessinService);

        canvas = document.createElement('canvas');
        service.ctxDessinOriginal = canvas.getContext('2d') as CanvasRenderingContext2D;
        service.ctxDessinModifie = canvas.getContext('2d') as CanvasRenderingContext2D;

        imageStub = new ImageData(new Uint8ClampedArray(16), 2, 2);
        element = [CanvasDessin.Original, imageStub];

        obtenirImageDataSpy = spyOn(service['assistantCanvas'], 'obtenirImageData').and.callFake(() => {
            return imageStub;
        });
        dessinerImageDataSpy = spyOn(service['assistantCanvas'], 'dessinerImageData');
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('etablirCouleur() devrait établir la couleur du crayon sur les 2 canvas', () => {
        service.boutonPalette = { nativeElement: { style: { color: 'black' } } } as unknown as ElementRef<HTMLButtonElement>;
        service.etablirCouleur('#111111');
        expect(service.ctxDessinOriginal.strokeStyle).toEqual('#111111');
        expect(service.ctxDessinModifie.strokeStyle).toEqual('#111111');
        expect(service.boutonPalette.nativeElement.style.color).toEqual('#111111');
    });

    it("etablirEpaisseurOutil() devrait établir l'épaisseur du crayon sur les 2 canvas", () => {
        service.etablirEpaisseurOutil(1);
        expect(service.ctxDessinOriginal.lineWidth).toEqual(1);
        expect(service.ctxDessinModifie.lineWidth).toEqual(1);
    });

    it("effacerCanvasOriginal() et effacerCanvasModifie() devraient appeler viderCanvas d'assistantCanvas", () => {
        const viderCanvasSpy = spyOn(service['assistantCanvas'], 'viderCanvas');
        service.effacerCanvasOriginal();
        expect(viderCanvasSpy).toHaveBeenCalledWith(service.ctxDessinOriginal);

        service.effacerCanvasModifie();
        expect(viderCanvasSpy).toHaveBeenCalledWith(service.ctxDessinModifie);
    });

    it("obtenirImageDataOriginale() et obtenirImageDataModifiee() devraient appeler obtenirImageData d'assistantCanvas", () => {
        service.obtenirImageDataOriginale();
        expect(obtenirImageDataSpy).toHaveBeenCalledWith(service.ctxDessinOriginal);

        service.obtenirImageDataModifiee();
        expect(obtenirImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie);
    });

    it("dupliquerCanvasOriginal() et dupliquerCanvasModifiee() devraient appeler dessinerImageData d'assistantCanvas", () => {
        service.dupliquerCanvasOriginal();
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinOriginal, imageStub);

        service.dupliquerCanvasModifiee();
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);
    });

    it("intervertirAvantPlan() devrait appeler dessinerImageData d'assistantCanvas", () => {
        service.intervertirAvantPlan();
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinOriginal, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);
    });

    it("annuler() devrait appeler dessinerImageData() et restaurerHistorique() d'assistanCanvas selon le type de canvas", () => {
        const empilerActionsAnnuleesSpy = spyOn(service['pileLifoService'], 'empilerActionsAnnulees');
        service.annuler(element);
        expect(empilerActionsAnnuleesSpy).toHaveBeenCalledWith(CanvasDessin.Original, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinOriginal, imageStub);

        element = [CanvasDessin.Modifie, imageStub];
        service.annuler(element);
        expect(empilerActionsAnnuleesSpy).toHaveBeenCalledWith(CanvasDessin.Modifie, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);

        element = [CanvasDessin.ModifieInterverti, imageStub];
        const depilerHistoriqueSpy = spyOn(service['pileLifoService'], 'depilerHistorique').and.callFake(() => {
            return element;
        });
        service.annuler(element);
        expect(empilerActionsAnnuleesSpy).toHaveBeenCalledWith(CanvasDessin.OriginalInterverti, imageStub);
        expect(empilerActionsAnnuleesSpy).toHaveBeenCalledWith(CanvasDessin.ModifieInterverti, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);
        expect(depilerHistoriqueSpy).toHaveBeenCalled();
    });

    it("refaire() devrait appeler dessinerImageData() et restaurerHistorique() d'assistanCanvas selon le type de canvas", () => {
        const restaurerHistoriqueSpy = spyOn(service['pileLifoService'], 'restaurerHistorique');
        service.refaire(element);
        expect(restaurerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.Original, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinOriginal, imageStub);

        element = [CanvasDessin.Modifie, imageStub];
        service.refaire(element);
        expect(restaurerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.Modifie, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);

        const depilerActionsAnnulees = spyOn(service['pileLifoService'], 'depilerActionsAnnulees').and.callFake(() => {
            return element;
        });
        element = [CanvasDessin.ModifieInterverti, imageStub];
        service.refaire(element);
        expect(restaurerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.OriginalInterverti, imageStub);
        expect(restaurerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.ModifieInterverti, imageStub);
        expect(dessinerImageDataSpy).toHaveBeenCalledWith(service.ctxDessinModifie, imageStub);
        expect(depilerActionsAnnulees).toHaveBeenCalled();
    });
});
