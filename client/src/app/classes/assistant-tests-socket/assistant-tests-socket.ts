// code provenant de :
// https://gitlab.com/nikolayradoev/socket-io-exemple/-/blob/master/client/src/app/classes/socket-test-helper.ts

/* eslint-disable */
type CallbackSignature = (params: any) => {};

export class AssistantTestsSocket {
    on(evenement: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(evenement)) {
            this.callbacks.set(evenement, []);
        }

        this.callbacks.get(evenement)!.push(callback);
    }
    once(evenement: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(evenement)) {
            this.callbacks.set(evenement, []);
        }

        this.callbacks.get(evenement)!.push(callback);
    }

    emit(evenement: string, ...params: any): void {
        return;
    }

    disconnect(): void {
        return;
    }

    emitParLesPairs(evenement: string, params?: any) {
        if (!this.callbacks.has(evenement)) {
            return;
        }

        for (const callback of this.callbacks.get(evenement)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}
