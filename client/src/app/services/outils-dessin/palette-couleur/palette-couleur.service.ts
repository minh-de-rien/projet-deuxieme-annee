import { Injectable } from '@angular/core';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { HAUTEUR_CANVAS_PALETTE, LARGEUR_CANVAS_PALETTE, Palette, PositionCouleur } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class PaletteCouleurService {
    ctxPaletteCouleur: CanvasRenderingContext2D;

    constructor(protected affichageDessinService: AffichageDessinService) {}

    dessiner(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, LARGEUR_CANVAS_PALETTE, HAUTEUR_CANVAS_PALETTE);

        const degradee = ctx.createLinearGradient(0, 0, 0, HAUTEUR_CANVAS_PALETTE);
        degradee.addColorStop(0, Palette.Rouge);
        degradee.addColorStop(PositionCouleur.Jaune, Palette.Jaune);
        degradee.addColorStop(PositionCouleur.Vert, Palette.Vert);
        degradee.addColorStop(PositionCouleur.Cyan, Palette.Cyan);
        degradee.addColorStop(PositionCouleur.Bleu, Palette.Bleu);
        degradee.addColorStop(PositionCouleur.Rose, Palette.Rose);
        degradee.addColorStop(1, Palette.Rouge);

        ctx.beginPath();
        ctx.rect(0, 0, LARGEUR_CANVAS_PALETTE, HAUTEUR_CANVAS_PALETTE);

        ctx.fillStyle = degradee;
        ctx.fill();
        ctx.closePath();
    }

    obtenirCouleurALaPosition(x: number, y: number): void {
        const donneesImage = this.ctxPaletteCouleur.getImageData(x, y, 1, 1).data;
        this.affichageDessinService.etablirCouleur(this.obtenirCouleurRgba(donneesImage));
    }

    private obtenirCouleurRgba(donneesImage: Uint8ClampedArray): string {
        return 'rgba(' + donneesImage[0] + ',' + donneesImage[1] + ',' + donneesImage[2] + ',1)';
    }
}
