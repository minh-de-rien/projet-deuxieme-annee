import { JeuxController } from '@app/controllers/jeux/jeux.controller';
import { GestionPartiesCourantes } from '@app/services/gestion-parties-courantes/gestion-parties-courantes.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SocketGateway } from './gateways/socket/socket.gateway';
import { Score, scoreSchema } from './modele/base-de-donnes/score';
import { FichiersJeuxService } from './services/fichiers-jeux/fichiers-jeux.service';
import { GestionConstantesTempsJeuxService } from './services/gestion-constantes-temps-jeux/gestion-constantes-temps-jeux.service';
import { GestionMessagesService } from './services/gestion-messages/gestion-messages.service';
import { GestionSallesService } from './services/gestion-salles/gestion-salles.service';
import { ScoreService } from './services/score/score.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Score.name, schema: scoreSchema }]),
        ServeStaticModule.forRoot({ rootPath: './assets/images', serveRoot: '/images' }),
    ],
    controllers: [JeuxController],
    providers: [
        SocketGateway,
        Logger,
        ScoreService,
        FichiersJeuxService,
        GestionConstantesTempsJeuxService,
        GestionPartiesCourantes,
        GestionSallesService,
        GestionMessagesService,
    ],
})
export class AppModule {}
