import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@common/interface/vec2';

import { CrayonService } from './crayon.service';

describe('CrayonService', () => {
    let service: CrayonService;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let positionSouris: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CrayonService);

        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        positionSouris = { x: 1, y: 1 };
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('dessiner() ', () => {
        const lineToSpy = spyOn(ctx, 'lineTo');
        const beginPathSpy = spyOn(ctx, 'beginPath');
        const strokeSpy = spyOn(ctx, 'stroke');

        service['cheminPositionsSouris'] = [positionSouris];
        service.dessiner(ctx);

        expect(beginPathSpy).toHaveBeenCalled();
        expect(ctx.lineCap).toEqual('round');
        expect(ctx.lineJoin).toEqual('round');
        expect(lineToSpy).toHaveBeenCalledWith(positionSouris.x, positionSouris.y);
        expect(strokeSpy).toHaveBeenCalled();
    });
});
