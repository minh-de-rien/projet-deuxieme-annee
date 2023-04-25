import { Partie } from '@app/classes/partie/partie';
import { TempsLimite } from '@app/classes/partie/temps-limite/temps-limite';
import { FichiersJeuxService } from '@app/services/fichiers-jeux/fichiers-jeux.service';
import { ScoreService } from '@app/services/score/score.service';
import { Joueur } from '@common/interface/joueur';
import { ModesJeu } from '@common/valeurs-par-defaut';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GestionPartiesCourantes } from './gestion-parties-courantes.service';

const joueurTest: Joueur = {
    nom: '',
    estHote: true,
    idSalle: 'idTest',
    idJeu: 0,
    adversaire: '',
};
// /* eslint @typescript-eslint/no-magic-numbers: "off"*/
// /* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('PartiesEnCours', () => {
    let service: GestionPartiesCourantes;
    let fichiersJeuxService: SinonStubbedInstance<FichiersJeuxService>;
    let serviceScore: SinonStubbedInstance<ScoreService>;

    beforeEach(async () => {
        fichiersJeuxService = createStubInstance(FichiersJeuxService);
        serviceScore = createStubInstance(ScoreService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GestionPartiesCourantes,
                {
                    provide: FichiersJeuxService,
                    useValue: fichiersJeuxService,
                },
                {
                    provide: ScoreService,
                    useValue: serviceScore,
                },
            ],
        }).compile();

        service = module.get<GestionPartiesCourantes>(GestionPartiesCourantes);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('ajouterUnePartie(() devrait ajouter une nouvelle partie au map', () => {
        const joueurMock: Joueur = {
            nom: '',
            estHote: true,
            idSalle: 'idTest2',
            idJeu: 0,
            adversaire: '',
        };
        service['partieEnCours'] = new Map<string, Partie>();
        service.ajouterUnePartie([joueurMock], ModesJeu.Classique);
        expect(service['partiesEnCours'].size).toEqual(1);
        service.ajouterUnePartie([joueurTest], ModesJeu.TempsLimite);
        expect(service['partiesEnCours'].size).toEqual(2);
    });
    it('supprimerPartie() devrait suprimer la partie dans la salle donnée', () => {
        const partieMock = new TempsLimite([joueurTest]);
        service['partiesEnCours'].set('idTest', partieMock);
        service.supprimerPartie('idTest');
        expect(service['partiesEnCours'].get('idTest')).toEqual(undefined);
    });
    it('obtenirPartie() devrait retourner la partie dans la salle entree en paramètre', () => {
        const partieMock = new TempsLimite([joueurTest]);
        service['partiesEnCours'].set('idTest', partieMock);
        expect(service.obtenirPartie('idTest')).toEqual(partieMock);
    });
});
