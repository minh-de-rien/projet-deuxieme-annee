import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasDessin } from '@common/valeurs-par-defaut';

import { ZoneDessinComponent } from './zone-dessin.component';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint @typescript-eslint/no-magic-numbers: "off"*/
describe('ZoneDessinComponent', () => {
    let component: ZoneDessinComponent;
    let fixture: ComponentFixture<ZoneDessinComponent>;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let evenement: MouseEvent;
    let imageStub: ImageData;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ZoneDessinComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ZoneDessinComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        evenement = {} as MouseEvent;
        imageStub = new ImageData(new Uint8ClampedArray(16), 2, 2);
    });

    it('devrait être créé', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit() devrait initialisé les contextes', () => {
        spyOn<any>(component, 'estOriginal').and.returnValue(true);
        spyOn<any>(component['assistantCanvas'], 'creerContexte').and.returnValue(ctx);
        component.ngAfterViewInit();
        expect(component['affichageDessinService'].ctxDessinOriginal).toEqual(ctx);

        spyOn<any>(component, 'estModifie').and.returnValue(true);
        component.ngAfterViewInit();
        expect(component['affichageDessinService'].ctxDessinModifie).toEqual(ctx);
    });

    it("sourisClique devrait appeler sourisClique d'outilService", () => {
        const sourisCliqueSpy = spyOn(component['outilsService'], 'sourisClique');
        component.sourisClique(evenement);
        expect(sourisCliqueSpy).toHaveBeenCalledWith(evenement);
    });

    it("sourisEnfoncee devrait appeler sourisEnfoncee de d'outilService et appeler empilerHistorique() sur le contexte approprié", () => {
        spyOn<any>(component, 'estOriginal').and.returnValue(true);
        spyOn<any>(component, 'estLeMemeCanvas').and.returnValue(true);
        spyOn(component['affichageDessinService'], 'obtenirImageDataOriginale').and.returnValue(imageStub);

        const sourisEnfonceeSpy = spyOn(component['outilsService'], 'sourisEnfoncee');
        const empilerHistoriqueSpy = spyOn(component['pileLifoService'], 'empilerHistorique');
        component['statut'] = CanvasDessin.Original;
        component.sourisEnfoncee(evenement);
        expect(sourisEnfonceeSpy).toHaveBeenCalledWith(evenement, true);
        expect(empilerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.Original, imageStub);

        spyOn<any>(component, 'estModifie').and.returnValue(true);
        spyOn(component['affichageDessinService'], 'obtenirImageDataModifiee').and.returnValue(imageStub);
        component['statut'] = CanvasDessin.Modifie;
        component.sourisEnfoncee(evenement);
        expect(empilerHistoriqueSpy).toHaveBeenCalledWith(CanvasDessin.Modifie, imageStub);
    });

    it("sourisBouge devrait appeler sourisBouge d'outilService", () => {
        const sourisBougeSpy = spyOn(component['outilsService'], 'sourisBouge');
        component.sourisBouge(evenement);
        expect(sourisBougeSpy).toHaveBeenCalledWith(evenement);
    });

    it("sourisHorsCanvas devrait appeler sourisHorsCanvas d'outilService", () => {
        const sourisHorsCanvasSpy = spyOn(component['outilsService'], 'sourisHorsCanvas');
        component.sourisHorsCanvas();
        expect(sourisHorsCanvasSpy).toHaveBeenCalled();
    });

    it("sourisDansCanvas devrait appeler sourisDansCanvas d'outilService", () => {
        const sourisDansCanvasSpy = spyOn(component['outilsService'], 'sourisDansCanvas');
        spyOn<any>(component, 'estLeMemeCanvas').and.returnValue(true);
        component.sourisDansCanvas();
        expect(sourisDansCanvasSpy).toHaveBeenCalled();
    });

    it('estOriginal devrait retourner vrai ou faux selon le contexte du canvas', () => {
        component['statut'] = CanvasDessin.Original;
        const valeurDeRetour = component['estOriginal']();
        expect(valeurDeRetour).toEqual(true);
    });

    it('estModifie devrait retourner vrai ou faux selon le contexte du canvas', () => {
        component['statut'] = CanvasDessin.Modifie;
        const valeurDeRetour = component['estModifie']();
        expect(valeurDeRetour).toEqual(true);
    });

    it('estLeMemeCanvas devrait retourner vrai si le contexte courant est pareil que contexte original, sinon', () => {
        spyOn<any>(component, 'estOriginal').and.returnValue(true);
        component['affichageDessinService'].estCanvasDessinOriginal = true;
        let valeurDeRetour = component['estLeMemeCanvas']();
        expect(valeurDeRetour).toBe(true);

        spyOn<any>(component, 'estModifie').and.returnValue(true);
        component['affichageDessinService'].estCanvasDessinOriginal = false;
        valeurDeRetour = component['estLeMemeCanvas']();
        expect(valeurDeRetour).toBe(true);
    });
});
