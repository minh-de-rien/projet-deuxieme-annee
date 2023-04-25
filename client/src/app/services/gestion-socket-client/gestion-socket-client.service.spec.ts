// code provenant de :
// https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/services/socket-client.service.spec.ts

/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { Socket } from 'socket.io-client';

import { GestionSocketClientService } from './gestion-socket-client.service';

describe('GestionSocketClientService', () => {
    let service: GestionSocketClientService;
    const evenement = 'helloWorld';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GestionSocketClientService);
        service.socket = new AssistantTestsSocket() as unknown as Socket;
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });
    it('devrait appeler socket.on avec un evenement', () => {
        const action = () => {};
        const spy = spyOn(service.socket, 'on');
        service.on(evenement, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(evenement, action);
    });
    it('devrait appeler socket.once avec un evenement', () => {
        const action = () => {};
        const spy = spyOn(service.socket, 'once');
        service.once(evenement, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(evenement, action);
    });

    it("devrait appeler emit avec data lors d'un send", () => {
        const donnee = 42;
        const spy = spyOn(service.socket, 'emit');
        service.send(evenement, donnee);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(evenement, donnee);
    });

    it("devrait appeler emit sans data lors d'un send si data est undefined", () => {
        const donnee = undefined;
        const spy = spyOn(service.socket, 'emit');
        service.send(evenement, donnee);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(evenement);
    });

    it("devrait appeler emit avec deux datas lors d'un send comportant deux datas", () => {
        const donnee = 21;
        const spy = spyOn(service.socket, 'emit');
        service.send(evenement, donnee, donnee);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(evenement, donnee, donnee);
    });
});
