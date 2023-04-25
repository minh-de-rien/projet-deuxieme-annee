import { Injectable } from '@angular/core';
import { OutilDessin } from '@app/classes/outil-dessin/outil-dessin';
import { CrayonService } from '@app/services/outils-dessin/crayon/crayon.service';
import { EffaceService } from '@app/services/outils-dessin/efface/efface.service';
import { PaletteCouleurService } from '@app/services/outils-dessin/palette-couleur/palette-couleur.service';

@Injectable({
    providedIn: 'root',
})
export class OutilsService {
    outilPrecedent: OutilDessin | undefined;
    outilActuel: OutilDessin | undefined;

    private outils: Map<string, OutilDessin | undefined>;

    constructor(readonly crayonService: CrayonService, readonly effaceService: EffaceService, readonly paletteService: PaletteCouleurService) {
        this.outils = new Map<string, OutilDessin | undefined>([
            ['aucun', undefined],
            ['crayon', crayonService],
            ['efface', effaceService],
        ]);
        this.outilActuel = this.outils.get('aucun');
    }

    sourisClique(evenement: MouseEvent): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisClique(evenement);
    }

    sourisEnfoncee(evenement: MouseEvent, estLeMemeCanvas?: boolean): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisEnfoncee(evenement, estLeMemeCanvas);
    }

    sourisRelachee(): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisRelachee();
    }

    sourisBouge(evenement: MouseEvent): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisBouge(evenement);
    }

    sourisHorsCanvas(): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisHorsCanvas();
    }

    sourisDansCanvas(estLeMemeCanvas?: boolean): void {
        if (this.outilActuel !== undefined) this.outilActuel.sourisDansCanvas(estLeMemeCanvas);
    }

    changerOutil(nomOutil: string): boolean {
        this.outilPrecedent = this.outilActuel;
        const nomOutilActuel = this.outilActuel === undefined ? '' : this.outilActuel.nomOutil;
        if (nomOutil !== nomOutilActuel) {
            this.outilActuel = this.outils.get(nomOutil);
            return true;
        }
        this.outilActuel = this.outils.get('aucun');
        return false;
    }

    etablirEpaisseurOutil(epaisseur: number): void {
        this.outilActuel?.etablirEpaisseurOutil(epaisseur);
    }

    dessiner(ctx: CanvasRenderingContext2D): void {
        this.outilActuel?.dessiner(ctx);
    }
}
