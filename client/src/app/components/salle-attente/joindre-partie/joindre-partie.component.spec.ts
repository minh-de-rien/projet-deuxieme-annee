import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { joueurTest } from '@common/constantes/constantes-test';
import { MessageAlerte } from '@common/enum/message-alerte';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { DELAI_AVANT_RETOUR } from '@common/valeurs-par-defaut';
import { Socket } from 'socket.io-client';
import { JoindrePartieComponent } from './joindre-partie.component';
import SpyObj = jasmine.SpyObj;

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('JoindrePartieComponent', () => {
    let component: JoindrePartieComponent;
    let fixture: ComponentFixture<JoindrePartieComponent>;
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
            'retourArriere',
        ]);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatProgressBarModule],
            declarations: [JoindrePartieComponent],
            providers: [
                { provide: GestionSalleAttenteService, useValue: salleAttenteServiceSpy },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(JoindrePartieComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it("ngInit() devrait appeler toutes les fonctions d'abonnement", () => {
        const abonnerAuSocketHoteAQuitteSalleSpy = spyOn<any>(component, 'abonnerAuSocketHoteAQuitteSalle');
        const abonnerAuSocketRejeteDeLaSalleSpy = spyOn<any>(component, 'abonnerAuSocketRejeteDeLaSalle');
        component.ngOnInit();
        expect(salleAttenteServiceSpy.abonnerADiffusionJoueur).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerAuSocketLancerPartie).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerAuSocketAnnonceSuppressionSalle).toHaveBeenCalled();
        expect(abonnerAuSocketHoteAQuitteSalleSpy).toHaveBeenCalled();
        expect(abonnerAuSocketRejeteDeLaSalleSpy).toHaveBeenCalled();
        expect(salleAttenteServiceSpy.abonnerASocketInvalide).toHaveBeenCalled();
    });
    it('abonnerAuSocketRejeteDeLaSalle() devrait instancier nomHote, aRejoint et appeler retourArriere', () => {
        component['abonnerAuSocketRejeteDeLaSalle']();
        assisantSocket.emitParLesPairs(SocketEvenements.RejeteDeLaSalle, joueurTest);
        expect(component.nomHote).toEqual('');
        expect(salleAttenteServiceSpy.retourArriere).toHaveBeenCalledWith(DELAI_AVANT_RETOUR);
        expect(component.aRejete).toEqual(true);
    });
    it('abonnerAuSocketHoteAQuitteSalle() devrait appeler retourArriere et pop une alerte', () => {
        spyOn(window, 'alert');
        component['abonnerAuSocketHoteAQuitteSalle']();
        assisantSocket.emitParLesPairs(SocketEvenements.HoteAQuitteSalle);
        expect(window.alert).toHaveBeenCalledWith(MessageAlerte.HoteQuiteSalle);
        expect(salleAttenteServiceSpy.retourArriere).toHaveBeenCalledWith(DELAI_AVANT_RETOUR);
    });
});
