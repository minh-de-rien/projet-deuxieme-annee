import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { PaletteCouleurService } from '@app/services/outils-dessin/palette-couleur/palette-couleur.service';
import { Vec2 } from '@common/interface/vec2';
import { HAUTEUR_CANVAS_PALETTE, LARGEUR_CANVAS_PALETTE } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-palette-couleur',
    templateUrl: './palette-couleur.component.html',
    styleUrls: ['./palette-couleur.component.scss'],
})
export class PaletteCouleurComponent implements AfterViewInit {
    @ViewChild('canvasPaletteCouleur', { static: false }) private canvasPaletteCouleur: ElementRef<HTMLCanvasElement>;

    private tailleCanvas: Vec2 = { x: LARGEUR_CANVAS_PALETTE, y: HAUTEUR_CANVAS_PALETTE };
    private assistantCanvas: AssistantCanvas;

    constructor(private readonly paletteService: PaletteCouleurService) {
        this.assistantCanvas = new AssistantCanvas();
    }

    get largeur(): number {
        return this.tailleCanvas.x;
    }
    get hauteur(): number {
        return this.tailleCanvas.y;
    }

    ngAfterViewInit(): void {
        this.paletteService.ctxPaletteCouleur = this.assistantCanvas.creerContexte(this.canvasPaletteCouleur);
        this.paletteService.dessiner(this.paletteService.ctxPaletteCouleur);
    }

    sourisRelachee(evenement: MouseEvent): void {
        this.etablirCouleur(evenement);
    }

    etablirCouleur(evenement: MouseEvent): void {
        this.paletteService.obtenirCouleurALaPosition(evenement.offsetX, evenement.offsetY);
    }
}
