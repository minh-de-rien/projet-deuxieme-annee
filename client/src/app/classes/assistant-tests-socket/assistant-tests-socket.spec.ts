import { TestBed } from '@angular/core/testing';
import { AssistantTestsSocket } from './assistant-tests-socket';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('AssistantTestsSocket', () => {
    let assistantTestsSocket: AssistantTestsSocket;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AssistantTestsSocket],
        });

        assistantTestsSocket = TestBed.inject(AssistantTestsSocket);
    });

    it('devrait être créé', () => {
        expect(assistantTestsSocket).toBeTruthy();
    });

    it('disconnectSpy() devrait être appelé', () => {
        const retour = assistantTestsSocket.disconnect();
        expect(retour).toEqual();
    });

    it('devrait être créé', () => {
        const spy = { callbacks: jasmine.createSpyObj('callbacks', ['has']) };
        assistantTestsSocket.emitParLesPairs('');
        expect(spy.callbacks.has).not.toContain('');
    });
});
