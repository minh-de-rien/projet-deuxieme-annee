import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
    constructor(private app: INestApplicationContext, private configService: ConfigService) {
        super(app);
    }

    createIOServer(port: number, options?: ServerOptions) {
        port = this.configService.get<number>('CHAT_WEBSOCKET_PORT');
        const server = super.createIOServer(port, options);
        return server;
    }
}
