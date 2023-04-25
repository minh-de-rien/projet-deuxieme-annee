import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoneJeuComponent } from '@app/components/zone-jeu/zone-jeu.component';
import { EvenementJeuService } from '@app/services/evenement-jeu/evenement-jeu.service';
import { GestionAffichageJeuService } from '@app/services/gestion-affichage-jeu/gestion-affichage-jeu.service';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('ZoneJeuComponent', () => {
    let component: ZoneJeuComponent;
    let fixture: ComponentFixture<ZoneJeuComponent>;
    let mouseEvent: MouseEvent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ZoneJeuComponent],
            providers: [GestionAffichageJeuService, EvenementJeuService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ZoneJeuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit() devrait initialiser les contextes de GestionAffichageJeuService et de dataMasques et appeler drawImage()', () => {
        component.statut = 'canvasOriginal';
        const mockContexte = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        const mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);
        mockCanvas.getContext.and.callFake(() => {
            return mockContexte;
        });
        component['canvasBot'] = { nativeElement: mockCanvas };
        component['canvasTop'] = { nativeElement: mockCanvas };
        const mockJeu = { imgOriginale: '' };
        component.jeu = mockJeu as InterfaceJeux;
        const dessinerImageStub = spyOn(component['gestionAffichageJeuService'], 'dessinerImage').and.callFake(() => {
            return null;
        });
        component.ngAfterViewInit();
        expect(mockCanvas.getContext).toHaveBeenCalledTimes(2);
        expect(mockContexte.getImageData).toHaveBeenCalledWith(0, 0, 640, 480);
        expect(dessinerImageStub).toHaveBeenCalled();
    });
    it('ngAfterViewInit() devrait initialiser les contextes de GestionAffichageJeuService et appeler drawImage()', () => {
        component.statut = 'canvasModifiee';
        const mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);
        mockCanvas.getContext.and.stub();
        component['canvasBot'] = { nativeElement: mockCanvas };
        component['canvasTop'] = { nativeElement: mockCanvas };
        const mockJeu = { imgModifiee: '' };
        component.jeu = mockJeu as InterfaceJeux;
        const dessinerImageStub = spyOn(component['gestionAffichageJeuService'], 'dessinerImage').and.callFake(() => {
            return null;
        });
        component.ngAfterViewInit();
        expect(mockCanvas.getContext).toHaveBeenCalledTimes(2);
        expect(dessinerImageStub).toHaveBeenCalled();
    });

    it('detectionCliqueSouris() devrait assigner la position de la souris à mousePosition et appeler verifierCoord()', () => {
        const service = fixture.debugElement.injector.get(EvenementJeuService);
        const verifierCoordStub = spyOn(service, 'verifierCoord').and.stub();
        const expectedPosition: Vec2 = { x: 100, y: 200 };
        mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
            button: 0,
        } as MouseEvent;
        component.statut = 'canvasOriginal';
        component.detectionCliqueSouris(mouseEvent);
        expect(component['positionSouris']).toEqual(expectedPosition);
        expect(verifierCoordStub).toHaveBeenCalledOnceWith(expectedPosition, true);
    });
    it('mouseHitDetect() ne devrait pas assigner la position de souris à mousePosition', () => {
        const service = fixture.debugElement.injector.get(EvenementJeuService);
        const verifierCoordStub = spyOn(service, 'verifierCoord').and.stub();
        const expectedPosition: Vec2 = { x: 200, y: 300 };
        mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
            button: 1,
        } as MouseEvent;
        component.statut = 'canvasOriginal';
        component.detectionCliqueSouris(mouseEvent);
        expect(component['positionSouris']).not.toEqual(expectedPosition);
        expect(verifierCoordStub).not.toHaveBeenCalledOnceWith(expectedPosition, true);
    });

    it('isOriginal devrait retourner true si statut=canvasOriginal, false sinon', () => {
        component.statut = 'canvasOriginal';
        const resultatTestPositif: boolean = component.estOriginal();
        expect(resultatTestPositif).toEqual(true);
        component.statut = '';
        const resultatTestNegatif: boolean = component.estOriginal();
        expect(resultatTestNegatif).toEqual(false);
    });
    it('isModifiee devrait retourner true si statut=canvasModifiee, false sinon', () => {
        component.statut = 'canvasModifiee';
        const resultatTestPositif: boolean = component.estModifie();
        expect(resultatTestPositif).toEqual(true);
        component.statut = '';
        const resultatTestNegatif: boolean = component.estModifie();
        expect(resultatTestNegatif).toEqual(false);
    });
});
