import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { ZoneMessagerieComponent } from '@app/components/zone-messagerie/zone-messagerie.component';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { joueurTest } from '@common/constantes/constantes-test';
import { Message } from '@common/interface/message';
import { Socket } from 'socket.io-client';

describe('ZoneMessagerie', () => {
    let component: ZoneMessagerieComponent;
    let fixture: ComponentFixture<ZoneMessagerieComponent>;
    let socketServiceSpy: GestionSocketClientService;
    let messageTest: Message;
    const message = 'message';
    let assisantSocket: AssistantTestsSocket;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ZoneMessagerieComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ZoneMessagerieComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        assisantSocket = new AssistantTestsSocket();
        socketServiceSpy = TestBed.inject(GestionSocketClientService);
        socketServiceSpy.socket = assisantSocket as unknown as Socket;

        messageTest = {} as Message;
    });

    it('devrait créer', () => {
        component.joueur = joueurTest;
        expect(component).toBeTruthy();
    });

    it('ngOnInit() devrait récupérer le message du serveur', () => {
        spyOn(component.messages, 'push');
        component.ngOnInit();
        assisantSocket.emitParLesPairs(message, messageTest);

        expect(component.messages).toContain(messageTest);
    });

    it('envoyerMessage() devrait envoyer un message au serveur', () => {
        const contenuMessageTest = '';
        component.joueur = joueurTest;
        messageTest = { destinateur: component.joueur, contenu: contenuMessageTest };
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-shadow
        const action = (messageTest: Message) => {};
        const sendSpy = spyOn(socketServiceSpy, 'send');

        component.envoyerMessage(contenuMessageTest);
        socketServiceSpy.socket.on(message, action);

        expect(sendSpy).toHaveBeenCalledWith(message, messageTest);
        expect(component.texte).toEqual('');
    });
});
