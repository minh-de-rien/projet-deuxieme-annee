import { TestBed } from '@angular/core/testing';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { Vec2 } from '@common/interface/vec2';
import { OutilDessin } from './outil-dessin';

/* eslint @typescript-eslint/no-explicit-any: "off"*/ // Raison: on en a besoin pour les tests

class OutilDessinTest extends OutilDessin {}

describe('OutilsDeDessin', () => {
    let outilDessinTest: OutilDessinTest;
    let serviceAffichage: jasmine.SpyObj<AffichageDessinService>;
    let evenementStub: MouseEvent;
    let positionActuelleStub: Vec2;
    let viderCheminDePositionsSourisSpy: jasmine.Spy<jasmine.Func>;

    beforeEach(() => {
        serviceAffichage = jasmine.createSpyObj('AffichageDessinService', ['etablirEpaisseurOutil']);

        TestBed.configureTestingModule({
            providers: [{ provide: AffichageDessinService, useValue: serviceAffichage }],
        });

        outilDessinTest = new OutilDessinTest(serviceAffichage);

        evenementStub = {
            offsetX: 0,
            offsetY: 1,
            button: 0,
        } as MouseEvent;
        positionActuelleStub = { x: 1, y: 1 };
    });

    it('devrait être créé', () => {
        expect(outilDessinTest).toBeTruthy();
    });

    it('sourisClique devrait ajouter la position du clic dans le chemin des positions et ', () => {
        const positionActuelleSourisAttendue: Vec2 = { x: evenementStub.offsetX, y: evenementStub.offsetY };
        const obtenirPositionSourisSpy = spyOn<any>(outilDessinTest, 'obtenirPositionSouris').and.callFake(() => {
            return positionActuelleSourisAttendue;
        });
        const dessinerCheminPositionsSourisSpy = spyOn<any>(outilDessinTest, 'dessinerCheminPositionsSouris');

        outilDessinTest.sourisClique(evenementStub);
        expect(outilDessinTest['cheminPositionsSouris']).toContain(positionActuelleSourisAttendue);
        expect(obtenirPositionSourisSpy).toHaveBeenCalledWith(evenementStub);
        expect(dessinerCheminPositionsSourisSpy).toHaveBeenCalled();
    });

    /* eslint-disable-next-line max-len*/ // Raison : précision sur la description du test nécessaire
    it("sourisEnfoncee devrait mettre à jour le cheminPositionSouris et viderCheminDePositionSouris s'elle répond aux critères de sourisEstEnfonce", () => {
        viderCheminDePositionsSourisSpy = spyOn<any>(outilDessinTest, 'viderCheminDePositionsSouris');
        const estLeMemeCanvasStub = true;

        outilDessinTest.sourisEnfoncee(evenementStub, estLeMemeCanvasStub);

        expect(outilDessinTest['sourisEstEnfoncee']).toEqual(evenementStub.button === 0);
        expect(outilDessinTest['estDansLeMemeCanvas']).toEqual(estLeMemeCanvasStub);
        expect(viderCheminDePositionsSourisSpy).toHaveBeenCalled();
        expect(outilDessinTest['positionSourisEnfoncee'].x).toEqual(evenementStub.offsetX);
        expect(outilDessinTest['positionSourisEnfoncee'].y).toEqual(evenementStub.offsetY);
        expect(outilDessinTest['cheminPositionsSouris']).toContain(outilDessinTest['positionSourisEnfoncee']);
    });

    it("sourisEnfoncee devrait appeler aucune fonction s'elle ne correspond pas au critère de sourisEstEnfoncee", () => {
        viderCheminDePositionsSourisSpy = spyOn<any>(outilDessinTest, 'viderCheminDePositionsSouris');
        evenementStub = { button: 1 } as MouseEvent;
        outilDessinTest.sourisEnfoncee(evenementStub);
        expect(viderCheminDePositionsSourisSpy).not.toHaveBeenCalled();
    });

    it('Lorsque sourisRelachee() est appelée, sourisEstEnfoncee devrait être faux et viderCheminDePositionsSouris devrait être appelé', () => {
        viderCheminDePositionsSourisSpy = spyOn<any>(outilDessinTest, 'viderCheminDePositionsSouris');
        outilDessinTest.sourisRelachee();
        expect(outilDessinTest['sourisEstEnfoncee']).toBe(false);
        expect(viderCheminDePositionsSourisSpy).toHaveBeenCalled();
    });

    it("sourisBouge devrait appeler dessinerCheminPositionsSouris s'elle répond aux critères", () => {
        const positionActuelleSourisAttendue: Vec2 = { x: evenementStub.offsetX, y: evenementStub.offsetY };
        const obtenirPositionSourisSpy = spyOn<any>(outilDessinTest, 'obtenirPositionSouris').and.callFake(() => {
            return { x: evenementStub.offsetX, y: evenementStub.offsetY };
        });
        outilDessinTest['sourisEstEnfoncee'] = true;
        outilDessinTest['estDansLeMemeCanvas'] = true;
        const dessinerCheminPositionsSourisSpy = spyOn<any>(outilDessinTest, 'dessinerCheminPositionsSouris');

        outilDessinTest.sourisBouge(evenementStub);
        expect(obtenirPositionSourisSpy).toHaveBeenCalledWith(evenementStub);
        expect(outilDessinTest['positionActuelleSouris']).toEqual(positionActuelleSourisAttendue);
        expect(dessinerCheminPositionsSourisSpy).toHaveBeenCalled();
    });

    it('sourisHorsCanvas devrait appelé viderCheminDePositionsSouris', () => {
        viderCheminDePositionsSourisSpy = spyOn<any>(outilDessinTest, 'viderCheminDePositionsSouris');
        outilDessinTest.sourisHorsCanvas();
        expect(viderCheminDePositionsSourisSpy).toHaveBeenCalled();
    });

    it("estDansLeMemeCanvas devrait prendre la valeur du paramètre estLeMemeCanvas si celui-ci n'est pas undefined", () => {
        const estLeMemeCanvasStub = false;
        outilDessinTest.sourisDansCanvas(estLeMemeCanvasStub);
        expect(outilDessinTest['estDansLeMemeCanvas']).toBe(estLeMemeCanvasStub);

        outilDessinTest.sourisDansCanvas();
        expect(outilDessinTest['estDansLeMemeCanvas']).toBe(true);
    });

    it("etablirEpaisseurOutil devrait appeler etablirEpaisseurOutil d'affichageDessinService", () => {
        const epaisseur = 1;

        outilDessinTest.etablirEpaisseurOutil(epaisseur);
        expect(serviceAffichage.etablirEpaisseurOutil).toHaveBeenCalledWith(epaisseur);
    });

    it('dessiner() de la classe abstraite devrait exécuter la méthode dessiner() de sa classe dérivée', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const retour = outilDessinTest.dessiner(ctx);
        expect(retour).toEqual();
    });

    it('obtenirPositionSouris devrait retourner la position de la souris sous forme de vecteur 2D', () => {
        const positionSouris = outilDessinTest['obtenirPositionSouris'](evenementStub);

        expect(positionSouris.x).toEqual(evenementStub.offsetX);
        expect(positionSouris.y).toEqual(evenementStub.offsetY);
    });

    it('dessinerDansCanvasApproprie devrait appelé dessiner() avec le bon contexte', () => {
        const dessinerSpy = spyOn(outilDessinTest, 'dessiner').and.stub();

        serviceAffichage.estCanvasDessinOriginal = true;
        outilDessinTest['dessinerDansCanvasApproprie']();
        expect(dessinerSpy).toHaveBeenCalledWith(serviceAffichage.ctxDessinOriginal);

        serviceAffichage.estCanvasDessinOriginal = false;
        outilDessinTest['dessinerDansCanvasApproprie']();
        expect(dessinerSpy).toHaveBeenCalledWith(serviceAffichage.ctxDessinModifie);
    });

    it('dessinerCheminPositionsSouris devrait mettre à jour le cheminPositionSouris et appeler dessinerDansCanvasApproprie', () => {
        const dessinerDansCanvasApproprieSpy = spyOn<any>(outilDessinTest, 'dessinerDansCanvasApproprie').and.stub();
        outilDessinTest['positionActuelleSouris'] = positionActuelleStub;

        outilDessinTest['dessinerCheminPositionsSouris']();

        expect(outilDessinTest['cheminPositionsSouris']).toContain(positionActuelleStub);
        expect(dessinerDansCanvasApproprieSpy).toHaveBeenCalled();
    });

    it('viderCheminDePositionsSouris devrait vider le chemin des positions de souris', () => {
        const cheminPositionSourisAttendu: Vec2[] = [];
        outilDessinTest['viderCheminDePositionsSouris']();
        expect(outilDessinTest['cheminPositionsSouris']).toEqual(cheminPositionSourisAttendu);
    });
});
