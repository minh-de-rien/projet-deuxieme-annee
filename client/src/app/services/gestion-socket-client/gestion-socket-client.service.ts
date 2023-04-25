import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GestionSocketClientService {
    socket: Socket;

    constructor() {
        this.socket = io(environment.webSocketUrl);
    }

    on<T>(evenement: string, action: (donnee: T) => void): void {
        this.socket.on(evenement, action);
    }

    once<T>(evenement: string, action: (donnee: T) => void): void {
        this.socket.once(evenement, action);
    }

    send<T, Q>(evenement: string, donnee?: T, donnee1?: Q): void {
        if (donnee !== undefined && donnee1 !== undefined) {
            this.socket.emit(evenement, donnee, donnee1);
        } else if (donnee !== undefined) {
            this.socket.emit(evenement, donnee);
        } else {
            this.socket.emit(evenement);
        }
    }
}
