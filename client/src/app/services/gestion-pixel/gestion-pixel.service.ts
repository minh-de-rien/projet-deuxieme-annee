import { Injectable } from '@angular/core';
import { Vec2 } from '@common/interface/vec2';
import { LARGEUR_IMAGE, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class GestionPixelService {
    getIndexPixel(coord: Vec2): number {
        return (coord.y * LARGEUR_IMAGE + coord.x) * NOMBRE_DE_COULEURS_PAR_PIXEL;
    }
    convertirEnPositionPixel(positionRgbaPixel: number): number {
        return Math.floor(positionRgbaPixel / NOMBRE_DE_COULEURS_PAR_PIXEL);
    }
    convertirEnPositionRgbaPixel(positionPixel: number): number {
        return positionPixel * NOMBRE_DE_COULEURS_PAR_PIXEL;
    }
}
