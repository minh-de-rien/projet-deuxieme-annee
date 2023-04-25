/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Score, ScoreDocument } from '@app/modele/base-de-donnes/score';
import { ModificationScoreDto } from '@app/modele/dto/modification-score.dto';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { ScoreClient } from '@common/interface/score-client';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ScoreService } from './score.service';

const SCORE: ScoreClient[] = [
    { nomJeu: 'jeuxTest1', estSolo: true, nouveauScore: { nomJoueur: 'Pol Malone1', temps: 100 } },
    { nomJeu: 'jeuxTest2', estSolo: true, nouveauScore: { nomJoueur: 'LePujanJames1', temps: 6969 } },
];

const scores: Score[] = [
    { _id: 0, nomJeu: 'jeuxTest1', meilleursTemps1v1: [SCORE[0].nouveauScore], meilleursTempsSolo: [SCORE[1].nouveauScore] },
    { _id: 1, nomJeu: 'jeuxTest1', meilleursTemps1v1: [SCORE[1].nouveauScore], meilleursTempsSolo: [SCORE[0].nouveauScore] },
];
const jeuxAttendus: InterfaceJeux[] = [
    {
        id: 0,
        nom: 'jeuxTest1',
        imgOriginale: 'urlImageOriginale',
        imgModifiee: 'urlImageModifiee',
        nombreDifferences: 3,
    },

    {
        id: 1,
        nom: 'jeuxTest2',
        imgOriginale: 'urlImageOriginale1',
        imgModifiee: 'urlImageModifiee1',
        nombreDifferences: 3,
    },
];

describe('ScoreServiceEndToEnd', () => {
    let service: ScoreService;
    let scoreModel: Model<ScoreDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        scoreModel = {
            count: jest.fn(),
            create: jest.fn(),
            insertMany: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            deleteMany: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<ScoreDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScoreService,
                Logger,
                {
                    provide: getModelToken(Score.name),
                    useValue: scoreModel,
                },
            ],
        }).compile();

        service = module.get<ScoreService>(ScoreService);
    });

    it('sera defini', () => {
        expect(service).toBeDefined();
        expect(scoreModel).toBeDefined();
    });

    it('ajouterScore(nomJeu) devrait ajouter le score dans la BD', async () => {
        const spyCreate = jest.spyOn(scoreModel, 'create');
        await service.ajouterScore('Bingo');
        expect(spyCreate).toHaveBeenCalled();
    });

    it('ajouterScore(nomJeu) devrait echouer si la requete mongo echoue', async () => {
        jest.spyOn(scoreModel, 'create').mockImplementation(async () => Promise.reject(''));
        jest.spyOn(service['logger'], 'error').mockImplementation();
        await expect(service.ajouterScore('Bingo')).rejects.toBeTruthy();
    });
    it('supprimerScoreNomJeu() devrait echouer si le score n existe', async () => {
        const reponse = { deletedCount: 0, acknowledged: true };
        jest.spyOn(scoreModel, 'deleteOne').mockResolvedValue(reponse);
        await expect(service.supprimerScoreNomJeu('Dragon')).rejects.toBeTruthy();
    });

    it('supprimerScoreNomJeu() devrait echouer si le requete mongo echoue', async () => {
        jest.spyOn(scoreModel, 'deleteOne').mockRejectedValue(async () => Error(''));
        await expect(service.supprimerScoreNomJeu('Dragon')).rejects.toBeTruthy();
    });

    it('supprimerTousLesScores() devrait echouer si le requete mongo echoue', async () => {
        jest.spyOn(scoreModel, 'deleteMany').mockRejectedValue(new Error(''));
        await expect(service.supprimerTousLesScores()).rejects.toBeTruthy();
    });

    it('modifierScore() devrait echoue si la requete mongo echoue', async () => {
        jest.spyOn(scoreModel, 'updateOne').mockRejectedValue(new Error(''));
        const scoreDto = new ModificationScoreDto();
        scoreDto.nomJeu = 'Danger';
        await expect(service.modifierScore(scoreDto)).rejects.toBeTruthy();
    });

    it('modifierScore() devrait echouer si le score n existe pas', async () => {
        jest.spyOn(service, 'obtenirScoreParNomJeu').mockResolvedValue(scores[0]);
        const scoreDto = new ModificationScoreDto();
        const deleteResult = { matchedCount: 0 };
        scoreDto.nomJeu = 'Danger';
        jest.spyOn(scoreModel, 'updateOne').mockResolvedValue(deleteResult as any);
        await expect(service.modifierScore(scoreDto)).rejects.toBeTruthy();
    });

    it('reinitialiserScoreParId() devrait reinitialiser le score', async () => {
        const spyModif = jest.spyOn(service, 'modifierScore').mockImplementation();
        await service.reinitialiserScore('bla');
        expect(spyModif).toHaveBeenCalled();
    });

    it('reinitialiserTousLesScores() devrait appeler reinitialiserScoreParId() autant de fois qu<il de score', async () => {
        jest.spyOn(service, 'obtenirTousLesScores').mockResolvedValue(scores);
        const spyRi = jest.spyOn(service, 'reinitialiserScore').mockImplementation();
        await service.reinitialiserTousLesScores();
        expect(spyRi).toHaveBeenCalledTimes(2);
    });

    it('obtenirScoreParNomJeu() devrait retourner le score correspondant', async () => {
        const nomJeu = 'Danger';
        const spyFindOne = jest.spyOn(scoreModel, 'findOne');
        await service.obtenirScoreParNomJeu(nomJeu);
        expect(spyFindOne).toHaveBeenCalled();
    });

    it('obtenirTousLesScores() devrait retourner la liste de tous les scores', async () => {
        const spyFind = jest.spyOn(scoreModel, 'find');
        await service.obtenirTousLesScores();
        expect(spyFind).toHaveBeenCalled();
    });

    it('verificationDeclassementScore() devrait faire la mise a jour du score de la partie solo', async () => {
        const nomJeu = 'Danger';
        const scoreClient: ScoreClient = { nomJeu, estSolo: true, nouveauScore: SCORE[0].nouveauScore };
        jest.spyOn(service, 'obtenirScoreParNomJeu').mockResolvedValue(scores[0]);
        const spyModiTabMeil = jest.spyOn(service, 'modifierTableauMeilleursScores' as any).mockImplementation();
        jest.spyOn(service, 'modifierScore').mockResolvedValue();
        await service.verificationDeclassementScore(scoreClient);
        expect(spyModiTabMeil).toHaveBeenCalled();
    });

    it('verificationDeclassementScore() devrait faire la mise a jour du score de la partie 1v1', async () => {
        const nomJeu = 'Danger';
        const scoreClient: ScoreClient = { nomJeu, estSolo: false, nouveauScore: SCORE[0].nouveauScore };
        jest.spyOn(service, 'obtenirScoreParNomJeu').mockResolvedValue(scores[1]);
        const spyModiTabMeil = jest.spyOn(service, 'modifierTableauMeilleursScores' as any).mockImplementation();
        jest.spyOn(service, 'modifierScore').mockResolvedValue();
        await service.verificationDeclassementScore(scoreClient);
        expect(spyModiTabMeil).toHaveBeenCalled();
    });

    it('attribuerScoreAChaqueJeuxPourLeClient() devrait distribuer retourne false si erreur connection BD', async () => {
        jest.spyOn(service, 'obtenirScoreParNomJeu').mockRejectedValue(new Error(''));
        const bool = await service.attribuerScoreAChaqueJeuxPourLeClient(jeuxAttendus);
        expect(bool).toEqual(false);
    });

    it('attribuerScoreAChaqueJeuxPourLeClient() devrait distribuer les scores a chaque jeux en retournant true', async () => {
        jest.spyOn(service, 'obtenirTousLesScores').mockResolvedValue(scores);
        const bool = await service.attribuerScoreAChaqueJeuxPourLeClient(jeuxAttendus);
        expect(bool).toEqual(true);
    });

    it('modifierTableauMeilleursScores() devrait appeler la methode aModifierScore()', async () => {
        const spyAModif = jest.spyOn(service, 'aModifierScore' as any).mockReturnValue({});
        await service['modifierTableauMeilleursScores'](SCORE[0].nouveauScore, [SCORE[0].nouveauScore, SCORE[1].nouveauScore]);
        expect(spyAModif).toHaveBeenCalled();
    });

    it('aModifierScore() devrait renvoyer {bool: false, index: -1} en cas de non modification de score', async () => {
        const valeur = await service['aModifierScore']([SCORE[1].nouveauScore, SCORE[0].nouveauScore], SCORE[0].nouveauScore, SCORE[0].nouveauScore);
        const INDEX_ECHEC = -1;
        expect(valeur.aDeclasse).toEqual(false);
        expect(valeur.index).toEqual(INDEX_ECHEC);
    });

    it('aModifierScore() devrait renvoyer {bool: true, index: 0} en cas de non modification de score', async () => {
        const valeur = await service['aModifierScore']([SCORE[1].nouveauScore, SCORE[0].nouveauScore], SCORE[1].nouveauScore, SCORE[0].nouveauScore);
        const INDEX_SUCCES = 1;
        expect(valeur.aDeclasse).toEqual(true);
        expect(valeur.index).toEqual(INDEX_SUCCES);
    });
});
