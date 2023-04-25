import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarreNavigationComponent } from './barre-navigation.component';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('BarreNavigationComponent', () => {
    let component: BarreNavigationComponent;
    let fixture: ComponentFixture<BarreNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BarreNavigationComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(BarreNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });

    it("boutonRetourInactif devrait retourner vrai si la page n'est pas création de jeu", () => {
        component.titreDePage = 'test';
        expect(component.boutonRetourInactif()).toEqual(true);
    });

    it('apparitionTexteRetour devrait faire apparaitre le texte de retour', () => {
        const elementRefMock = { nativeElement: { style: { visibility: 'hidden' } } };
        (component as any).texteRetour = elementRefMock;
        component.apparitionTexteRetour();
        expect(elementRefMock.nativeElement.style.visibility).toEqual('visible');
    });

    it('enleverTexteInformation devrait faire disparaitre le texte information', () => {
        const elementRefMock = { nativeElement: { style: { visibility: 'visible' } } };
        (component as any).texteRetour = elementRefMock;
        component.enleverTexteRetour();
        expect(elementRefMock.nativeElement.style.visibility).toEqual('hidden');
    });
});
