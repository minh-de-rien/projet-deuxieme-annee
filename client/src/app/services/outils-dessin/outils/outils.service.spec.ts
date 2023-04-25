import { TestBed } from '@angular/core/testing';
import { OutilDessin } from '@app/classes/outil-dessin/outil-dessin';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { OutilsService } from './outils.service';

class OutilDessinTest extends OutilDessin {
    constructor(protected affichageDessinService: AffichageDessinService) {
        super(affichageDessinService);
        this.nomOutil = 'crayon';
    }
}

describe('OutilsService', () => {
    let service: OutilsService;
    let serviceAffichage: AffichageDessinService;
    let evenement: MouseEvent;
    let outilActuelTest: OutilDessinTest;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AffichageDessinService],
        });
        service = TestBed.inject(OutilsService);

        evenement = {} as MouseEvent;
        outilActuelTest = new OutilDessinTest(serviceAffichage);
        service.outilActuel = outilActuelTest;
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it("sourisClique() devrait appeler sourisClique de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisCliqueSpy = spyOn(outilActuelTest, 'sourisClique');
        service.sourisClique(evenement);
        expect(sourisCliqueSpy).toHaveBeenCalledWith(evenement);
    });

    it("sourisEnfoncee() devrait appeler sourisEnfoncee de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisEnfonceeSpy = spyOn(outilActuelTest, 'sourisEnfoncee');
        service.sourisEnfoncee(evenement, true);
        expect(sourisEnfonceeSpy).toHaveBeenCalledWith(evenement, true);
    });

    it("sourisRelachee() devrait appeler sourisRelachee de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisRelacheeSpy = spyOn(outilActuelTest, 'sourisRelachee');
        service.sourisRelachee();
        expect(sourisRelacheeSpy).toHaveBeenCalled();
    });

    it("sourisBouge() devrait appeler sourisBouge de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisBougeSpy = spyOn(outilActuelTest, 'sourisBouge');
        service.sourisBouge(evenement);
        expect(sourisBougeSpy).toHaveBeenCalledWith(evenement);
    });

    it("sourisHorsCanvas() devrait appeler sourisHorsCanvas de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisHorsCanvasSpy = spyOn(outilActuelTest, 'sourisHorsCanvas');
        service.sourisHorsCanvas();
        expect(sourisHorsCanvasSpy).toHaveBeenCalled();
    });

    it("sourisDansCanvas() devrait appeler sourisDansCanvas de l'outilActuel si celui-ci n'est pas undefined", () => {
        const sourisDansCanvasSpy = spyOn(outilActuelTest, 'sourisDansCanvas');
        service.sourisDansCanvas();
        expect(sourisDansCanvasSpy).toHaveBeenCalled();
    });

    it("changerOutil() devrait changer l'outil s'il est different de l'outilPrecedent", () => {
        let valeurDeRetour = service.changerOutil(outilActuelTest.nomOutil);
        expect(service.outilActuel).not.toBe(outilActuelTest);
        expect(valeurDeRetour).toEqual(false);

        service.outilActuel = undefined;
        valeurDeRetour = service.changerOutil('efface');
        expect(valeurDeRetour).toEqual(true);
    });

    it("etablirEpaisseurOutil() devrait appeler etablirEpaisseurOutil() de l'outilActuel si celui-ci n'est pas undefined", () => {
        const etablirEpaisseurOutilSpy = spyOn(outilActuelTest, 'etablirEpaisseurOutil');
        service.etablirEpaisseurOutil(1);
        expect(etablirEpaisseurOutilSpy).toHaveBeenCalledWith(1);

        service.outilActuel = undefined;
        service.etablirEpaisseurOutil(1);
        expect(service.outilActuel).not.toBeDefined();
    });

    it("dessiner() devrait appeler dessiner() de l'outilActuel si celui-ci n'est pas undefined", () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const dessinerSpy = spyOn(outilActuelTest, 'dessiner');

        service.dessiner(ctx);
        expect(dessinerSpy).toHaveBeenCalledWith(ctx);

        service.outilActuel = undefined;
        service.dessiner(ctx);
        expect(service.outilActuel).not.toBeDefined();
    });
});
