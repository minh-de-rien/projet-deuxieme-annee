// /* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint @typescript-eslint/no-explicit-any: "off"*/
import { SocketGateway } from '@app/gateways/socket/socket.gateway';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { FichiersJeuxService } from '@app/services/fichiers-jeux/fichiers-jeux.service';
import { GestionMessagesService } from '@app/services/gestion-messages/gestion-messages.service';
import { GestionPartiesCourantes } from '@app/services/gestion-parties-courantes/gestion-parties-courantes.service';
import { GestionSallesService } from '@app/services/gestion-salles/gestion-salles.service';
import { ScoreService } from '@app/services/score/score.service';
import { Server, Socket } from 'socket.io';
// import { InterfaceDemandeVerification } from '@common/interface/interface-demande-verification';
// import { InterfacePartie } from '@common/interface/interface-partie';
import { Joueur } from '@common/interface/joueur';
import { Message } from '@common/interface/message';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { TempsLimite } from '@app/classes/partie/temps-limite/temps-limite';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { GestionConstantesTempsJeuxService } from '@app/services/gestion-constantes-temps-jeux/gestion-constantes-temps-jeux.service';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { Salle } from '@app/classes/salle/salle';
import { ID_SALLE_BROADCAST, ModesJeu } from '@common/valeurs-par-defaut';
import { Classique } from '@app/classes/partie/classique/classique';
import { Vec2 } from '@common/interface/vec2';
import { reponseDeclassementScore } from '@common/interface/reponse-declassement-score';
import { ScoreClient } from '@common/interface/score-client';

let fauxJeux: InterfaceJeux[];
const fausseSalleId = 'salle_test';
let fauxJoueursDuo: Joueur[];
let fauxJoueurSolo: Joueur;
let fauxMessage: Message;
let faussePaireMatriceTableau: [number[], Vec2[][]];
let fausseReponseDeClassement: reponseDeclassementScore;
let fauxScoresClient: ScoreClient[];
let faussesConstantesTempsJeu: ConstantesTempsJeux;

describe('SocketGateway', () => {
    let gateway: SocketGateway;
    let logger: SinonStubbedInstance<Logger>;
    let fichiersJeuxService: SinonStubbedInstance<FichiersJeuxService>;
    let gestionPartiesService: SinonStubbedInstance<GestionPartiesCourantes>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gestionSallesService: SinonStubbedInstance<GestionSallesService>;
    let fausseSalle: SinonStubbedInstance<Salle>;
    let gestionMessagesService: SinonStubbedInstance<GestionMessagesService>;
    let gestionConstantesTempsJeuxService: SinonStubbedInstance<GestionConstantesTempsJeuxService>;
    let scoreService: SinonStubbedInstance<ScoreService>;
    let faussePartieTempsLimite: SinonStubbedInstance<TempsLimite>;
    let faussePartieClassique: SinonStubbedInstance<Classique>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        fichiersJeuxService = createStubInstance(FichiersJeuxService);
        gestionPartiesService = createStubInstance(GestionPartiesCourantes);
        faussePartieClassique = createStubInstance(Classique);
        faussePartieTempsLimite = createStubInstance(TempsLimite);
        gestionSallesService = createStubInstance(GestionSallesService);
        fausseSalle = createStubInstance(Salle);
        gestionMessagesService = createStubInstance(GestionMessagesService);
        gestionConstantesTempsJeuxService = createStubInstance(GestionConstantesTempsJeuxService);
        scoreService = createStubInstance(ScoreService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SocketGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: FichiersJeuxService,
                    useValue: fichiersJeuxService,
                },
                {
                    provide: GestionPartiesCourantes,
                    useValue: gestionPartiesService,
                },
                {
                    provide: GestionSallesService,
                    useValue: gestionSallesService,
                },
                {
                    provide: GestionMessagesService,
                    useValue: gestionMessagesService,
                },
                {
                    provide: ScoreService,
                    useValue: scoreService,
                },
                {
                    provide: GestionConstantesTempsJeuxService,
                    useValue: gestionConstantesTempsJeuxService,
                },
            ],
        }).compile();

        gateway = module.get<SocketGateway>(SocketGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
        fauxJeux = [
            {
                id: 0,
                nom: 'Les ballons',
                meilleursTempsSolo: [],
                meilleursTemps1v1: [],
                imgOriginale: '',
                imgModifiee: '',
                nombreDifferences: 3,
            },
        ];
        fauxJoueursDuo = [
            {
                nom: 'j1',
                estHote: true,
                estSolo: false,
                idSalle: fausseSalleId,
                idJeu: 0,
                adversaire: 'j2',
            },
            {
                nom: 'j2',
                estHote: false,
                estSolo: false,
                idSalle: fausseSalleId,
                idJeu: 0,
                adversaire: 'j1',
            },
        ];

        fauxJoueurSolo = {
            nom: 'j2',
            estHote: null,
            estSolo: true,
            idSalle: fausseSalleId,
            idJeu: 0,
            adversaire: '',
        };

        fauxMessage = {
            destinateur: fauxJoueurSolo,
            contenu: 'coucou',
        };
        faussePaireMatriceTableau = [
            [1, 2, 3],
            [
                [
                    { x: 2, y: 4 },
                    { x: 2, y: 4 },
                ],
                [
                    { x: 2, y: 4 },
                    { x: 2, y: 4 },
                ],
            ],
        ];
        fausseReponseDeClassement = {
            aDeclasse: true,
            index: 0,
        };
        fauxScoresClient = [
            { nomJeu: 'jeux test 1', estSolo: true, nouveauScore: { nomJoueur: 'Pol Malone1', temps: 100 } },
            { nomJeu: 'jeux test 1', estSolo: true, nouveauScore: { nomJoueur: 'LePujanJames1', temps: 6969 } },
        ];
        faussesConstantesTempsJeu = {
            compteARebours: 0,
            penalite: 0,
            gain: 0,
        };
        gestionPartiesService.ajouterUnePartie.returns(faussePartieClassique);
        gestionPartiesService.obtenirPartie.returns(faussePartieClassique);

        gestionSallesService.creerSalle.returns(fausseSalleId);
        gestionSallesService.obtenirSalle.returns(fausseSalle);
        gestionSallesService.obtenirSalleAvecSocket.returns(fausseSalle);
        gestionSallesService.obtenirSalleTempsLimiteDisponible.returns(fausseSalleId);
        gestionSallesService.obtenirSallesDuJeu.returns([fausseSalle]);
        gestionSallesService.obtenirIdSalleDuSocket.returns(fausseSalleId);

        scoreService.verificationDeclassementScore.resolves(fausseReponseDeClassement);

        fausseSalle.obtenirTousLesJoueurs.returns(fauxJoueursDuo);
        fausseSalle.obtenirIdJeu.returns(fauxJeux[0].id);
        fausseSalle.obtenirTousLesJoueurs.returns(fauxJoueursDuo);
        fausseSalle.obtenirJoueurInvite.returns(fauxJoueursDuo[1]);
        fausseSalle.obtenirModeDeJeu.returns(ModesJeu.Classique);
        fausseSalle.trouverJoueurAssocieSocket.returns(fauxJoueursDuo[0]);
        fausseSalle.trouverSocketAssocieJoueur.returns(socket);
        fausseSalle.trouverIndexJoueur.returns(0);

        fichiersJeuxService.obtenirJeux.returns(fauxJeux);
        fichiersJeuxService.obtenirJeu.returns(fauxJeux[0]);
        fichiersJeuxService.obtenirJeuParNom.returns(fauxJeux[0]);
        fichiersJeuxService.recupererTableauEtMatriceJSON.returns(faussePaireMatriceTableau);
        fichiersJeuxService.estSynchroAvecBD.resolves(true);

        gestionConstantesTempsJeuxService.obtenirConstantesTempsJeux.returns(faussesConstantesTempsJeu);
    });

    it('gateway devrait être defini', () => {
        expect(gateway).toBeDefined();
    });

    it('recupererListeJeux() devrait envoyer la liste de jeux à chaque client connecté ', async () => {
        await gateway.recupererListeJeux(socket);
        expect(socket.emit.calledWith(SocketEvenements.Jeux)).toBeTruthy();
    });
    it('ProchainJeuTempsLimite envoie le prochain Jeu au client', () => {
        gestionPartiesService.obtenirPartie.returns(faussePartieTempsLimite);
        faussePartieTempsLimite.obtenirProchainNomJeu.returns('hehe');
        fichiersJeuxService.obtenirJeu.returns(fauxJeux[0]);
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.ProchainJeuTempsLimite);
            },
        }));
    });

    it('rejeterInvite() devrait envoyer les coord du joueur invite    ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.RejeteDeLaSalle);
            },
        }));
        gateway.rejeterInvite(socket);
    });

    it('accepterInvite() devrait appeler la methode ajouterUnePartie de la class PartieEnCours ', async () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.LancerPartie);
            },
        }));

        gateway.accepterInvite(socket);
    });

    it('creerSalle() devrait appeler la methode ajouterUnePartie de la classe PartieEnCours  ', () => {
        gateway.creerSalle(socket, fauxJoueurSolo);
        expect(gestionPartiesService.ajouterUnePartie.called).toBeTruthy();
    });

    it('creerSalle() devrait appeler modifierEtatDuJeu si 1v1', () => {
        gateway.creerSalle(socket, fauxJoueursDuo[0]);
        expect(fichiersJeuxService.modifierEtatDuJeu.called).toBeTruthy();
    });
    //     it('retirerInviteDeLaSalle() devrait enlever le deuxieme joueur (invite) de salle   ', () => {
    //         gateway['listeDesSalles'].clear();
    //         gateway['listeDesSalles'].set(fausseSalleId, [fauxJoueursDuo[0], fauxJoueursDuo[1]]);
    //         gateway.retirerInviteDeLaSalle(socket, fausseSalleId);
    //         expect(gateway['listeDesSalles'].get(fausseSalleId).length).toEqual(1);
    //     });

    it('rejoindreSalle() devrait envoyer l evenement SocketEvenements.SalleEstPleine avec la valeur true si la salle est pleine ', () => {
        fausseSalle.obtenirJoueurInvite.returns(fauxJoueursDuo[1]);
        gateway.rejoindreSalle(socket, fauxJoueursDuo[1]);
        expect(socket.emit.calledWith(SocketEvenements.SalleEstPleine, true)).toBeTruthy();
    });

    it('rejoindreSalle() devrait rejoindre la salle si la salle n est pas pleine ', () => {
        fausseSalle.obtenirJoueurInvite.returns(undefined);
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.DemandeJoindrePartie);
            },
        }));
        gateway.rejoindreSalle(socket, fauxJoueursDuo[1]);
    });

    it('verifierCoord() devrait envoyer un message si une différence est trouvée ', () => {
        gestionPartiesService.obtenirPartie.returns(faussePartieTempsLimite);
        faussePartieTempsLimite.obtenirRegroupementDifferenceAvecCoord.returns(faussePaireMatriceTableau[1][0]);
        fausseSalle.obtenirModeDeJeu.returns(ModesJeu.Classique);
        faussePartieTempsLimite.partieEstFinie.returns(true);
        jest.spyOn(gateway, 'envoyerMessageSysteme' as any).mockImplementation();
        jest.spyOn(gateway, 'gestionVictoireDefaite' as any).mockImplementation();
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBeTruthy();
            },
        }));
        gateway.verifierCoord(socket, faussePaireMatriceTableau[1][0][0]);
        expect(gestionMessagesService.creerMessageTrouve.called).toBeTruthy();
    });

    // it('verifierCoord() devrait appeler un Message si une différence est trouvée', () => {
    //     gestionPartiesService.obtenirPartie.returns(faussePartieTempsLimite);
    //     faussePartieTempsLimite.obtenirRegroupementDifferenceAvecCoord.returns(faussePaireMatriceTableau[1][0]);
    //     fausseSalle.obtenirModeDeJeu.returns(ModesJeu.Classique);
    //     faussePartieTempsLimite.partieEstFinie.returns(true);
    //     gateway.verifierCoord(socket, faussePaireMatriceTableau[1][0][0]);
    // });

    it('verifierCoord() devrait envoyer un Message si c`est une erreur', () => {
        gestionPartiesService.obtenirPartie.returns(faussePartieTempsLimite);
        faussePartieTempsLimite.obtenirRegroupementDifferenceAvecCoord.returns(undefined);
        fausseSalle.obtenirModeDeJeu.returns(ModesJeu.Classique);
        faussePartieTempsLimite.partieEstFinie.returns(true);
        jest.spyOn(gateway, 'envoyerMessageSysteme' as any).mockImplementation();
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBeTruthy();
            },
        }));

        gateway.verifierCoord(socket, faussePaireMatriceTableau[1][0][0]);
        expect(gestionMessagesService.creerMessageErreur.called).toBeTruthy();
    });

    it('abandon() devrait envoyer un Message si la partie est finie ', () => {
        faussePartieClassique.partieEstFinie.returns(true);
        jest.spyOn(gateway, 'envoyerMessageSysteme' as any).mockImplementation();
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBeTruthy();
            },
        }));

        gateway.abandon(socket);
        expect(gestionMessagesService.creerMessageAbandon.called).toBeTruthy();
    });

    it('gestionTempsEcoule devrait supprimer une salle', () => {
        gateway.gestionTempsEcoule(socket);
        expect(gestionSallesService.supprimerSalle.called).toBeTruthy();
    });

    it('recevoirEtEnvoyerMessage() devrait envoyer l`evenement SocketEvenements.Message  ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.Message);
            },
        }));
        gateway.recevoirEtEnvoyerMessage(socket, { destinateur: fauxJoueurSolo, contenu: 'bla bla' });
    });

    it('quitterSalle devrait envoyer l evenement SocketEvenements.HoteAQuitterSalle ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.HoteAQuitteSalle);
            },
        }));

        gateway.quitterSalle(socket);
    });

    it('quitterSalle devrait envoyer l evenement SocketEvenements.InviteAQuitterSalle si l attribut estHote du joueur est a false ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.InviteAQuitteSalle);
            },
        }));
        fausseSalle.trouverJoueurAssocieSocket.returns(fauxJoueursDuo[1]);
        gateway.quitterSalle(socket);
    });

    it('chargerNouveauxJeux devrait envoyer des jeux', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.Jeux);
            },
        }));
        gateway.chargerNouveauxJeux();
    });

    it('annoncerSuppressionJeu() devrait envoyer l evenement SocketEvenements.AnnonceFinPartie si la salle n`a pas de partie  ', async () => {
        gestionPartiesService.obtenirPartie.returns(undefined);
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.AnnonceSuppressionSalle);
            },
        }));
        await gateway.annoncerSuppressionJeu(socket, 0);
    });
    it('annonceReinitialisationScore() devrait appeler la methode reinitialiserScoreParId() de ScoreService  ', async () => {
        const spy = jest.spyOn(scoreService, 'reinitialiserScore' as any).mockResolvedValue(async () => Promise.resolve());
        await gateway.annonceReinitialisationScore(socket, fauxJoueursDuo[0].nom);
        expect(spy).toHaveBeenCalled();
    });
    it('annonceReinitialisationTousLesScores() devrait appeler la methode reinitialiserTousLesScores() de ScoreService  ', async () => {
        const spy = jest.spyOn(scoreService, 'reinitialiserTousLesScores' as any).mockResolvedValue(async () => Promise.resolve());
        await gateway.annonceReinitialisationTousLesScores();
        expect(spy).toHaveBeenCalled();
    });
    it('nouveauScore devrait créer un message de meilleurTemps lorsque le score est un nouveau record', async () => {
        jest.spyOn(gateway, 'envoyerMessageSysteme' as any).mockImplementation();
        await gateway.nouveauScore(socket, fauxScoresClient[0]);
        expect(gestionMessagesService.creerMessageNouveauMeilleurTemps.called).toBeTruthy();
    });
    it('annonceSuppressionTousLesJeux() devrait supprimer tous les jeux', () => {
        gateway.annonceSuppressionTousLesJeux();
        expect(fichiersJeuxService.supprimerTousLesJeux.called).toBeTruthy();
    });
    it('mettreAJourConstantesTempsJeux() devrait envoyer les nouvelles constantes', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.EnvoiConstantesTempsJeux);
            },
        }));
        gateway.mettreAJourConstantesTempsJeux(socket, faussesConstantesTempsJeu);
    });
    it('recupererConstantesTempsJeuxSurDemande() devrait envoyer les constantes', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.EnvoiConstantesTempsJeux);
            },
        }));
        gateway.recupererConstantesTempsJeuxSurDemande(socket);
    });
    it('reinitialiserConstantesTempsJeux() devrait envoyer les constantes reinitialisées', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.EnvoiConstantesTempsJeux);
            },
        }));
        gateway.reinitialiserConstantesTempsJeux();
    });
    it('verifierSocket() devrait envoyer SocketInvalide si le socket est invalide', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.SocketInvalide);
            },
        }));
        gestionSallesService.obtenirIdSalleDuSocket.returns(undefined);
        gateway.verifierSocket(socket);
    });
    it('envoyerMessageIndice() devrait envoyer un Message si un indice est utilisé', () => {
        const spyMessageSystème = jest.spyOn(gateway, 'envoyerMessageSysteme' as any).mockImplementation();
        gateway.envoyerMessageIndice(socket);
        expect(spyMessageSystème).toBeCalled();
    });
    it('creerOuRejoindreTempsLimite() devrait envoyer un status Partie s`il n`y a pas de jeux', () => {
        fichiersJeuxService.obtenirJeux.returns([]);
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.StatutPartie);
            },
        }));
        gateway.creerOuRejoindreTempsLimite(socket, fauxJoueursDuo[0]);
    });
    it('creerOuRejoindreTempsLimite() devrait envoyer un status Partie si le joueur est en solo', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.StatutPartie);
            },
        }));
        gateway.creerOuRejoindreTempsLimite(socket, fauxJoueurSolo);
    });
    it('creerOuRejoindreTempsLimite() devrait envoyer un status Partie si le joueur est en multi et qu`y a pas de partie', () => {
        gestionPartiesService.obtenirPartie.returns(undefined);
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.StatutPartie);
            },
        }));
        gateway.creerOuRejoindreTempsLimite(socket, fauxJoueursDuo[0]);
    });
    it('creerOuRejoindreTempsLimite() devrait envoyer un status Partie si le joueur est en multi et qu`y a une partie', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.StatutPartie);
            },
        }));
        gateway.creerOuRejoindreTempsLimite(socket, fauxJoueursDuo[0]);
    });
    it('gestionVictoireDefaite() devrait envoyer une AnnonceFinPartie si la partie est finie', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.AnnonceFinPartie);
            },
        }));
        faussePartieClassique.partieEstFinie.returns(true);
        gateway.gestionVictoireDefaite(fausseSalle);
    });
    it('gestionVictoireDefaite() devrait envoyer une AnnonceFinPartie si la partie est finie en temps limite', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.AnnonceFinPartie);
            },
        }));
        faussePartieClassique.partieEstFinie.returns(true);
        fausseSalle.obtenirModeDeJeu.returns(ModesJeu.TempsLimite);
        gateway.gestionVictoireDefaite(fausseSalle);
    });
    it('gestionVictoireDefaite() retourne faux quand la partie n`est pas finie', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.AnnonceFinPartie);
            },
        }));
        faussePartieClassique.partieEstFinie.returns(false);
        gateway.gestionVictoireDefaite(fausseSalle);
    });
    it('prochainJeuTempsLimite() envoie un prochainJeuTempsLimite', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.ProchainJeuTempsLimite);
            },
        }));
        gateway.prochainJeuTempsLimite(fausseSalleId);
    });
    it('envoyerMessageSysteme() devrait envoyer l evenement SocketEvenements.Message  ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.Message);
            },
        }));
        gateway.envoyerMessageSysteme(fausseSalleId, fauxMessage);
    });
    it('envoyerMessageSysteme() avec broadcast devrait envoyer en broadcast SocketEvenements.Message  ', () => {
        jest.spyOn(server as any, 'to').mockImplementation(() => ({
            emit: (event: SocketEvenements) => {
                expect(event).toBe(SocketEvenements.Message);
            },
        }));
        gateway.envoyerMessageSysteme(ID_SALLE_BROADCAST, fauxMessage);
    });
    it("handleConnection() devrait appeler la methode log() de la classe Logger lors de la connexion d'un client", () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('handleDisconnect() devrait appeler la methode log() et gererDeconnexionHative si le socket possède un joueur', () => {
        const gererDeconnexionHativeSpy = jest.spyOn(gateway, 'gererDeconnexionHative' as any).mockImplementation();
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(gererDeconnexionHativeSpy).toHaveBeenCalled();
    });
    it('gererDeconnexionHative() devrait appeler finir partie ou quitter salle', () => {
        const abandonSpy = jest.spyOn(gateway, 'abandon').mockImplementation();
        const quitterSalleSpy = jest.spyOn(gateway, 'quitterSalle').mockImplementation();
        gateway['gererDeconnexionHative'](socket);
        expect(abandonSpy).toHaveBeenCalled();
        gestionPartiesService.obtenirPartie.returns(undefined);
        gateway['gererDeconnexionHative'](socket);
        expect(quitterSalleSpy).toHaveBeenCalled();
    });
});
