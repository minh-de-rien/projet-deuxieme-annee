import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { BoutonSouris } from '@common/enum/bouton-souris';
import { Vec2 } from '@common/interface/vec2';

export abstract class OutilDessin {
    nomOutil: string = '';

    protected positionSourisEnfoncee: Vec2 = { x: 0, y: 0 };
    protected cheminPositionsSouris: Vec2[] = [];

    protected sourisEstEnfoncee: boolean;
    protected estDansLeMemeCanvas: boolean;

    protected positionActuelleSouris: Vec2;

    constructor(protected readonly affichageDessinService: AffichageDessinService) {}

    sourisClique(evenement: MouseEvent) {
        this.cheminPositionsSouris.push(this.obtenirPositionSouris(evenement));
        this.dessinerCheminPositionsSouris();
    }

    sourisEnfoncee(evenement: MouseEvent, estLeMemeCanvas?: boolean): void {
        this.sourisEstEnfoncee = evenement.button === BoutonSouris.Gauche;
        this.estDansLeMemeCanvas = estLeMemeCanvas !== undefined ? estLeMemeCanvas : true;
        if (this.sourisEstEnfoncee) {
            this.viderCheminDePositionsSouris();
            this.positionSourisEnfoncee = this.obtenirPositionSouris(evenement);
            this.cheminPositionsSouris.push(this.positionSourisEnfoncee);
        }
    }

    sourisRelachee(): void {
        this.sourisEstEnfoncee = false;
        this.viderCheminDePositionsSouris();
    }

    sourisBouge(evenement: MouseEvent): void {
        this.positionActuelleSouris = this.obtenirPositionSouris(evenement);
        if (this.sourisEstEnfoncee && this.estDansLeMemeCanvas) {
            this.dessinerCheminPositionsSouris();
        }
    }

    sourisHorsCanvas(): void {
        this.viderCheminDePositionsSouris();
    }

    sourisDansCanvas(estLeMemeCanvas?: boolean) {
        this.estDansLeMemeCanvas = estLeMemeCanvas !== undefined ? estLeMemeCanvas : true;
    }

    etablirEpaisseurOutil(epaisseur: number): void {
        this.affichageDessinService.etablirEpaisseurOutil(epaisseur);
    }

    /* eslint-disable-next-line no-unused-vars*/ // Raison: c'est une classe abstraite
    dessiner(ctx: CanvasRenderingContext2D) {
        return;
    }

    protected obtenirPositionSouris(evenement: MouseEvent): Vec2 {
        return { x: evenement.offsetX, y: evenement.offsetY };
    }

    private dessinerDansCanvasApproprie(): void {
        if (this.affichageDessinService.estCanvasDessinOriginal) {
            this.dessiner(this.affichageDessinService.ctxDessinOriginal);
        } else {
            this.dessiner(this.affichageDessinService.ctxDessinModifie);
        }
    }

    private dessinerCheminPositionsSouris(): void {
        this.cheminPositionsSouris.push(this.positionActuelleSouris);
        this.dessinerDansCanvasApproprie();
    }

    private viderCheminDePositionsSouris(): void {
        this.cheminPositionsSouris = [];
    }
}
