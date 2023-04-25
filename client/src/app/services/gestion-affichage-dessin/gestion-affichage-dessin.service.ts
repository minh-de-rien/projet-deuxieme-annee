import { ElementRef, Injectable } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { PileLIFOService } from '@app/services/pile-lifo/pile-lifo.service';
import { CanvasDessin } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class AffichageDessinService {
    ctxDessinOriginal: CanvasRenderingContext2D;
    ctxDessinModifie: CanvasRenderingContext2D;
    estCanvasDessinOriginal: boolean;
    boutonPalette: ElementRef<HTMLButtonElement>;

    private assistantCanvas = new AssistantCanvas();
    constructor(private pileLifoService: PileLIFOService) {}

    etablirCouleur(couleur: string): void {
        this.ctxDessinOriginal.strokeStyle = couleur;
        this.ctxDessinModifie.strokeStyle = couleur;
        this.boutonPalette.nativeElement.style.color = couleur;
    }

    etablirEpaisseurOutil(epaisseur: number): void {
        this.ctxDessinOriginal.lineWidth = epaisseur;
        this.ctxDessinModifie.lineWidth = epaisseur;
    }

    effacerCanvasOriginal(): void {
        this.assistantCanvas.viderCanvas(this.ctxDessinOriginal);
    }

    effacerCanvasModifie(): void {
        this.assistantCanvas.viderCanvas(this.ctxDessinModifie);
    }

    obtenirImageDataOriginale(): ImageData {
        return this.assistantCanvas.obtenirImageData(this.ctxDessinOriginal);
    }

    obtenirImageDataModifiee(): ImageData {
        return this.assistantCanvas.obtenirImageData(this.ctxDessinModifie);
    }

    dupliquerCanvasOriginal(): void {
        const imageDataOriginal = this.assistantCanvas.obtenirImageData(this.ctxDessinOriginal);
        this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, imageDataOriginal);
    }

    dupliquerCanvasModifiee(): void {
        const imageDataModifiee = this.assistantCanvas.obtenirImageData(this.ctxDessinModifie);
        this.assistantCanvas.dessinerImageData(this.ctxDessinOriginal, imageDataModifiee);
    }

    intervertirAvantPlan(): void {
        const imageDataOriginal = this.assistantCanvas.obtenirImageData(this.ctxDessinOriginal);
        const imageDataModifiee = this.assistantCanvas.obtenirImageData(this.ctxDessinModifie);
        this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, imageDataOriginal);
        this.assistantCanvas.dessinerImageData(this.ctxDessinOriginal, imageDataModifiee);
    }

    annuler(element: [CanvasDessin, ImageData] | undefined): void {
        if (element !== undefined) {
            switch (element[0]) {
                case CanvasDessin.Original: {
                    this.pileLifoService.empilerActionsAnnulees(element[0], this.obtenirImageDataOriginale());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinOriginal, element[1]);
                    break;
                }
                case CanvasDessin.Modifie: {
                    this.pileLifoService.empilerActionsAnnulees(element[0], this.obtenirImageDataModifiee());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, element[1]);
                    break;
                }
                case CanvasDessin.ModifieInterverti: {
                    this.pileLifoService.empilerActionsAnnulees(CanvasDessin.OriginalInterverti, this.obtenirImageDataOriginale());
                    this.pileLifoService.empilerActionsAnnulees(CanvasDessin.ModifieInterverti, this.obtenirImageDataModifiee());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, element[1]);
                    this.assistantCanvas.dessinerImageData(
                        this.ctxDessinOriginal,
                        (this.pileLifoService.depilerHistorique() as [CanvasDessin, ImageData])[1],
                    );
                    break;
                }
            }
        }
    }
    refaire(element: [CanvasDessin, ImageData] | undefined): void {
        if (element !== undefined) {
            switch (element[0]) {
                case CanvasDessin.Original: {
                    this.pileLifoService.restaurerHistorique(element[0], this.obtenirImageDataOriginale());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinOriginal, element[1]);
                    break;
                }
                case CanvasDessin.Modifie: {
                    this.pileLifoService.restaurerHistorique(element[0], this.obtenirImageDataModifiee());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, element[1]);
                    break;
                }
                case CanvasDessin.ModifieInterverti: {
                    this.pileLifoService.restaurerHistorique(CanvasDessin.OriginalInterverti, this.obtenirImageDataOriginale());
                    this.pileLifoService.restaurerHistorique(CanvasDessin.ModifieInterverti, this.obtenirImageDataModifiee());
                    this.assistantCanvas.dessinerImageData(this.ctxDessinModifie, element[1]);
                    this.assistantCanvas.dessinerImageData(
                        this.ctxDessinOriginal,
                        (this.pileLifoService.depilerActionsAnnulees() as [CanvasDessin, ImageData])[1],
                    );
                    break;
                }
            }
        }
    }
}
