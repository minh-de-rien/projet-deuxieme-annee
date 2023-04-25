import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { joueurTest } from '@common/constantes/constantes-test';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { Socket } from 'socket.io-client';
import { CreerPartieComponent } from './creer-partie.component';
import SpyObj = jasmine.SpyObj;

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('CreerPartieComponent', () => {
    let component: CreerPartieComponent;
    let fixture: ComponentFixture<CreerPartieComponent>;
    let socketServiceSpy: GestionSocketClientService;
    let assisantSocket: AssistantTestsSocket;
    let salleAttenteServiceSpy: SpyObj<GestionSalleAttenteService>;

    beforeEach(async () => {
        assisantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assisantSocket as unknown as Socket;
        salleAttenteServiceSpy = jasmine.createSpyObj('GestionSalleAttenteService', [
            'abonnerADiffusionJoueur',
            'abonnerAuSocketLancerPartie',
            'abonnerAuSocketAnnonceSuppressionSalle',
            'abonnerASocketInvalide',
            'joueur',
        ]);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatProgressBarModule],
            declarations: [CreerPartieComponent],
            providers: [
                { provide: GestionSalleAttenteService, useValue: salleAttenteServiceSpy },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreerPartieComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it("ngInit() devrait appeler toutes les fonctions d'abonnement", () => {
        const abonnerAuSocketInviteAQuitteSalleSpy = spyOn<any>(component, 'abonnerAuSocketInviteAQuitteSalle');
        const abonnerAuSocketDemandeJoindrePartieSpy = spyOn<any>(component, 'abonnerAuSocketDemandeJoindrePartie');
        component.ngOnInit();
        expect(salleAttenteServiceSpy.abonnerADiffusionJoueur).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerAuSocketLancerPartie).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerAuSocketAnnonceSuppressionSalle).toHaveBeenCalled();
        expect(abonnerAuSocketInviteAQuitteSalleSpy).toHaveBeenCalled();
        expect(abonnerAuSocketDemandeJoindrePartieSpy).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerASocketInvalide).toHaveBeenCalled();
    });
    it('demarerPartie() devrait send(SocketEvenements.AccepterInvite)', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.demarrerPartie();
        expect(sendSpy).toHaveBeenCalled();
    });
    it('rejeterJoueur() devrait send(SocketEvenements.RejeterInvite) et mettre aRejoint à false', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.rejeterJoueur();
        expect(sendSpy).toHaveBeenCalled();
        expect(component.aRejoint).toEqual(false);
    });
    it('abonnerAuSocketDemandeJoindrePartie() devrait instancier nomInvite, joueurInvite, et aRejoint', () => {
        component['abonnerAuSocketDemandeJoindrePartie']();
        assisantSocket.emitParLesPairs(SocketEvenements.DemandeJoindrePartie, joueurTest);
        expect(component.nomInvite).toEqual('');
        expect(component.joueurInvite).toEqual(joueurTest);
        expect(component.aRejoint).toEqual(true);
    });
    it('abonnerAuSocketInviteAQuitteSalle() devrait mettre aRejoint a false et pop une alerte', () => {
        spyOn(window, 'alert');
        component['abonnerAuSocketDemandeJoindrePartie']();
        assisantSocket.emitParLesPairs(SocketEvenements.InviteAQuitteSalle, joueurTest);
        expect(component.aRejoint).toEqual(false);
        expect(window.alert).toHaveBeenCalled();
    });
});
