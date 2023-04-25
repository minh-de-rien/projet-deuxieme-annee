import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { EvenementJeuService } from '@app/services/evenement-jeu/evenement-jeu.service';
import { GestionAffichageJeuService } from '@app/services/gestion-affichage-jeu/gestion-affichage-jeu.service';
import { BoutonSouris } from '@common/enum/bouton-souris';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { HAUTEUR_IMAGE, LARGEUR_IMAGE } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-zone-jeu',
    templateUrl: './zone-jeu.component.html',
    styleUrls: ['./zone-jeu.component.scss'],
})
export class ZoneJeuComponent implements AfterViewInit {
    @Input() statut: string;
    @Input() jeu: InterfaceJeux;
    @ViewChild('canvasBot', { static: false }) private canvasBot: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasTop', { static: false }) private canvasTop: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasTriche', { static: false }) private canvasTriche: ElementRef<HTMLCanvasElement>;

    private positionSouris: Vec2 = { x: 0, y: 0 };

    private assitantCanvas = new AssistantCanvas();

    constructor(private readonly gestionAffichageJeuService: GestionAffichageJeuService, private readonly evenementService: EvenementJeuService) {}

    get largeur(): number {
        return this.assitantCanvas.largeur;
    }
    get hauteur(): number {
        return this.assitantCanvas.hauteur;
    }

    ngAfterViewInit(): void {
        if (this.estOriginal()) {
            this.gestionAffichageJeuService.contexteImageOriginaleBot = this.canvasBot.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.contexteImageOriginaleTop = this.canvasTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.contexteImageOriginaleTriche = this.canvasTriche.nativeElement.getContext(
                '2d',
            ) as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.dataMasques = this.gestionAffichageJeuService.contexteImageOriginaleTop.getImageData(
                0,
                0,
                LARGEUR_IMAGE,
                HAUTEUR_IMAGE,
            );
            this.gestionAffichageJeuService.dessinerImage(this.jeu.imgOriginale, this.gestionAffichageJeuService.contexteImageOriginaleBot);
        }
        if (this.estModifie()) {
            this.gestionAffichageJeuService.contexteImageModifieeBot = this.canvasBot.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.contexteImageModifieeTop = this.canvasTop.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.contexteImageModifieeTriche = this.canvasTriche.nativeElement.getContext(
                '2d',
            ) as CanvasRenderingContext2D;
            this.gestionAffichageJeuService.dessinerImage(this.jeu.imgModifiee, this.gestionAffichageJeuService.contexteImageModifieeBot);
        }
    }

    detectionCliqueSouris(event: MouseEvent) {
        if (event.button === BoutonSouris.Gauche && this.gestionAffichageJeuService.clicsDeverouilles) {
            this.positionSouris = { x: event.offsetX, y: event.offsetY };
            this.evenementService.verifierCoord(this.positionSouris, this.estOriginal());
        }
    }

    estOriginal(): boolean {
        return this.statut === 'canvasOriginal';
    }
    estModifie(): boolean {
        return this.statut === 'canvasModifiee';
    }
}
