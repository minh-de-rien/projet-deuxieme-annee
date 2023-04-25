import { Test, TestingModule } from '@nestjs/testing';
import { GestionConstantesTempsJeuxService } from './gestion-constantes-temps-jeux.service';

describe('GestionConstantesTempsJeuxService', () => {
    let service: GestionConstantesTempsJeuxService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GestionConstantesTempsJeuxService],
        }).compile();

        service = module.get<GestionConstantesTempsJeuxService>(GestionConstantesTempsJeuxService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
