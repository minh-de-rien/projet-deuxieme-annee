/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MessagesSysteme } from '@common/enum/messages-systeme';
import { Joueur } from '@common/interface/joueur';
import { Test, TestingModule } from '@nestjs/testing';
import { GestionMessagesService } from './gestion-messages.service';

describe('GestionMessagesService', () => {
    let service: GestionMessagesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GestionMessagesService],
        }).compile();

        service = module.get<GestionMessagesService>(GestionMessagesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('creerMessageErreur devrait construire un message en fonction de si on est en multijoueur ou en solo', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        jest.spyOn(service, 'constuireMessageServeur' as any).mockImplementation(() => {
            return;
        });
        service.creerMessageErreur(mockJoueur, true);
        expect((service as any).constuireMessageServeur).toBeCalledWith(MessagesSysteme.ErreurMulti + mockJoueur.nom);
        service.creerMessageErreur(mockJoueur, false);
        expect((service as any).constuireMessageServeur).toBeCalledWith(MessagesSysteme.ErreurSolo);
    });

    it('creerMessageTrouve devrait construire un message en fonction de si on est en multijoueur ou en solo', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        jest.spyOn(service, 'constuireMessageServeur' as any).mockImplementation(() => {
            return;
        });
        service.creerMessageTrouve(mockJoueur, true);
        expect((service as any).constuireMessageServeur).toBeCalledWith(MessagesSysteme.DiffTrouveeMulti + mockJoueur.nom);
        service.creerMessageTrouve(mockJoueur, false);
        expect((service as any).constuireMessageServeur).toBeCalledWith(MessagesSysteme.DiffTrouveeSolo);
    });

    it('creerMessageAbandon devrait construire un message si le joueur a abandonné', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        jest.spyOn(service, 'constuireMessageServeur' as any).mockImplementation(() => {
            return;
        });
        service.creerMessageAbandon(mockJoueur);
        expect((service as any).constuireMessageServeur).toBeCalledWith(mockJoueur.nom + MessagesSysteme.Abandon);
    });

    it('creerMessageIndice devrait construire un message', () => {
        jest.spyOn(service, 'constuireMessageServeur' as any).mockImplementation(() => {
            return;
        });
        service.creerMessageIndice();
        expect((service as any).constuireMessageServeur).toBeCalledWith(MessagesSysteme.IndiceUtilise);
    });

    it("creerMessageNouveauMeilleurTemps devrait construire un message pour signaler qu'il y'a un nouveau meilleur temps", () => {
        jest.spyOn(service, 'constuireMessageServeur' as any).mockImplementation(() => {
            return;
        });
        service.creerMessageNouveauMeilleurTemps('mark', 1, 'jeuxTest', true);
        expect((service as any).constuireMessageServeur).toBeCalledWith('mark obtient la 1 place dans les meilleurs temps du jeu jeuxTest en solo');
        service.creerMessageNouveauMeilleurTemps('mark', 1, 'jeuxTest', false);
        expect((service as any).constuireMessageServeur).toBeCalledWith(
            'mark obtient la 1 place dans les meilleurs temps du jeu jeuxTest en un contre un',
        );
    });

    it("obtenirHeureActuelle renvoit l'heure actuelle", () => {
        jest.useFakeTimers().setSystemTime(new Date(0, 0, 0, 19, 35, 47));
        expect((service as any).obtenirHeureActuelle()).toBe('19:35:47 - ');
    });

    it('constuireMessageServeur devrait construire un message avec le contenu entré en paramètre', () => {
        jest.spyOn(service as any, 'obtenirHeureActuelle').mockImplementation(() => {
            return '00:00:00';
        });
        expect((service as any).constuireMessageServeur('ceci est un test')).toStrictEqual({
            contenu: '00:00:00ceci est un test',
            destinateur: { nom: 'serveur' },
        });
    });
});
