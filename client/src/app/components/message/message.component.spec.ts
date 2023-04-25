/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageComponent } from './message.component';
import { Joueur } from '@common/interface/joueur';

const fausseSalleId = 'salle_0';
const fauxDestinateur: Joueur = {
    nom: 'j2',
    estHote: null,
    idSalle: fausseSalleId,
    idJeu: 0,
    adversaire: '',
};

describe('MessageComponent', () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('verificationIdentite() devrait retourner true si le destinateur est celui en param, false sinon', () => {
        component['message'] = { destinateur: fauxDestinateur, contenu: 'helo bozo' };
        const retourFnTrue = component.verificationIdentite('j2');
        expect(retourFnTrue).toBe(true);
        component['message'] = { destinateur: fauxDestinateur, contenu: 'helo bozo' };
        const retourFnFalse = component.verificationIdentite('mauvaisDest');
        expect(retourFnFalse).toBe(false);
    });
    it('verificationServeur() devrait appeler verificationIdentite()', () => {
        const verificationIdentiteStub = spyOn<any>(component, 'verificationIdentite').and.stub();
        component.verificationServeur();
        expect(verificationIdentiteStub).toHaveBeenCalled();
    });
    it('verificationSoi() devrait appeler verificationIdentite()', () => {
        const verificationIdentiteStub = spyOn<any>(component, 'verificationIdentite').and.stub();
        component.verificationSoi();
        expect(verificationIdentiteStub).toHaveBeenCalled();
    });
    it('verificationJoueurAutre() devrait appeler verificationIdentite()', () => {
        const verificationIdentiteStub = spyOn<any>(component, 'verificationIdentite').and.stub();
        component.verificationJoueurAutre();
        expect(verificationIdentiteStub).toHaveBeenCalled();
    });
    it('verificationMessageExiste() retourner true si le message nest pas vide, sinon false', () => {
        component['message'] = { destinateur: fauxDestinateur, contenu: 'helo bozo' };
        const retourFnTrue = component.verificationMessageExiste();
        expect(retourFnTrue).toBe(true);
        component['message'] = { destinateur: fauxDestinateur, contenu: '' };
        const retourFnFalse = component.verificationIdentite('mauvaisDest');
        expect(retourFnFalse).toBe(false);
    });
});
