/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ScoreService } from '@app/services/score/score.service';
import { jeuTest } from '@common/constantes/constantes-test';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import Sinon, { SinonStubbedInstance, createSandbox } from 'sinon';
import { FichiersJeuxService } from './fichiers-jeux.service';

const jeuxTest: InterfaceJeux[] = [
    {
        id: 0,
        nom: 'Les ballons',
        meilleursTempsSolo: [],
        meilleursTemps1v1: [],
        imgOriginale: 'urlTest',
        imgModifiee: '',
        nombreDifferences: 3,
    },
    {
        id: 1,
        nom: 'Le ciel bleu',
        meilleursTempsSolo: [],
        meilleursTemps1v1: [],
        imgOriginale: 'urlTest1',
        imgModifiee: '',
        nombreDifferences: 5,
    },
];

describe('FichiersJeuxService', () => {
    let service: FichiersJeuxService;
    let sandbox: Sinon.SinonSandbox;
    let scoreService: SinonStubbedInstance<ScoreService>;

    beforeEach(async () => {
        sandbox = createSandbox();
        scoreService = sandbox.createStubInstance(ScoreService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FichiersJeuxService,
                {
                    provide: ScoreService,
                    useValue: scoreService,
                },
            ],
        }).compile();
        service = module.get<FichiersJeuxService>(FichiersJeuxService);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('devrait être défini', () => {
        expect(service).toBeDefined();
    });

    it('obtenirJeux() devrait retourner tous les jeux stockés', () => {
        const sinonReadFileSpy = sandbox.stub(fs, 'readFileSync').callsFake(() => {
            return JSON.stringify({ jeux: jeuxTest });
        });
        expect(sinonReadFileSpy.calledOnce);
        expect(service.obtenirJeux()).toEqual(jeuxTest);
        sinonReadFileSpy.restore();
    });
    it('obtenirJeu() devrait retourner un seul jeu', async () => {
        const sinonReadFileSpy = sandbox.stub(fs, 'readFileSync').callsFake(() => {
            return JSON.stringify({ jeux: jeuxTest });
        });
        expect(sinonReadFileSpy.calledOnce);
        expect(service.obtenirJeu(0)).toEqual(jeuxTest[0]);
        sinonReadFileSpy.restore();
    });
    it('ajouterJeu() devrait ajouter un seul jeu', async () => {
        const espionSocre = jest.spyOn(scoreService, 'ajouterScore').mockImplementation(async () => Promise.resolve());
        sandbox.stub(fs, 'writeFileSync');
        await service.ajouterJeu(jeuTest);
        expect(espionSocre).toBeCalled();
    });
    it('recupererTableauEtMatriceJSON() devrait recupérer un tableau et une matrice', async () => {
        let compteurAppels = 0;
        const sinonRecupJeuxJSONSpy = sandbox.stub(fs, 'readFileSync').callsFake(() => {
            compteurAppels += 1;
            return JSON.stringify({ jeux: jeuxTest });
        });
        service.recupererTableauEtMatriceJSON(0);
        expect(compteurAppels).toEqual(3);
        sinonRecupJeuxJSONSpy.restore();
    });
    it('corrigerLesId devrait corriger les Id', async () => {
        jeuxTest[0].id = 1;
        jeuxTest[1].id = 2;
        service.corrigerLesId(0, jeuxTest);
        expect(jeuxTest[0].id).toEqual(0);
        expect(jeuxTest[1].id).toEqual(1);
    });
    it('ajouterJeu() devrait ajouter un seul jeu', async () => {
        let compteurAppels = 0;
        const espionSocre = jest.spyOn(scoreService, 'ajouterScore').mockReturnValue(new Promise((resolve) => resolve()));

        const espionWrite = sandbox.stub(fs, 'writeFileSync').callsFake(() => {
            compteurAppels += 1;
        });
        await service.ajouterJeu(jeuTest);
        expect(compteurAppels).toEqual(3);
        expect(espionSocre).toHaveBeenCalled();
        espionWrite.restore();
    });
    it('supprimerJeu() devrait supprimer un seul jeu', async () => {
        jeuxTest.push(jeuTest);
        let compteurAppelsUnlink = 0;
        let compteurAppelsExistsSync = 0;
        const espionSocre = jest.spyOn(scoreService, 'supprimerScoreNomJeu').mockImplementation(async () => Promise.resolve());
        const espionUnlink = sandbox.stub(fs, 'unlink').callsFake((_, callback) => {
            const erreur: Error = new Error();
            try {
                callback(erreur);
            } catch (erreurCatch) {
                expect(erreurCatch);
            }
            compteurAppelsUnlink += 1;
        });
        const espionExistsSync = sandbox.stub(fs, 'existsSync').callsFake(() => {
            compteurAppelsExistsSync += 1;
            return true;
        });

        jest.spyOn(service, 'obtenirJeu').mockReturnValue(jeuTest);
        const espionCorrigerId = jest.spyOn(service, 'corrigerLesId').mockImplementation();
        const espionMettreAJourJSON = jest.spyOn(service, 'mettreAJourJeuxJSON').mockImplementation();
        jest.spyOn(service, 'obtenirJeux').mockReturnValueOnce(jeuxTest);
        await service.supprimerJeu(1);
        expect(compteurAppelsUnlink).toEqual(2);
        expect(compteurAppelsExistsSync).toEqual(2);
        expect(espionCorrigerId).toHaveBeenCalled();
        expect(espionMettreAJourJSON).toHaveBeenCalled();
        expect(espionSocre).toHaveBeenCalled();
        espionUnlink.restore();
        espionExistsSync.restore();
    });
    it('supprimerJeu() devrait gérer une erreur en écrivant dans le Logger', async () => {
        jeuxTest.push(jeuTest);

        const espionUnlink = sandbox.stub(fs, 'unlink').callsFake((path, callback) => {
            const erreur: Error = new Error();
            callback(erreur);
        });
        const espionExistsSync = sandbox.stub(fs, 'existsSync').callsFake(() => {
            return true;
        });

        jest.spyOn(service, 'obtenirJeu').mockReturnValue(jeuTest);
        jest.spyOn(service, 'corrigerLesId').mockImplementation();
        jest.spyOn(service, 'mettreAJourJeuxJSON').mockImplementation();
        jest.spyOn(service, 'obtenirJeux').mockReturnValueOnce(jeuxTest);
        service.supprimerJeu(2);
        espionUnlink.restore();
        espionExistsSync.restore();
    });
});
