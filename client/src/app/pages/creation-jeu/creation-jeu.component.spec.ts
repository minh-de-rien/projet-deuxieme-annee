import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { AssistantCanvas } from '@app/classes/assistant-canvas/assistant-canvas';
import { OutilDessin } from '@app/classes/outil-dessin/outil-dessin';
import { CreationJeuService } from '@app/services/creation-jeu/creation-jeu.service';
import { DetectionDifferencesService } from '@app/services/detection-differences/detection-differences.service';
import { ElargissementDifferencesService } from '@app/services/detection-differences/elargissement-differences.service';
import { IdentificationDifferencesService } from '@app/services/detection-differences/identification-differences.service';
import { AffichageDessinService } from '@app/services/gestion-affichage-dessin/gestion-affichage-dessin.service';
import { OutilsService } from '@app/services/outils-dessin/outils/outils.service';
import { PileLIFOService } from '@app/services/pile-lifo/pile-lifo.service';
import { CreationJeuComponent } from './creation-jeu.component';

import SpyObj = jasmine.SpyObj;
/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint @typescript-eslint/no-magic-numbers: "off"*/

describe('CreationJeuComponent', () => {
    let component: CreationJeuComponent;
    let fixture: ComponentFixture<CreationJeuComponent>;
    let creationJeuServiceSpy: SpyObj<CreationJeuService>;
    let detectionDifferencesServiceSpy: SpyObj<DetectionDifferencesService>;
    let affichageDessinServiceSpy: SpyObj<AffichageDessinService>;
    let outilsServiceSpy: SpyObj<OutilsService>;
    let pileLifoServiceSpy: SpyObj<PileLIFOService>;
    let assistantCanvasSpy: SpyObj<AssistantCanvas>;
    beforeEach(() => {
        creationJeuServiceSpy = jasmine.createSpyObj('CreationDeJeuService', [
            'reinitialisationFormulaire',
            'reinitialisationUneImg',
            'verificationTaille',
            'verificationDimension',
            'televersementUneZone',
            'televersementDeuxZones',
            'enregistrementServeur',
            'verificationNom',
            'verificationImage',
            'verificationNbrDifference',
            'obtenirContexteDeRefCanvas',
            'fusionImageData',
            'transformationCanvasEnBlob',
            'enregistrementDesBlobsEnFile',
            'enregistrementServeur',
            'dessinerCanvasValeurParDefaut',
            'reinitialisationUneImg',
            'dessinerCanvasValeurParDefaut',
        ]);
        detectionDifferencesServiceSpy = jasmine.createSpyObj('DetectionDifferencesService', [
            'initialisation',
            'trouverLesDifferences',
            'obtenirMapDifferences',
            'obtenirImgDifferences',
            'obtenirNombreDifferences',
        ]);
        affichageDessinServiceSpy = jasmine.createSpyObj('AffichageDessinService', [
            'annuler',
            'refaire',
            'obtenirImageDataOriginale',
            'obtenirImageDataModifiee',
            'effacerCanvasOriginal',
            'effacerCanvasModifie',
            'dupliquerCanvasOriginal',
            'dupliquerCanvasModifiee',
            'intervertirAvantPlan',
        ]);
        outilsServiceSpy = jasmine.createSpyObj('OutilsService', ['sourisRelachee', 'changerOutil', 'etablirEpaisseurOutil']);
        pileLifoServiceSpy = jasmine.createSpyObj('PileLIFOService', ['depilerHistorique', 'depilerActionsAnnulees', 'empilerHistorique']);
        assistantCanvasSpy = jasmine.createSpyObj('AssistantCanvas', ['dessinerImageData', 'obtenirImageData']);
    });
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [CreationJeuComponent],
            providers: [
                { provide: CreationJeuService, useValue: creationJeuServiceSpy },
                { provide: DetectionDifferencesService, useValue: detectionDifferencesServiceSpy },
                { provide: IdentificationDifferencesService },
                { provide: ElargissementDifferencesService },
                { provide: PileLIFOService, useValue: pileLifoServiceSpy },
                { provide: AffichageDessinService, useValue: affichageDessinServiceSpy },
                { provide: OutilsService, useValue: outilsServiceSpy },
                { provide: AssistantCanvas, useValue: assistantCanvasSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationJeuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });

    it('la fonction annuler doit appeler la fonction annuler du service affichage dessin', () => {
        component.annuler();
        expect(affichageDessinServiceSpy.annuler).toHaveBeenCalled();
    });

    it('la fonction refaire doit appeler la fonction annuler du service affichage dessin', () => {
        component.refaire();
        expect(affichageDessinServiceSpy.refaire).toHaveBeenCalled();
    });

    it('la fonction sourisRelachee doit appeler la fonction sourisRelachee du service outils', () => {
        component.sourisRelachee();
        expect(outilsServiceSpy.sourisRelachee).toHaveBeenCalled();
    });

    it("le téléversement de l'image devrait appeler les bonnes méthodes de creation-de-jeu.service", () => {
        const fichierMock = new File([''], 'fichierMock');
        let mockEvent = { currentTarget: { name: 'input-deux-zones', files: [fichierMock] } } as unknown;
        component.televersement(mockEvent as Event);
        expect(creationJeuServiceSpy.televersementDeuxZones).toHaveBeenCalledWith(
            (component as any).canvasOriginal,
            (component as any).canvasModifiee,
            fichierMock,
        );
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireOriginal);
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireModifiee);
        mockEvent = { currentTarget: { name: 'input-zone-originale', files: [fichierMock] } } as unknown;
        component.televersement(mockEvent as Event);
        expect(creationJeuServiceSpy.televersementUneZone).toHaveBeenCalledWith((component as any).canvasOriginal, fichierMock);
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireDeuxZones);
        mockEvent = { currentTarget: { name: 'input-zone-modifiee', files: [fichierMock] } } as unknown;
        component.televersement(mockEvent as Event);
        expect(creationJeuServiceSpy.televersementUneZone).toHaveBeenCalledWith((component as any).canvasModifiee, fichierMock);
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireDeuxZones);
    });

    it("la réinitialisation de l'image devrait appeler les bonnes méthodes de creation-de-jeu.service", () => {
        const fichierMock = new File([''], 'fichierMock');
        let mockEvent = { currentTarget: { name: 'bouton-reinitialisation-deux-zones', files: [fichierMock] } } as unknown;
        spyOn<any>(component, 'reinitialisationCanvasOriginalParDefaut');
        spyOn<any>(component, 'reinitialisationCanvasModifieParDefaut');
        component.reinitialisation(mockEvent as Event);
        expect((component as any).reinitialisationCanvasOriginalParDefaut).toHaveBeenCalled();
        expect((component as any).reinitialisationCanvasModifieParDefaut).toHaveBeenCalled();
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireOriginal);
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireModifiee);
        mockEvent = { currentTarget: { name: 'bouton-reinitialisation-img-originale', files: [fichierMock] } } as unknown;
        component.reinitialisation(mockEvent as Event);
        expect((component as any).reinitialisationCanvasOriginalParDefaut).toHaveBeenCalled();
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireDeuxZones);
        mockEvent = { currentTarget: { name: 'bouton-reinitialisation-img-modifiee', files: [fichierMock] } } as unknown;
        component.reinitialisation(mockEvent as Event);
        expect((component as any).reinitialisationCanvasModifieParDefaut).toHaveBeenCalled();
        expect(creationJeuServiceSpy.reinitialisationFormulaire).toHaveBeenCalledWith((component as any).formulaireDeuxZones);
    });

    it('la fonction reinitialisationAvantPlan devrait effacer le bon canvas', () => {
        const mockBoutonOriginal = { name: 'bouton-reinitialisation-avant-plan-originale' } as HTMLButtonElement;
        const mockEvenement1 = { currentTarget: mockBoutonOriginal } as unknown as Event;
        component.reinitialisationAvantPlan(mockEvenement1);
        expect(affichageDessinServiceSpy.effacerCanvasOriginal).toHaveBeenCalled();
        const mockBoutonModifie = { name: 'bouton-reinitialisation-avant-plan-modifie' } as HTMLButtonElement;
        const mockEvenement2 = { currentTarget: mockBoutonModifie } as unknown as Event;
        component.reinitialisationAvantPlan(mockEvenement2);
        expect(affichageDessinServiceSpy.effacerCanvasModifie).toHaveBeenCalled();
    });

    it('la fonction duplicationAvantPlan devrait dupliquer le bon canvas', () => {
        const mockBoutonOriginal = { name: 'bouton-duplication-avant-plan-originale' } as HTMLButtonElement;
        const mockEvenement1 = { currentTarget: mockBoutonOriginal } as unknown as Event;
        component.duplicationAvantPlan(mockEvenement1);
        expect(affichageDessinServiceSpy.dupliquerCanvasOriginal).toHaveBeenCalled();
        const mockBoutonModifie = { name: 'bouton-duplication-avant-plan-modifie' } as HTMLButtonElement;
        const mockEvenement2 = { currentTarget: mockBoutonModifie } as unknown as Event;
        component.duplicationAvantPlan(mockEvenement2);
        expect(affichageDessinServiceSpy.dupliquerCanvasModifiee).toHaveBeenCalled();
    });

    it('apparitionTexteInformation devrait faire apparaitre le texte information', () => {
        const elementRefMock = { nativeElement: { style: { visibility: 'hidden' } } };
        (component as any).texteInformation = elementRefMock;
        component.apparitionTexteInformation();
        expect(elementRefMock.nativeElement.style.visibility).toEqual('visible');
    });

    it('enleverTexteInformation devrait faire disparaitre le texte information', () => {
        const elementRefMock = { nativeElement: { style: { visibility: 'visible' } } };
        (component as any).texteInformation = elementRefMock;
        component.enleverTexteInformation();
        expect(elementRefMock.nativeElement.style.visibility).toEqual('hidden');
    });

    it('la fonction intervertionAvantPlan devrait intervertir les deux avant-plans', () => {
        component.intervertionAvantPlan();
        expect(affichageDessinServiceSpy.intervertirAvantPlan).toHaveBeenCalled();
    });

    it("validation devrait appeler recuperationDesDifferences et ouvrir une fenêtre modale avec l'image de difference", () => {
        spyOn(component, 'ouvreFenetre');
        spyOn(component as any, 'recuperationDesDifferences');
        component.validation();
        expect((component as any).recuperationDesDifferences).toHaveBeenCalled();
        expect(component.ouvreFenetre).toHaveBeenCalled();
    });

    it("l'ouverture d'une fenètre modale devrait dessiner une image sur le canvasDifference et l'afficher", () => {
        const imgDataMock = {} as ImageData;
        const mockCtx = {} as CanvasRenderingContext2D;
        (component as any).fenetreModaleWrapper = { nativeElement: { style: { display: 'test' } } } as ElementRef<HTMLDivElement>;
        creationJeuServiceSpy.obtenirContexteDeRefCanvas.and.callFake(() => {
            return mockCtx;
        });
        (component as any).assistantCanvas = assistantCanvasSpy;
        component.ouvreFenetre(imgDataMock);
        expect((component as any).fenetreModaleWrapper.nativeElement.style.display).toEqual('block');
        expect(assistantCanvasSpy.dessinerImageData).toHaveBeenCalledWith(mockCtx, imgDataMock);
    });

    it("la fermeture d'une fenêtre modale doit se faire à l'appel de fermeFenetre()", () => {
        component.fermeFenetre();
        expect((component as any).fenetreModaleWrapper.nativeElement.style.display).toEqual('none');
    });

    it('enregistement devrait faire les vérifications nécessaire et enregistrer correctement sur le serveur', fakeAsync(() => {
        spyOn<any>(component, 'recuperationDesDifferences').and.stub();
        spyOn(window, 'prompt').and.returnValue('test');
        creationJeuServiceSpy.verificationNom.and.returnValue(true);
        creationJeuServiceSpy.verificationNbrDifference.and.returnValue(true);
        const mockArray = {} as Uint8ClampedArray;
        const mockImgData = { data: mockArray } as ImageData;
        spyOn<any>(component, 'fusionPlansOriginaux').and.returnValue(mockImgData);
        spyOn<any>(component, 'fusionPlansModifies').and.returnValue(mockImgData);
        (component as any).assistantCanvas = assistantCanvasSpy;
        const mockBlob = {} as Blob;
        creationJeuServiceSpy.transformationCanvasEnBlob.and.resolveTo(mockBlob);
        detectionDifferencesServiceSpy.obtenirImgDifferences.and.returnValue(mockImgData);
        component.enregistrement();
        tick();
        expect(creationJeuServiceSpy.enregistrementServeur).toHaveBeenCalled();
    }));

    it("la fonction changerOutil change l'outil et l'état du bouton outil", () => {
        const crayon = 'crayon';
        spyOn<any>(component, 'changerEtatBoutonOutil');
        component.changerOutil(crayon);
        expect(outilsServiceSpy.changerOutil).toHaveBeenCalled();
        expect((component as any).changerEtatBoutonOutil).toHaveBeenCalled();
    });

    it('la fonction etablirEpaisseurOutil permet de définir une epaisseur pour un outil', () => {
        const mockEvenement = { value: 2 } as MatSliderChange;
        component.etablirEpaisseurOutil(mockEvenement);
        expect(outilsServiceSpy.etablirEpaisseurOutil).toHaveBeenCalledWith(2);
    });

    it("la fonction changerEtatBoutonOutil permet de changer l'état du bouton outil", () => {
        const mockOutil = { nomOutil: 'efface' } as OutilDessin;
        outilsServiceSpy.outilPrecedent = mockOutil;
        (component as any).changerEtatBoutonOutil(true, 'crayon');
        spyOn(component.etatBoutonOutil, 'set');
        expect(outilsServiceSpy.etablirEpaisseurOutil).toHaveBeenCalledWith(1);
        (component as any).changerEtatBoutonOutil(false, 'efface');
        expect(component.etatBoutonOutil.set).toHaveBeenCalled();
    });

    it("la fonction creationImageData permet d'obtenir un imageData à partir de la reference d'un canvas", () => {
        const mockRef = {} as ElementRef<HTMLCanvasElement>;
        (component as any).assistantCanvas = assistantCanvasSpy;
        (component as any).creationImageData(mockRef);
        expect(assistantCanvasSpy.obtenirImageData).toHaveBeenCalled();
    });

    it('recuperationDesDifferences devrait appeler les bonnes méthodes pour actualiser le nombre de différence', () => {
        spyOn<any>(component, 'fusionPlansOriginaux').and.stub();
        spyOn<any>(component, 'fusionPlansModifies').and.stub();
        (component as any).rayonElargissement.nativeElement.value = '3';
        detectionDifferencesServiceSpy.obtenirNombreDifferences.and.returnValue(10);
        (component as any).recuperationDesDifferences();
        expect(component.nbrDifference).toEqual(10);
    });

    it("fusionPlansOriginaux fusionne l'avant et l'arriere plan de l'image original", () => {
        const mockImgData = {} as ImageData;
        affichageDessinServiceSpy.obtenirImageDataOriginale.and.returnValue(mockImgData);
        spyOn<any>(component, 'creationImageData').and.stub();
        (component as any).fusionPlansOriginaux();
        expect(creationJeuServiceSpy.fusionImageData).toHaveBeenCalled();
    });

    it("fusionPlansModifie fusionne l'avant et l'arriere plan de l'image modifie", () => {
        const mockImgData = {} as ImageData;
        affichageDessinServiceSpy.obtenirImageDataModifiee.and.returnValue(mockImgData);
        spyOn<any>(component, 'creationImageData').and.stub();
        (component as any).fusionPlansModifies();
        expect(creationJeuServiceSpy.fusionImageData).toHaveBeenCalled();
    });

    it("reinitialisationCanvasOriginalParDefaut devrait reinitialiser l'image et remettre un arriere plan blanc", () => {
        (component as any).reinitialisationCanvasOriginalParDefaut();
        expect(creationJeuServiceSpy.reinitialisationUneImg).toHaveBeenCalledWith((component as any).canvasOriginal);
        expect(creationJeuServiceSpy.dessinerCanvasValeurParDefaut).toHaveBeenCalledWith((component as any).canvasOriginal);
    });

    it("reinitialisationCanvasModifieParDefaut devrait reinitialiser l'image et remettre un arriere plan blanc", () => {
        (component as any).reinitialisationCanvasModifieParDefaut();
        expect(creationJeuServiceSpy.reinitialisationUneImg).toHaveBeenCalledWith((component as any).canvasModifiee);
        expect(creationJeuServiceSpy.dessinerCanvasValeurParDefaut).toHaveBeenCalledWith((component as any).canvasModifiee);
    });
});
