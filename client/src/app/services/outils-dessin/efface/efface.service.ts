import { Injectable } from '@angular/core';
import { OutilDessin } from '@app/classes/outil-dessin/outil-dessin';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';

@Injectable({
    providedIn: 'root',
})
export class EffaceService extends OutilDessin {
    constructor(protected affichageDessinService: AffichageDessinService) {
        super(affichageDessinService);
        this.nomOutil = 'efface';
    }

    dessiner(ctx: CanvasRenderingContext2D): void {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        this.cheminPositionsSouris.map((position) => ctx.lineTo(position.x, position.y));
        ctx.stroke();
    }
}
