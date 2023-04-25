import { FichiersJeuxService } from '@app/services/fichiers-jeux/fichiers-jeux.service';
import { GestionPartiesCourantes } from '@app/services/gestion-parties-courantes/gestion-parties-courantes.service';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('jeux')
export class JeuxController {
    constructor(private readonly fichiersJeux: FichiersJeuxService, private readonly gestionPartiesCourantes: GestionPartiesCourantes) {}
    @ApiOkResponse({
        description: 'Obtenir les jeux à afficher dans les fiches',
        type: String,
    })
    @ApiNotFoundResponse({
        description: 'Retourne NOT_FOUND http status quand la requête échoue',
    })
    @Get('/ficheJeux')
    async obtenirFicheJeux(@Res() response: Response) {
        try {
            const jeux = await this.fichiersJeux.obtenirJeux();
            response.status(HttpStatus.OK).json(jeux);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/differencesRestantes/:idSalle')
    async obtenirDifferencesRestantes(@Param('idSalle') idSalle: string, @Res() response: Response) {
        try {
            if (this.gestionPartiesCourantes.obtenirPartie(idSalle)) {
                const differences: Vec2[][] = this.gestionPartiesCourantes.obtenirPartie(idSalle).obtenirRegroupementDiffRestantes();
                response.status(HttpStatus.OK).json(differences);
            }
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/:id')
    async obtenirJeu(@Param('id') id: string, @Res() response: Response) {
        try {
            const jeu = await this.fichiersJeux.obtenirJeu(parseInt(id, 10));
            response.status(HttpStatus.OK).json(jeu);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/constantes/:idSalle')
    obtenirConstantes(@Param('idSalle') idSalle: string, @Res() response: Response) {
        try {
            const constantesDeTemps: ConstantesTempsJeux = this.gestionPartiesCourantes.obtenirPartie(idSalle).constantesDeTemps;
            response.status(HttpStatus.OK).json(constantesDeTemps);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/tempsDeDepart/:idSalle')
    obtenirTempsDeDepart(@Param('idSalle') idSalle: string, @Res() response: Response) {
        try {
            const tempsDeDepart: number = this.gestionPartiesCourantes.obtenirPartie(idSalle).obtenirTempsDeDepart();
            response.status(HttpStatus.OK).json(tempsDeDepart);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Post('jeu')
    async ajouterJeuAuServeur(@Body() nouveauJeu: InterfaceJeux, @Res() response: Response) {
        try {
            await this.fichiersJeux.ajouterJeu(nouveauJeu);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    // @Post('images')
    // @UseInterceptors(
    //     FilesInterceptor('images', NOMBRE_DE_FICHIERS, {
    //         storage: diskStorage({
    //             destination: (req, file, callBack) => {
    //                 callBack(null, 'assets/images/');
    //             },
    //             filename: (req, file, callback) => {
    //                 callback(null, file.originalname);
    //             },
    //         }),
    //     }),
    // )
    // ajouterImagesAuServeur(@Res() reponse: Response) {
    //     reponse.status(HttpStatus.ACCEPTED);
    // }
}
