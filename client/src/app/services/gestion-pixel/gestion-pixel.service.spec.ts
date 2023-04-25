import { TestBed } from '@angular/core/testing';
import { GestionPixelService } from './gestion-pixel.service';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/

describe('GestionPixelService', () => {
    let service: GestionPixelService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GestionPixelService);
    });

    it('devrait être créer', () => {
        expect(service).toBeTruthy();
    });
    it('getIndexPixel devrait retourner un index valide', () => {
        expect(service.getIndexPixel({ x: 2, y: 3 })).toEqual(7688);
        expect(service.getIndexPixel({ x: 10, y: 5 })).toEqual(12840);
    });
    it('devrait changer la position du pixel en position RGBA', () => {
        const positionRgba: number = service.convertirEnPositionRgbaPixel(2);
        expect(positionRgba).toEqual(8);
    });
    it('devrait convertir la position des couleurs RGBA en position du pixel', () => {
        const positionPixel: number = service.convertirEnPositionPixel(8);
        expect(positionPixel).toEqual(2);
    });
});
