import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { PaletteCouleurService } from '@app/services/outils-dessin/palette-couleur/palette-couleur.service';

import { PaletteCouleurComponent } from './palette-couleur.component';

describe('PaletteCouleurComponent', () => {
    let component: PaletteCouleurComponent;
    let fixture: ComponentFixture<PaletteCouleurComponent>;
    let servicePalette: PaletteCouleurService;
    let assistantCanvas: AssistantCanvas;
    let canvas: HTMLCanvasElement;
    let evenement: MouseEvent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaletteCouleurComponent],
        }).compileComponents();

        servicePalette = TestBed.inject(PaletteCouleurService);
        fixture = TestBed.createComponent(PaletteCouleurComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        assistantCanvas = new AssistantCanvas();
        canvas = document.createElement('canvas');
        servicePalette.ctxPaletteCouleur = canvas.getContext('2d') as CanvasRenderingContext2D;

        evenement = {} as MouseEvent;
    });

    it('devrait être créé', () => {
        expect(component).toBeTruthy();
    });

    it("À l'appel de ngAfterViewInit, le contexte et la fonction dessiner devraient être appelée", () => {
        spyOn(assistantCanvas, 'creerContexte').and.callFake(() => {
            return canvas.getContext('2d') as CanvasRenderingContext2D;
        });
        const dessinerSpy = spyOn(servicePalette, 'dessiner');
        component.ngAfterViewInit();
        expect(dessinerSpy).toHaveBeenCalledWith(servicePalette.ctxPaletteCouleur);
    });

    it('sourisRelachee devrait appeler etablirCouleur', () => {
        const etablirCouleurSpy = spyOn(component, 'etablirCouleur');
        component.sourisRelachee(evenement);
        expect(etablirCouleurSpy).toHaveBeenCalledWith(evenement);
    });

    it('etablirCouleur devrait appeler obtenirCouleurALaPosition de paletteService', () => {
        const obtenirCouleurALaPositionSpy = spyOn(servicePalette, 'obtenirCouleurALaPosition');
        component.etablirCouleur(evenement);
        expect(obtenirCouleurALaPositionSpy).toHaveBeenCalledWith(evenement.offsetX, evenement.offsetY);
    });
});
