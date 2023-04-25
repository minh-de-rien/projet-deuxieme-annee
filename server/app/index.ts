import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { SocketIoAdapter } from './gateways/socket-adapter';

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du projet de base pour le cours de LOG2990')
        .setVersion('1.0.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);

    app.useWebSocketAdapter(new SocketIoAdapter(app, app.get(ConfigService)));
    await app.listen(process.env.PORT);
};

bootstrap();
