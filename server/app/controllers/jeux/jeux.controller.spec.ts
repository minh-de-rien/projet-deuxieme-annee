/* eslint-disable @typescript-eslint/no-magic-numbers */
import { FichiersJeuxService } from '@app/services/fichiers-jeux/fichiers-jeux.service';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { JeuxController } from './jeux.controller';
// import { Vec2 } from '@common/vec2';
import { GestionPartiesCourantes } from '@app/services/gestion-parties-courantes/gestion-parties-courantes.service';

describe('JeuxController', () => {
    let jeuxController: JeuxController;
    let fichiersJeuxService: SinonStubbedInstance<FichiersJeuxService>;
    let gestionDifferenceService: SinonStubbedInstance<GestionPartiesCourantes>;
    const SCORE = [
        { nomJoueur: 'Pol Malone1', temps: 420 },
        { nomJoueur: 'LePujanJames1', temps: 6969 },
        { nomJoueur: 'Mr Worldwide1', temps: 9235 },
    ];

    beforeEach(async () => {
        fichiersJeuxService = createStubInstance(FichiersJeuxService);
        gestionDifferenceService = createStubInstance(GestionPartiesCourantes);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [JeuxController],
            providers: [
                {
                    provide: FichiersJeuxService,
                    useValue: fichiersJeuxService,
                },
                {
                    provide: GestionPartiesCourantes,
                    useValue: gestionDifferenceService,
                },
            ],
        }).compile();

        jeuxController = module.get<JeuxController>(JeuxController);
    });

    it('should be defined', () => {
        expect(jeuxController).toBeDefined();
    });
    // it('obtenirDifferencesRestantes doit retourner les differences restantes dans une partie', () => {
    //     const partieMock = new Classique([joueurTest]);
    //     const vec2TabMock = [[{ x: 4, y: 3 }]];
    //     gestionDifferenceService.obtenirPartie.returns(partieMock);
    //     jest.spyOn(partieMock, 'obtenirRegroupementDiffRestantes').mockReturnValue(vec2TabMock);
    //     const res = {} as unknown as Response;
    //     res.json = (differences) => {
    //         expect(differences).toEqual(vec2TabMock);
    //         return res;
    //     };
    //     jeuxController.obtenirDifferencesRestantes('salleId', res);
    // });

    it('obtenirJeux() doit retourner tous les jeux', async () => {
        const jeuxAttendus: InterfaceJeux[] = [
            {
                id: 0,
                nom: 'jeux test 1',
                meilleursTempsSolo: SCORE,
                meilleursTemps1v1: SCORE,
                imgOriginale: 'urlImageOriginale',
                imgModifiee: 'urlImageModifiee',
                nombreDifferences: 3,
            },

            {
                id: 1,
                nom: 'jeux test 2',
                meilleursTempsSolo: SCORE,
                meilleursTemps1v1: SCORE,
                imgOriginale: 'urlImageOriginale1',
                imgModifiee: 'urlImageModifiee1',
                nombreDifferences: 3,
            },
        ];
        fichiersJeuxService.obtenirJeux.resolves(jeuxAttendus);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (ficheJeux) => {
            expect(ficheJeux).toEqual(jeuxAttendus);
            return res;
        };
        jeuxController.obtenirFicheJeux(res);
    });

    it('obtenirJeux() devrait retourner NOT_FOUND si la récupération a échoué', async () => {
        fichiersJeuxService.obtenirJeux.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await jeuxController.obtenirFicheJeux(res);
    });

    it('obtenirJeu() doit retourner le jeu associé au id', async () => {
        const jeuAttendu: InterfaceJeux = {
            id: 1,
            nom: 'jeux test 2',
            meilleursTempsSolo: [
                { nomJoueur: 'Pol Malone1', temps: 420 },
                { nomJoueur: 'LePujanJames1', temps: 6969 },
                { nomJoueur: 'Mr Worldwide1', temps: 9235 },
            ],
            meilleursTemps1v1: SCORE,
            imgOriginale: 'urlImageOriginale1',
            imgModifiee: 'urlImageModifiee1',
            nombreDifferences: 3,
        };

        fichiersJeuxService.obtenirJeu.resolves(jeuAttendu);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (jeu) => {
            expect(jeu).toEqual(jeuAttendu);
            return res;
        };
        jeuxController.obtenirJeu('1', res);
    });

    it('obtenirJeu() devrait retourner NOT_FOUND si la récupération a échoué', async () => {
        fichiersJeuxService.obtenirJeu.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await jeuxController.obtenirJeu('0', res);
    });

    it('ajouterJeuAuServeur() devrait retourner created si ajout de jeu fonctionne', async () => {
        fichiersJeuxService.ajouterJeu.resolves();
        const reponse = {} as unknown as Response;
        reponse.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return reponse;
        };
        reponse.send = () => reponse;

        const jeuAjout: InterfaceJeux = {
            id: 1,
            nom: 'jeux test 2',
            meilleursTempsSolo: SCORE,
            meilleursTemps1v1: SCORE,
            imgOriginale: 'urlImageOriginale1',
            imgModifiee: 'urlImageModifiee1',
            nombreDifferences: 3,
        };

        await jeuxController.ajouterJeuAuServeur(jeuAjout, reponse);
    });

    it('ajouterJeu() devrait retourner BAD_REQUEST quand le jeu nest pas poste', async () => {
        fichiersJeuxService.ajouterJeu.rejects();
        const reponse = {} as unknown as Response;
        reponse.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return reponse;
        };
        reponse.send = () => reponse;
        const jeuAjout: InterfaceJeux = {
            id: 1,
            nom: 'jeux test 2',
            meilleursTempsSolo: SCORE,
            meilleursTemps1v1: SCORE,
            imgOriginale: 'urlImageOriginale1',
            imgModifiee: 'urlImageModifiee1',
            nombreDifferences: 3,
        };

        await jeuxController.ajouterJeuAuServeur(jeuAjout, reponse);
    });
});
