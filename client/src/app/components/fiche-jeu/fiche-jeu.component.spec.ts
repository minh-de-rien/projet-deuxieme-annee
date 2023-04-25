import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { jeuTest, joueurTest } from '@common/constantes/constantes-test';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Joueur } from '@common/interface/joueur';
import { Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { FicheJeuComponent } from './fiche-jeu.component';
import SpyObj = jasmine.SpyObj;

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('FicheJeuComponent', () => {
    let component: FicheJeuComponent;
    let fixture: ComponentFixture<FicheJeuComponent>;
    let diffusionJoueurServiceSpy: SpyObj<DiffusionJoueurService>;
    let socketServiceSpy: GestionSocketClientService;
    let assistantSocket: AssistantTestsSocket;
    const routerSpy = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        assistantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assistantSocket as unknown as Socket;
        diffusionJoueurServiceSpy = jasmine.createSpyObj('DiffusionJoueurService', ['definirJoueur']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, HttpClientTestingModule],
            declarations: [FicheJeuComponent],
            providers: [
                {
                    provide: DomSanitizer,
                    useValue: {
                        bypassSecurityTrustResourceUrl: (val: string) => val,
                    },
                },
                { provide: DiffusionJoueurService, useValue: diffusionJoueurServiceSpy },
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(FicheJeuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit() devrait assigner jeu.imgOriginale à lienImageOriginale', () => {
        component.jeu = jeuTest;
        component.ngOnInit();
        expect(component.lienImageOriginale).toEqual(jeuTest.imgOriginale);
    });

    it("ngOnInit() devrait assigner '' à lienImageOriginale", () => {
        component.ngOnInit();
        expect(component.lienImageOriginale).toEqual('');
    });
    it("ouvirBoiteDialogue() devrait appeler la bonne méthode selon son paramètre d'entré, ou ne rien appeler si le nom n'est pas valide", () => {
        const subject = new Subject();
        const observable = subject as Observable<any>;
        component.jeu = jeuTest;

        const matDialogRefObj = jasmine.createSpyObj('MatDialogRef<DialogAjouteNomJoueurComponent>', ['afterClosed']);
        const dialogSpy = spyOn(component['dialog'], 'open').and.callFake(() => {
            return matDialogRefObj;
        });
        matDialogRefObj.afterClosed.and.callFake(() => {
            return observable;
        });
        const lancerPartieSoloSpy = spyOn<any>(component, 'lancerPartieSolo');
        const gererCreationPartie1v1Spy = spyOn<any>(component, 'gererCreationPartie1v1');
        const alerteSpy = spyOn(window, 'alert');

        component.ouvrirBoiteDialogue(true);
        subject.next({ salutation: 'coucou', nomJoueur: '' });
        expect(alerteSpy).toHaveBeenCalledWith(MessageAlerte.NomJoueurRequis);
        expect(gererCreationPartie1v1Spy).not.toHaveBeenCalled();
        expect(lancerPartieSoloSpy).not.toHaveBeenCalled();

        component.ouvrirBoiteDialogue(true);
        expect(dialogSpy).toHaveBeenCalled();

        subject.next({ salutation: 'coucou', nomJoueur: 'jojoSolo' });
        expect(lancerPartieSoloSpy).toHaveBeenCalled();

        component.ouvrirBoiteDialogue(false);
        subject.next({ salutation: 'coucou', nomJoueur: 'jojoMulti' });
        expect(gererCreationPartie1v1Spy).toHaveBeenCalled();
    });
    it('supprimerJeu() devrait appeler send et emit avec les bons arguments', () => {
        component.jeu = jeuTest;
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.supprimerJeu();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.AnnonceSuppressionJeu, component.jeu.id);
    });
    it('reinitialiserScore() devrait appeler send et emit avec les bons arguments', () => {
        component.jeu = jeuTest;
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.reinitialiserScore();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.AnnonceReinitialisationScore, component.jeu.nom);
    });

    it('navigationSalleAttenteHote() devrait appeler definirJoueur, send, et navigate avec les bons arguments', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        const spyAttente = spyOn<any>(component, 'attendreAttributionSalle');
        component['navigationSalleAttenteHote'](joueurTest);
        expect(spyAttente).toHaveBeenCalledWith(joueurTest);
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.CreerSalle, joueurTest);
    });
    it('navigationSalleAttenteInvite() devrait appeler definirJoueur et send avec les bons arguments', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send'); // Revoir duplication code
        component['navigationSalleAttenteInvite'](joueurTest);
        expect(diffusionJoueurServiceSpy.definirJoueur).toHaveBeenCalledWith(joueurTest);
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.RejoindreSalle, joueurTest);
    });
    it('lancerPartieSolo() devrait appeler definirJoueur, send, et navigate avec les bons arguments', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send'); // Revoir duplication code
        const attendreAttributionSalleSpy = spyOn<any>(component, 'attendreAttributionSalle');
        component['lancerPartieSolo'](joueurTest);
        expect(joueurTest.estSolo).toBe(true);
        expect(attendreAttributionSalleSpy).toHaveBeenCalledWith(joueurTest);
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.CreerSalle, joueurTest);
    });
    it('gererCreationPartie1v1() devrait appeler navigationSalleAttenteHote ou navigationSalleAttenteInvite ', () => {
        const navigationSalleAttenteHoteSpy = spyOn<any>(component, 'navigationSalleAttenteHote');
        const navigationSalleAttenteInviteSpy = spyOn<any>(component, 'navigationSalleAttenteInvite');
        component.jeu = jeuTest;
        component['gererCreationPartie1v1'](false, joueurTest);
        expect(navigationSalleAttenteHoteSpy).toHaveBeenCalled();
        component['gererCreationPartie1v1'](true, joueurTest);
        expect(navigationSalleAttenteInviteSpy).toHaveBeenCalled();
    });
    it('attendreAttributionSalle() devrait appeler la diffusion du joueur et navigate ', () => {
        const joueurMock: Joueur = {
            nom: 'joueurTest',
            estSolo: true,
        };
        component['attendreAttributionSalle'](joueurMock);
        assistantSocket.emitParLesPairs(SocketEvenements.SalleId, 'salleTest');
        expect(diffusionJoueurServiceSpy.definirJoueur).toHaveBeenCalled();

        joueurMock.estSolo = false;
        component['attendreAttributionSalle'](joueurMock);
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('convertirSecondesEnMinutesSeconde() devrait retourner une chaine de carectere', () => {
        expect(component.convertirSecondesEnMinutesSeconde(120).includes(':')).toEqual(true);
    });
});
