import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { jeuTest } from '@common/constantes/constantes-test';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Socket } from 'socket.io-client';
import { NavigateurFichesComponent } from './navigateur-fiches.component';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/

describe('NavigateurFichesComponent', () => {
    let component: NavigateurFichesComponent;
    let fixture: ComponentFixture<NavigateurFichesComponent>;
    let socketServiceSpy: GestionSocketClientService;
    let assistantSocket: AssistantTestsSocket;
    const routerSpy = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        assistantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assistantSocket as unknown as Socket;

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            declarations: [NavigateurFichesComponent],
            providers: [
                { provide: HttpClient },
                { provide: HttpHandler },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NavigateurFichesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['listeJeuxServeur'] = [jeuTest, jeuTest, jeuTest, jeuTest, jeuTest, jeuTest];
    });

    it('devrai créer', () => {
        expect(component).toBeTruthy();
    });

    it("ngOnInit() devrait permettre à l'abonnement à obtenirJeu()", () => {
        const abonnerAuSocketEvenementJeuxStub = spyOn<any>(component, 'abonnerAuSocketEvenementJeux');
        const abonnerAuSocketEvenementSalleEstPleineStub = spyOn<any>(component, 'abonnerAuSocketEvenementSalleEstPleine');
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.ngOnInit();
        expect(sendSpy).toHaveBeenCalled();
        expect(abonnerAuSocketEvenementJeuxStub).toHaveBeenCalled();
        expect(abonnerAuSocketEvenementSalleEstPleineStub).toHaveBeenCalled();
    });

    it('mettreAJourContenu devrait initialiser listeJeuxServeur, jeuxAffiche, indexPremierJe', () => {
        const listeDeJeux: InterfaceJeux[] = [jeuTest, jeuTest, jeuTest, jeuTest, jeuTest];
        component.mettreAJourContenu(listeDeJeux);
        expect(component['listeJeuxServeur']).toEqual(listeDeJeux);
        expect(component.jeuxAffiches).toEqual([jeuTest, jeuTest, jeuTest, jeuTest]);
        expect(component['indexPremierJeu']).toEqual(0);
        expect(component.debutListe).toBe(true);
        expect(component.listeFinie).toBe(false);
    });

    it('jeuxSuivant devrait appeler changerJeux(true)', () => {
        const changerJeuxSpy = spyOn<any>(component, 'changerJeux');
        component.jeuxSuivants();
        expect(changerJeuxSpy).toHaveBeenCalledWith(true);
    });
    it('jeuxPrécédent devrait appeler changerJeux(false)', () => {
        const changerJeuxSpy = spyOn<any>(component, 'changerJeux');
        component.jeuxPrecedents();
        expect(changerJeuxSpy).toHaveBeenCalledWith(false);
    });
    it("VerifDepassement(true) devrait retourner true s'il n'y a pas de dépassement et false dans le cas contraire", () => {
        component['indexPremierJeu'] = 0;
        let retourDroite: boolean = component['verifierDepassement'](true);
        expect(retourDroite).toBe(true);
        expect(component.listeFinie).toBe(false);
        component['indexPremierJeu'] = 4;
        retourDroite = component['verifierDepassement'](true);
        expect(retourDroite).toBe(false);
        expect(component.listeFinie).toBe(true);
    });
    it("VerifDepassement(false) devrait retourner false s'il n'y a pas de dépassement et true dans le cas contraire", () => {
        component['indexPremierJeu'] = 0;
        let retourGauche: boolean = component['verifierDepassement'](false);
        expect(retourGauche).toBe(false);
        expect(component.debutListe).toBe(true);
        component['indexPremierJeu'] = 4;
        retourGauche = component['verifierDepassement'](false);
        expect(retourGauche).toBe(true);
        expect(component.debutListe).toBe(false);
    });
    it('changerJeux(false) devrait afficher les jeux précédents et bloquer en début de liste', () => {
        component['indexPremierJeu'] = 4;
        (component as any).changerJeux(false);
        expect(component['indexPremierJeu']).toEqual(0);
        expect(component.jeuxAffiches).toEqual([jeuTest, jeuTest, jeuTest, jeuTest]);
        (component as any).changerJeux(false); // on vérifie quand début de liste l'affichage ne change pas
        expect(component['indexPremierJeu']).toEqual(0);
        expect(component.jeuxAffiches).toEqual([jeuTest, jeuTest, jeuTest, jeuTest]);
    });
    it('changerJeux(true) devrait afficher les prochains jeux et bloquer en fin de liste', () => {
        component['indexPremierJeu'] = 0;
        (component as any).changerJeux(true);
        expect(component['indexPremierJeu']).toEqual(4);
        expect(component.jeuxAffiches).toEqual([jeuTest, jeuTest]);
        (component as any).changerJeux(true); // on vérifie quand fin de liste l'affichage ne change pas
        expect(component['indexPremierJeu']).toEqual(4);
        expect(component.jeuxAffiches).toEqual([jeuTest, jeuTest]);
    });
    it("abonnerAuSocketEvenementJeux() devrait mettre à jour contenu lors de l'evenement Jeux", () => {
        const mettreAJourContenuSpy = spyOn(component, 'mettreAJourContenu');
        component['abonnerAuSocketEvenementJeux']();
        assistantSocket.emitParLesPairs(SocketEvenements.Jeux, [jeuTest, jeuTest, jeuTest]);
        expect(mettreAJourContenuSpy).toHaveBeenCalled();
    });
    it("abonnerAuSocketEvenementSalleEstPleine() lancer une alerte ou call navigate(['/joindre-partie'])", () => {
        const alertSpy = spyOn(window, 'alert');
        component['abonnerAuSocketEvenementSalleEstPleine']();
        assistantSocket.emitParLesPairs(SocketEvenements.SalleEstPleine, true);
        expect(alertSpy).toHaveBeenCalled();
        assistantSocket.emitParLesPairs(SocketEvenements.SalleEstPleine, false);
        expect(routerSpy.navigate).toHaveBeenCalled();
    });
});
