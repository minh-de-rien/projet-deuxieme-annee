import { TestBed } from '@angular/core/testing';
import { CanvasDessin } from '@common/valeurs-par-defaut';

import { PileLIFOService } from './pile-lifo.service';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('PileLIFOService', () => {
    let service: PileLIFOService;
    let mockImgData: ImageData;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PileLIFOService);
        mockImgData = {} as ImageData;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("empilerHistorique devrait mettre l'imageData et le id d'un canvas dans historique et effacer action annulees", () => {
        (service as any).historique = [];
        spyOn(service, 'effacerActionAnnulees');
        service.empilerHistorique(CanvasDessin.Original, mockImgData);
        expect((service as any).historique[0]).toEqual([CanvasDessin.Original, mockImgData]);
        expect(service.effacerActionAnnulees).toHaveBeenCalled();
    });

    it("depilerHistorique devrait enlever et retourner l'image data et l'id du canvas de l'historique", () => {
        (service as any).historique = [[CanvasDessin.Modifie, mockImgData]];
        const resultat = service.depilerHistorique();
        expect((service as any).historique.length).toEqual(0);
        expect(resultat).toEqual([CanvasDessin.Modifie, mockImgData]);
    });

    it('restaurerHistorique met un element dans historique', () => {
        (service as any).historique = [];
        service.restaurerHistorique(CanvasDessin.Original, mockImgData);
        expect((service as any).historique[0]).toEqual([CanvasDessin.Original, mockImgData]);
    });

    it('empilerActionsAnnulees met un element dans actionsAnnulees', () => {
        (service as any).actionsAnnulees = [];
        service.empilerActionsAnnulees(CanvasDessin.Original, mockImgData);
        expect((service as any).actionsAnnulees[0]).toEqual([CanvasDessin.Original, mockImgData]);
    });

    it("depilerActionsAnnulees devrait enlever et retourner l'image data et l'id du canvas de actionsAnnulees", () => {
        (service as any).actionsAnnulees = [[CanvasDessin.Modifie, mockImgData]];
        const resultat = service.depilerActionsAnnulees();
        expect((service as any).actionsAnnulees.length).toEqual(0);
        expect(resultat).toEqual([CanvasDessin.Modifie, mockImgData]);
    });

    it("effacerActionAnnulees devrait effacer le contenu d'actionAnnulees", () => {
        (service as any).actionsAnnulees = [
            [CanvasDessin.Modifie, mockImgData],
            [CanvasDessin.Original, mockImgData],
        ];
        service.effacerActionAnnulees();
        expect((service as any).actionsAnnulees.length).toEqual(0);
    });
});
