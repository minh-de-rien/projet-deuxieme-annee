import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { OutilsService } from '@app/services/outils-dessin/outils/outils.service';
import { PileLIFOService } from '@app/services/pile-lifo/pile-lifo.service';
import { CanvasDessin } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-zone-dessin',
    templateUrl: './zone-dessin.component.html',
    styleUrls: ['./zone-dessin.component.scss'],
})
export class ZoneDessinComponent implements AfterViewInit {
    @Input() statut: CanvasDessin;
    @ViewChild('canvasDessin', { static: false }) private canvasDessin: ElementRef<HTMLCanvasElement>;

    private assistantCanvas: AssistantCanvas;

    constructor(
        private readonly affichageDessinService: AffichageDessinService,
        private readonly outilsService: OutilsService,
        private readonly pileLifoService: PileLIFOService,
    ) {
        this.assistantCanvas = new AssistantCanvas();
    }

    get largeur(): number {
        return this.assistantCanvas.largeur;
    }
    get hauteur(): number {
        return this.assistantCanvas.hauteur;
    }

    ngAfterViewInit(): void {
        if (this.estOriginal()) {
            this.affichageDessinService.ctxDessinOriginal = this.assistantCanvas.creerContexte(this.canvasDessin);
        }
        if (this.estModifie()) {
            this.affichageDessinService.ctxDessinModifie = this.assistantCanvas.creerContexte(this.canvasDessin);
        }
    }

    sourisClique(evenement: MouseEvent): void {
        this.outilsService.sourisClique(evenement);
    }

    sourisEnfoncee(evenement: MouseEvent): void {
        this.affichageDessinService.estCanvasDessinOriginal = this.estOriginal();
        this.outilsService.sourisEnfoncee(evenement, this.estLeMemeCanvas());
        this.emplierHistorique();
    }

    sourisBouge(evenement: MouseEvent): void {
        this.outilsService.sourisBouge(evenement);
    }

    sourisHorsCanvas(): void {
        this.outilsService.sourisHorsCanvas();
    }

    sourisDansCanvas(): void {
        this.outilsService.sourisDansCanvas(this.estLeMemeCanvas());
    }

    private estOriginal(): boolean {
        return this.statut === CanvasDessin.Original;
    }

    private estModifie(): boolean {
        return this.statut === CanvasDessin.Modifie;
    }

    private estLeMemeCanvas(): boolean {
        return (
            this.affichageDessinService.estCanvasDessinOriginal === this.estOriginal() ||
            !this.affichageDessinService.estCanvasDessinOriginal === this.estModifie()
        );
    }

    private emplierHistorique(): void {
        switch (this.statut) {
            case CanvasDessin.Original: {
                this.pileLifoService.empilerHistorique(this.statut, this.affichageDessinService.obtenirImageDataOriginale());
                break;
            }
            case CanvasDessin.Modifie: {
                this.pileLifoService.empilerHistorique(this.statut, this.affichageDessinService.obtenirImageDataModifiee());
                break;
            }
        }
    }
}
