import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Test, TestingModule } from '@nestjs/testing';
import { SocketIoAdapter } from './socket-adapter';

describe('SocketIoAdapter', () => {
    let adapter: SocketIoAdapter;
    let superSpy: IoAdapter;
    let configServiceSpy: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SocketIoAdapter, IoAdapter, ConfigService],
        }).compile();

        adapter = module.get<SocketIoAdapter>(SocketIoAdapter);
        superSpy = module.get<IoAdapter>(IoAdapter);
        configServiceSpy = module.get<ConfigService>(ConfigService);
        adapter['configService'] = configServiceSpy;
    });
    it('should be defined', () => {
        expect(adapter).toBeDefined();
    });
    it('createIOServer() devrait call super.createIOServer()', () => {
        jest.spyOn(superSpy, 'createIOServer');
        adapter.createIOServer(0);
    });
});
