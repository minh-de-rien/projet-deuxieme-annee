import { Injectable } from '@angular/core';
import { CanvasDessin } from '@common/valeurs-par-defaut';
@Injectable({
    providedIn: 'root',
})
export class PileLIFOService {
    private historique: [CanvasDessin, ImageData][] = [];
    private actionsAnnulees: [CanvasDessin, ImageData][] = [];

    empilerHistorique(idAvantPlan: CanvasDessin, elem: ImageData): void {
        if (Object.values(CanvasDessin).includes(idAvantPlan)) {
            this.historique.push([idAvantPlan, elem]);
            this.effacerActionAnnulees();
        }
    }

    depilerHistorique(): [CanvasDessin, ImageData] | undefined {
        return this.historique.pop();
    }

    restaurerHistorique(idAvantPlan: CanvasDessin, elem: ImageData): void {
        if (Object.values(CanvasDessin).includes(idAvantPlan)) {
            this.historique.push([idAvantPlan, elem]);
        }
    }

    empilerActionsAnnulees(idAvantPlan: CanvasDessin, elem: ImageData): void {
        if (Object.values(CanvasDessin).includes(idAvantPlan)) {
            this.actionsAnnulees.push([idAvantPlan, elem]);
        }
    }

    depilerActionsAnnulees(): [CanvasDessin, ImageData] | undefined {
        return this.actionsAnnulees.pop();
    }

    effacerActionAnnulees() {
        this.actionsAnnulees = [];
    }
}
