/* eslint @typescript-eslint/no-explicit-any: "off"*/
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Salle } from '@app/classes/salle/salle';
import { ModesJeu } from '@common/valeurs-par-defaut';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { GestionSallesService } from './gestion-salles.service';

describe('GestionSallesService', () => {
    let service: GestionSallesService;
    let socket: SinonStubbedInstance<Socket>;
    let salle: SinonStubbedInstance<Salle>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GestionSallesService],
        }).compile();
        service = module.get<GestionSallesService>(GestionSallesService);
        socket = createStubInstance<Socket>(Socket);
        salle = createStubInstance<Salle>(Salle);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('creerSalle devrait générer une nouvelle salle avec le mode de jeu entré en paramètre', () => {
        jest.spyOn(service as any, 'genererNomNouvelleSalle').mockImplementation(() => {
            return 'salleTest';
        });
        (service as any).listeDesSalles = new Map<string, Salle>();
        const reponse = service.creerSalle(ModesJeu.Classique);
        expect((service as any).listeDesSalles.size).toEqual(1);
        expect(reponse).toBe('salleTest');
    });

    it('obtenirSalle devrait obtenir la salle qui correspond à un id', () => {
        (service as any).listeDesSalles = new Map<string, Salle>();
        const nomSalle0 = service.creerSalle(ModesJeu.Classique);
        expect(service.obtenirSalle(nomSalle0)).toEqual(new Salle(nomSalle0, ModesJeu.Classique));
    });
    it("obtenirSalleAvecSocket devrait obtenir la salle d'un socket", () => {
        jest.spyOn(service, 'obtenirIdSalleDuSocket').mockImplementation(() => {
            return 'test';
        });
        jest.spyOn(service, 'obtenirSalle').mockImplementation(() => {
            return salle;
        });
        expect(service.obtenirSalleAvecSocket(socket)).toEqual(salle);
    });

    it('supprimerSalle devrait supprimer une salle', () => {
        jest.spyOn((service as any).listeDesSalles, 'get').mockImplementation(() => {
            return salle;
        });
        jest.spyOn(salle, 'retirerTousLesJoueurs').mockImplementation(() => {
            return;
        });
        jest.spyOn((service as any).listeDesSalles, 'delete').mockImplementation(() => {
            return;
        });
        service.supprimerSalle('test');
        expect((service as any).listeDesSalles.delete).toBeCalledWith('test');
    });

    it('genererNomNouvelleSalle devrait generer une nouvelle salle', () => {
        (service as any).numeroDeSalle = 0;
        expect((service as any).genererNomNouvelleSalle()).toEqual('salle_1');
    });
});
