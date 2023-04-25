import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@common/interface/vec2';
import { RegroupementDifferencesService } from './regroupement-differences.service';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint @typescript-eslint/no-magic-numbers: "off"*/
describe('RegroupementDifferencesService', () => {
    let service: RegroupementDifferencesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RegroupementDifferencesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('initialisation devrait se faire correctement', () => {
        const imgData: ImageData = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const matriceDiffE = new Uint8ClampedArray(16);
        const listeDesCoordonneesDiff: Vec2[] = [{ x: 0, y: 1 }];
        service.initialisation(matriceDiffE, listeDesCoordonneesDiff, imgData);
        expect(service['matriceDeDifferencesElargie']).toEqual(matriceDiffE);
        expect(service['listeDesCoordonneesDiff']).toEqual(listeDesCoordonneesDiff);
        expect(service['largeurImage']).toEqual(2);
        expect(service['hauteurImage']).toEqual(2);
    });
    it('regrouperLesDifferences() forme des ensembles de Vec2 à partir de Vec2[]', () => {
        service['listeDesCoordonneesDiff'] = [
            { x: 0, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 1 },
        ];
        const aEteVisiteeStub = spyOn<any>(service, 'aEteVisitee').and.callFake(() => {
            return false;
        });
        const bfsStub = spyOn<any>(service, 'bfs').and.stub();
        service.regrouperLesDifferences();
        expect(aEteVisiteeStub).toHaveBeenCalledTimes(3);
        expect(bfsStub).toHaveBeenCalledTimes(3);
        expect(service['idDifference']).toEqual(3);
    });
    it('obtenirImgDeDifferences() construit et retourne un image data avec les attributs du service', () => {
        service['matriceDeDifferencesElargie'] = new Uint8ClampedArray(16);
        service['largeurImage'] = 2;
        service['hauteurImage'] = 2;
        expect(service.obtenirImgDeDifferences().height).toEqual(2);
        expect(service.obtenirImgDeDifferences().width).toEqual(2);
        expect(service.obtenirImgDeDifferences().data).toEqual(service['matriceDeDifferencesElargie']);
    });
    // it('obtenirNombreDifferences() retourne idDifference', () => {
    //     service['mapDifferencesRegroupees'] = new Map<number, Vec[]>;
    //     expect(service.obtenirNombreDifferences()).toEqual(3);
    // });
    it('obtenirMapDifferences() retourne mapDifferencesRegroupees', () => {
        service['mapDifferencesRegroupees'] = new Map<number, Vec2[]>();
        expect(service.obtenirMapDifferences()).toEqual(service['mapDifferencesRegroupees']);
    });
    it('aEteVisitee() retourne si la coord à déjà été visitée', () => {
        service['largeurImage'] = 640;
        const coord: Vec2 = { x: 1, y: 0 };
        service['matriceDeDifferencesElargie'] = Uint8ClampedArray.from([0, 0, 0, 0, 0, 0, 0, 255]);
        expect(service['aEteVisitee'](coord)).toEqual(true);
    });
    it('transformerCoordEnIndex() retourne un index propre à la coord', () => {
        service['largeurImage'] = 640;
        const coord: Vec2 = { x: 1, y: 0 };
        expect(service['transformerCoordEnIndex'](coord)).toEqual(4);
    });
    it('bfs()', () => {
        const coord = { x: 2, y: 2 } as Vec2;
        const visiterCoordStub = spyOn<any>(service, 'visiterCoord').and.stub();
        const estVisitableStub = spyOn<any>(service, 'estVisitable').and.callFake(() => {
            return true;
        });
        const longueurStub = spyOn<any>(service['fileFIFO'], 'longueur').and.callFake(() => {
            return 0;
        });
        service['bfs'](coord);
        expect(visiterCoordStub).toHaveBeenCalled();
        expect(estVisitableStub).toHaveBeenCalledTimes(4);
        expect(longueurStub).toHaveBeenCalled();
    });
    it('visiterCoord()', () => {
        service['largeurImage'] = 640;
        service['matriceDeDifferencesElargie'] = Uint8ClampedArray.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        service['visiterCoord']({ x: 2, y: 0 });
        expect(service['tableauCoordRegroupees'][0]).toEqual({ x: 2, y: 0 });
        expect(service['mapDifferencesRegroupees'].get(0)).toEqual([{ x: 2, y: 0 }]);
    });
    it('estVisitable()', () => {
        spyOn<any>(service['fileFIFO'], 'contient').and.callFake(() => {
            return false;
        });
        spyOn<any>(service, 'aEteVisitee').and.callFake(() => {
            return false;
        });
        spyOn<any>(service, 'estDansLesDimensions').and.callFake(() => {
            return true;
        });
        expect(service['estVisitable']({ x: 2, y: 0 })).toEqual(true);
    });
    it('estVisitable()', () => {
        service['largeurImage'] = 640;
        service['hauteurImage'] = 480;
        expect(service['estDansLesDimensions']({ x: 2, y: 2 })).toEqual(true);
    });
});
