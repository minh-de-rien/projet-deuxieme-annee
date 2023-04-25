/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { InterfaceCadranIndice } from '@common/interface/interface-cadran-indice';
import { Vec2 } from '@common/interface/vec2';

import { GestionIndicesService } from './gestion-indices.service';

const difference: Vec2[] = [{ x: 0, y: 1 }];

describe('GestionIndicesService', () => {
    let service: GestionIndicesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GestionIndicesService);
        difference[0].x = 0;
        difference[0].y = 1;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('etablirIndice devrait retourné le bon cadran', () => {
        const trouverPixelDeReferenceSpy = spyOn<any>(service, 'trouverPixelDeReference').and.callFake(() => {
            return difference[0];
        });
        const calculerLesCoordsDuCoteDuCadranSpy = spyOn<any>(service, 'calculerLesCoordsDuCoteDuCadran').and.callFake(() => {
            return 0;
        });

        const resultat: InterfaceCadranIndice = service.etablirIndice(difference, 1);
        expect(trouverPixelDeReferenceSpy).toHaveBeenCalledWith(difference);
        expect(calculerLesCoordsDuCoteDuCadranSpy).toHaveBeenCalledWith(0, 320);
        expect(calculerLesCoordsDuCoteDuCadranSpy).toHaveBeenCalledWith(1, 240);
        expect(resultat).toEqual({ x: 0, y: 0, largeur: 320, hauteur: 240 });
    });
    it('etablirIndiceSpecial devrait dessiner sur le contexte', () => {
        const trouverPixelDeReferenceSpy = spyOn<any>(service, 'trouverPixelDeReference').and.callFake(() => {
            return difference[0];
        });

        const contexteMock = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData', 'putImageData']);
        contexteMock.getImageData.and.callFake(() => {
            return new ImageData(10, 10);
        });

        service.etablirIndiceSpecial(difference, contexteMock);
        expect(trouverPixelDeReferenceSpy).toHaveBeenCalledWith(difference);
        expect(contexteMock.getImageData).toHaveBeenCalled();
        expect(contexteMock.putImageData).toHaveBeenCalled();
    });
    it('calculerLesCoordsDuCoteDuCadran devrait retourner le bon cadran', () => {
        expect(service['calculerLesCoordsDuCoteDuCadran'](36, 320)).toEqual(0);
    });
    it('trouverPixelDeReference devrait retourner le bon cadran', () => {
        expect(service['trouverPixelDeReference'](difference).x).toEqual(0);
        expect(service['trouverPixelDeReference'](difference).y).toEqual(1);
    });
});
