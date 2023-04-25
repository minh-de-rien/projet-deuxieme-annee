import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Joueur } from '@common/interface/joueur';
import { DELAI_AVANT_RETOUR } from '@common/valeurs-par-defaut';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { GestionSalleAttenteService } from './gestion-salle-attente.service';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
const tabJoueurTest: Joueur[] = [
    {
        nom: '',
        estHote: true,
        idSalle: '',
        idJeu: 0,
        adversaire: '',
    },
    {
        nom: 'advTest',
        estHote: true,
        idSalle: '',
        idJeu: 0,
        adversaire: '',
    },
];
describe('GestionSalleAttenteService', () => {
    let service: GestionSalleAttenteService;
    let socketServiceSpy: GestionSocketClientService;
    let assistantSocket: AssistantTestsSocket;
    const routerSpy = {
        navigate: jasmine.createSpy('navigate'),
    };

    let serviceDiffusionSpy: DiffusionJoueurService;

    beforeEach(() => {
        assistantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assistantSocket as unknown as Socket;
        serviceDiffusionSpy = jasmine.createSpyObj('DiffusionJoueurService', ['definirJoueur']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                GestionSalleAttenteService,
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: DiffusionJoueurService, useValue: serviceDiffusionSpy },
            ],
        });
        service = TestBed.inject(GestionSalleAttenteService);
    });
    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });
    it('abonnerAuSocketLancerPartie() devrait appeler definirJoueur, navigate et donner une valeur à joueur.adversaire', () => {
        service.joueur = tabJoueurTest[0];
        service.abonnerAuSocketLancerPartie(0, 1);
        assistantSocket.emitParLesPairs(SocketEvenements.LancerPartie, tabJoueurTest);
        expect(service.joueur.adversaire).toEqual('advTest');
        expect(serviceDiffusionSpy.definirJoueur).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game']);
    });
    it('abonnerAuSocketAnnonceSuppressionSalle() devrait appeler definirJoueur, navigate et donner une valeur à joueur.adversaire', () => {
        const alertSpy = spyOn(window, 'alert');
        const retourArriereSpy = spyOn(service, 'retourArriere');
        service.abonnerAuSocketAnnonceSuppressionSalle();
        assistantSocket.emitParLesPairs(SocketEvenements.AnnonceSuppressionSalle);
        expect(alertSpy).toHaveBeenCalledWith(MessageAlerte.JeuSupprimer);
        expect(retourArriereSpy).toHaveBeenCalledWith(DELAI_AVANT_RETOUR);
    });
    it('abonnerADiffusionJoueur() devrait récupérer la valeur de joueur', () => {
        serviceDiffusionSpy.joueur = new BehaviorSubject<Joueur>(tabJoueurTest[0]);
        service.abonnerADiffusionJoueur();
        serviceDiffusionSpy.definirJoueur(tabJoueurTest[0]);
        expect(service.joueur).toEqual(tabJoueurTest[0]);
    });
    it('abonnerASocketInvalide() devrait récupérer la valeur de joueur', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        service.abonnerASocketInvalide();
        assistantSocket.emitParLesPairs(SocketEvenements.SocketInvalide);
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.VerifierSocket);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
    it('retourArriere() devrait send quitterSalle et appeler navigate', fakeAsync(() => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        routerSpy.navigate.and.resolveTo(true);
        spyOn<any>(service, 'reloadPage');
        service.retourArriere();
        tick();
        expect(service['reloadPage']).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalled();
    }));
    it('reloadPage(0 devrait call window.location.reload', () => {
        const windowLocationStub = jasmine.createSpyObj(window.location, ['reload']);
        service['reloadPage'](windowLocationStub);
        expect(windowLocationStub.reload).toHaveBeenCalled();
    });
});
