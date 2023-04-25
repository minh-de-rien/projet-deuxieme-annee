import { Partie } from '@app/classes/partie/partie';
import { Salle } from '@app/classes/salle/salle';
import { FichiersJeuxService } from '@app/services/fichiers-jeux/fichiers-jeux.service';
import { GestionConstantesTempsJeuxService } from '@app/services/gestion-constantes-temps-jeux/gestion-constantes-temps-jeux.service';
import { GestionMessagesService } from '@app/services/gestion-messages/gestion-messages.service';
import { GestionPartiesCourantes } from '@app/services/gestion-parties-courantes/gestion-parties-courantes.service';
import { GestionSallesService } from '@app/services/gestion-salles/gestion-salles.service';
import { ScoreService } from '@app/services/score/score.service';
import { TEMPS_JEUX_PAR_DEFAUT } from '@common/constantes/constantes-temps-jeux';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { StatutPartie } from '@common/enum/statut-partie';
import { TypeFinPartie } from '@common/enum/type-fin-partie';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { InterfaceJeuxReduiteClient } from '@common/interface/interface-jeux-reduite-client';
import { InterfaceReponseVerification } from '@common/interface/interface-reponse-verification';
import { Joueur } from '@common/interface/joueur';
import { Message } from '@common/interface/message';
import { reponseDeclassementScore } from '@common/interface/reponse-declassement-score';
import { ReponseStatutPartie } from '@common/interface/reponse-statut-partie';
import { ScoreClient } from '@common/interface/score-client';
import { Vec2 } from '@common/interface/vec2';
import { ID_SALLE_BROADCAST, INDEX_JOUEUR_HOTE, ModesJeu } from '@common/valeurs-par-defaut';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class SocketGateway {
    @WebSocketServer() private server: Server;
    // Le gateway utilise tous ces services pour faire fonctionner le serveur.
    // eslint-disable-next-line max-params
    constructor(
        private readonly logger: Logger,
        private gestionSalle: GestionSallesService,
        private gestionParties: GestionPartiesCourantes,
        private gestionMessages: GestionMessagesService,
        private readonly tempsJeuxService: GestionConstantesTempsJeuxService,
        private fichiersJeuxService: FichiersJeuxService,
        private scoreService: ScoreService,
    ) {}

    @SubscribeMessage(SocketEvenements.RecupererListeJeux)
    async recupererListeJeux(socket: Socket) {
        socket.emit(SocketEvenements.Jeux, await this.fichiersJeuxService.obtenirJeuxAvecScore());
    }
    @SubscribeMessage(SocketEvenements.CreerSalle)
    creerSalle(socketHote: Socket, joueurHote: Joueur) {
        const idSalleCreee: string = this.gestionSalle.creerSalle(joueurHote.modeJeu);
        joueurHote.idSalle = idSalleCreee;
        this.logger.log(idSalleCreee);
        if (joueurHote.estHote === null) {
            const nouvellePartie: Partie = this.gestionParties.ajouterUnePartie([joueurHote], ModesJeu.Classique);
            nouvellePartie.assignerJeu(
                this.fichiersJeuxService.obtenirJeu(joueurHote.idJeu),
                this.fichiersJeuxService.recupererTableauEtMatriceJSON(joueurHote.idJeu),
            );
            nouvellePartie.constantesDeTemps = this.tempsJeuxService.obtenirConstantesTempsJeux();
        } else {
            this.fichiersJeuxService.modifierEtatDuJeu(joueurHote.idJeu, idSalleCreee);
        }
        this.gestionSalle.obtenirSalle(idSalleCreee).ajouterJoueur(joueurHote, socketHote);
        this.chargerNouveauxJeux();
        socketHote.emit(SocketEvenements.SalleId, idSalleCreee);
    }

    @SubscribeMessage(SocketEvenements.RejoindreSalle)
    rejoindreSalle(socket: Socket, joueurInvite: Joueur) {
        const salle: Salle = this.gestionSalle.obtenirSalle(joueurInvite.idSalle);
        if (!salle.obtenirJoueurInvite()) {
            salle.ajouterJoueur(joueurInvite, socket);
            this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.DemandeJoindrePartie, joueurInvite);
            socket.emit(SocketEvenements.SalleEstPleine, false);
        } else {
            socket.emit(SocketEvenements.SalleEstPleine, true);
        }
    }

    @SubscribeMessage(SocketEvenements.RejeterInvite)
    rejeterInvite(socket: Socket) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        const joueurInvite: Joueur = salle.obtenirJoueurInvite();
        this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.RejeteDeLaSalle, joueurInvite);
        salle.retirerJoueur(joueurInvite);
    }

    @SubscribeMessage(SocketEvenements.AccepterInvite)
    accepterInvite(socket: Socket) {
        const salleDeJeu: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        const listeJoueurs: Joueur[] = salleDeJeu.obtenirTousLesJoueurs();
        const jeu: InterfaceJeuxReduiteClient = this.fichiersJeuxService.obtenirJeu(listeJoueurs[INDEX_JOUEUR_HOTE].idJeu);
        const nouvellePartie: Partie = this.gestionParties.ajouterUnePartie(listeJoueurs, salleDeJeu.obtenirModeDeJeu());
        nouvellePartie.assignerJeu(jeu, this.fichiersJeuxService.recupererTableauEtMatriceJSON(jeu.id));
        nouvellePartie.constantesDeTemps = this.tempsJeuxService.obtenirConstantesTempsJeux();
        this.fichiersJeuxService.modifierEtatDuJeu(jeu.id);
        this.chargerNouveauxJeux();
        this.server.to(salleDeJeu.obtenirIdSalle()).emit(SocketEvenements.LancerPartie, listeJoueurs);
    }

    @SubscribeMessage(SocketEvenements.VerificationCoord)
    verifierCoord(socket: Socket, coords: Vec2) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        const joueurDemande: Joueur = salle.trouverJoueurAssocieSocket(socket);
        const partieCourante: Partie = this.gestionParties.obtenirPartie(salle.obtenirIdSalle());
        const diffTrouvee: Vec2[] = partieCourante.obtenirRegroupementDifferenceAvecCoord(coords, joueurDemande);

        const reponse: InterfaceReponseVerification = {
            difference: diffTrouvee,
            indexJoueur: salle.trouverIndexJoueur(joueurDemande),
            partieEstFinie: null,
        };

        let messageSysteme: Message;
        if (diffTrouvee) {
            messageSysteme = this.gestionMessages.creerMessageTrouve(joueurDemande, partieCourante.estMultijoueur());
            this.envoyerMessageSysteme(salle.obtenirIdSalle(), messageSysteme);
            this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.ReponseVerificationCoord, reponse);
            const partieFinie: boolean = this.gestionVictoireDefaite(salle);
            if (salle.obtenirModeDeJeu() === ModesJeu.TempsLimite && !partieFinie) this.prochainJeuTempsLimite(salle.obtenirIdSalle());
        } else {
            messageSysteme = this.gestionMessages.creerMessageErreur(joueurDemande, partieCourante.estMultijoueur());
            this.envoyerMessageSysteme(salle.obtenirIdSalle(), messageSysteme);
            socket.emit(SocketEvenements.ReponseVerificationCoord, reponse);
        }
    }

    @SubscribeMessage(SocketEvenements.Abandon)
    abandon(socket: Socket) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        const idSalle: string = salle.obtenirIdSalle();
        const partie: Partie = this.gestionParties.obtenirPartie(idSalle);
        const joueurQuiAbandonne: Joueur = salle.trouverJoueurAssocieSocket(socket);

        partie.abandon(joueurQuiAbandonne);
        salle.retirerJoueur(joueurQuiAbandonne);
        this.envoyerMessageSysteme(salle.obtenirIdSalle(), this.gestionMessages.creerMessageAbandon(joueurQuiAbandonne));
        this.server.to(idSalle).emit(SocketEvenements.AnnonceFinPartie, TypeFinPartie.Abandon);
        if (partie.partieEstFinie(this.fichiersJeuxService.obtenirJeux())) {
            this.gestionSalle.supprimerSalle(idSalle);
            this.gestionParties.supprimerPartie(idSalle);
        }
    }

    @SubscribeMessage(SocketEvenements.TempsEcoule)
    gestionTempsEcoule(socket: Socket) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        if (salle) {
            const idSalle: string = salle.obtenirIdSalle();
            this.gestionSalle.supprimerSalle(idSalle);
            this.gestionParties.supprimerPartie(idSalle);
        }
    }

    @SubscribeMessage(SocketEvenements.Message)
    recevoirEtEnvoyerMessage(_: Socket, messageRecu: Message) {
        this.server.to(messageRecu.destinateur.idSalle).emit(SocketEvenements.Message, messageRecu);
    }

    @SubscribeMessage(SocketEvenements.QuitterSalle)
    quitterSalle(socket: Socket) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        if (salle) {
            const joueur: Joueur = salle.trouverJoueurAssocieSocket(socket);
            if (joueur.estHote) {
                if (salle.obtenirModeDeJeu() === ModesJeu.Classique) {
                    this.fichiersJeuxService.modifierEtatDuJeu(joueur.idJeu);
                    this.server.to(joueur.idSalle).emit(SocketEvenements.HoteAQuitteSalle);
                }
                this.gestionSalle.supprimerSalle(joueur.idSalle);
            } else {
                this.server.to(joueur.idSalle).emit(SocketEvenements.InviteAQuitteSalle);
                salle.retirerJoueur(joueur);
            }
            this.chargerNouveauxJeux();
        }
    }

    @SubscribeMessage(SocketEvenements.ChargerNouveauxJeux)
    async chargerNouveauxJeux() {
        this.server.emit(SocketEvenements.Jeux, await this.fichiersJeuxService.obtenirJeuxAvecScore());
    }
    @SubscribeMessage(SocketEvenements.AnnonceSuppressionJeu)
    async annoncerSuppressionJeu(_: Socket, idJeu: number) {
        await this.fichiersJeuxService.supprimerJeu(idJeu);
        this.chargerNouveauxJeux();
        this.gestionSalle.obtenirSallesDuJeu(idJeu).forEach((salle: Salle) => {
            if (!this.gestionParties.obtenirPartie(salle.obtenirIdSalle())) {
                this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.AnnonceSuppressionSalle);
                this.gestionSalle.supprimerSalle(salle.obtenirIdSalle());
            }
        });
    }

    @SubscribeMessage(SocketEvenements.AnnonceReinitialisationScore)
    async annonceReinitialisationScore(socket: Socket, nomJeu: string) {
        await this.scoreService.reinitialiserScore(nomJeu);
        await this.chargerNouveauxJeux();
    }
    @SubscribeMessage(SocketEvenements.AnnonceReinitialisationTousLesScores)
    async annonceReinitialisationTousLesScores() {
        await this.scoreService.reinitialiserTousLesScores();
        await this.chargerNouveauxJeux();
    }
    @SubscribeMessage(SocketEvenements.NouveauScore)
    async nouveauScore(_: Socket, scoreClient: ScoreClient) {
        if (await this.fichiersJeuxService.estSynchroAvecBD()) {
            const reponseDeClassement: reponseDeclassementScore = await this.scoreService.verificationDeclassementScore(scoreClient);
            if (reponseDeClassement.aDeclasse) {
                this.envoyerMessageSysteme(
                    ID_SALLE_BROADCAST,
                    this.gestionMessages.creerMessageNouveauMeilleurTemps(
                        scoreClient.nouveauScore.nomJoueur,
                        reponseDeClassement.index,
                        scoreClient.nomJeu,
                        scoreClient.estSolo,
                    ),
                );
            }
            await this.chargerNouveauxJeux();
        }
    }
    @SubscribeMessage(SocketEvenements.AnnonceSuppressionTousLesJeux)
    async annonceSuppressionTousLesJeux() {
        await this.fichiersJeuxService.supprimerTousLesJeux();
        this.chargerNouveauxJeux();
    }

    @SubscribeMessage(SocketEvenements.MiseAJourConstantesTempsJeux)
    mettreAJourConstantesTempsJeux(_: Socket, tempsJeux: ConstantesTempsJeux) {
        this.tempsJeuxService.mettreAJourConstantesTempsJeux(tempsJeux);
        const tempsJeuxMisAJour: ConstantesTempsJeux = this.tempsJeuxService.obtenirConstantesTempsJeux();
        this.server.emit(SocketEvenements.EnvoiConstantesTempsJeux, tempsJeuxMisAJour);
    }

    @SubscribeMessage(SocketEvenements.DemandeConstantesTempsJeux)
    recupererConstantesTempsJeuxSurDemande(socket: Socket) {
        const tempsJeux: ConstantesTempsJeux = this.tempsJeuxService.obtenirConstantesTempsJeux();
        socket.emit(SocketEvenements.EnvoiConstantesTempsJeux, tempsJeux);
    }

    @SubscribeMessage(SocketEvenements.ReinitialisationConstantesTempsJeux)
    reinitialiserConstantesTempsJeux() {
        this.tempsJeuxService.reinitialiserConstantesTempsJeux();
        this.server.emit(SocketEvenements.EnvoiConstantesTempsJeux, TEMPS_JEUX_PAR_DEFAUT);
    }

    @SubscribeMessage(SocketEvenements.VerifierSocket)
    verifierSocket(socket: Socket) {
        const idSalleTrouvee: string = this.gestionSalle.obtenirIdSalleDuSocket(socket);
        if (!idSalleTrouvee) {
            this.server.to(socket.id).emit(SocketEvenements.SocketInvalide);
        }
    }
    @SubscribeMessage(SocketEvenements.IndiceUtilise)
    envoyerMessageIndice(socket: Socket) {
        const idSalle: string = this.gestionSalle.obtenirIdSalleDuSocket(socket);
        const message: Message = this.gestionMessages.creerMessageIndice();
        this.envoyerMessageSysteme(idSalle, message);
    }
    @SubscribeMessage(SocketEvenements.CreerOuRejoindreTempsLimite)
    creerOuRejoindreTempsLimite(socket: Socket, joueur: Joueur) {
        const reponse: ReponseStatutPartie = {};
        if (this.fichiersJeuxService.obtenirJeux().length === 0) {
            reponse.statutPartie = StatutPartie.AucunJeuDisponible;
            socket.emit(SocketEvenements.StatutPartie, reponse);
        } else {
            if (joueur.estSolo) {
                reponse.salleId = this.gestionSalle.creerSalle(joueur.modeJeu);
                const salleCree: Salle = this.gestionSalle.obtenirSalle(reponse.salleId);
                salleCree.ajouterJoueur(joueur, socket);
                const nouvellePartie: Partie = this.gestionParties.ajouterUnePartie([joueur], ModesJeu.TempsLimite);
                const nomJeuGenere: string = nouvellePartie.obtenirProchainNomJeu(this.fichiersJeuxService.obtenirJeux());
                const jeuChoisi: InterfaceJeux = this.fichiersJeuxService.obtenirJeuParNom(nomJeuGenere);
                nouvellePartie.assignerJeu(jeuChoisi, this.fichiersJeuxService.recupererTableauEtMatriceJSON(jeuChoisi.id));
                nouvellePartie.constantesDeTemps = this.tempsJeuxService.obtenirConstantesTempsJeux();
                reponse.statutPartie = StatutPartie.PartiePreteAuLancement;
                reponse.joueurs = salleCree.obtenirTousLesJoueurs();
                reponse.jeu = jeuChoisi;
            } else {
                const idSalleDispo: string = this.gestionSalle.obtenirSalleTempsLimiteDisponible();
                if (idSalleDispo && !this.gestionParties.obtenirPartie(idSalleDispo)) {
                    const salle: Salle = this.gestionSalle.obtenirSalle(idSalleDispo);
                    salle.ajouterJoueur(joueur, socket);
                    const nouvellePartie: Partie = this.gestionParties.ajouterUnePartie(salle.obtenirTousLesJoueurs(), ModesJeu.TempsLimite);
                    const nomJeuGenere: string = nouvellePartie.obtenirProchainNomJeu(this.fichiersJeuxService.obtenirJeux());
                    const jeuChoisi: InterfaceJeux = this.fichiersJeuxService.obtenirJeuParNom(nomJeuGenere);
                    nouvellePartie.assignerJeu(jeuChoisi, this.fichiersJeuxService.recupererTableauEtMatriceJSON(jeuChoisi.id));
                    nouvellePartie.constantesDeTemps = this.tempsJeuxService.obtenirConstantesTempsJeux();
                    reponse.statutPartie = StatutPartie.PartiePreteAuLancement;
                    reponse.joueurs = salle.obtenirTousLesJoueurs();
                    reponse.jeu = jeuChoisi;
                    reponse.salleId = idSalleDispo;
                } else {
                    reponse.salleId = this.gestionSalle.creerSalle(joueur.modeJeu);
                    this.gestionSalle.obtenirSalle(reponse.salleId).ajouterJoueur(joueur, socket);
                    reponse.statutPartie = StatutPartie.AttenteDeuxiemeJoueur;
                }
            }
        }
        this.server.to(joueur.idSalle).emit(SocketEvenements.StatutPartie, reponse);
    }
    gestionVictoireDefaite(salle: Salle): boolean {
        const partie: Partie = this.gestionParties.obtenirPartie(salle.obtenirIdSalle());
        if (partie.partieEstFinie(this.fichiersJeuxService.obtenirJeux())) {
            if (salle.obtenirModeDeJeu() === ModesJeu.Classique) {
                const joueurGagnant: Joueur = partie.obtenirJoueurGagnant();
                salle.trouverSocketAssocieJoueur(joueurGagnant).emit(SocketEvenements.AnnonceFinPartie, TypeFinPartie.Victoire);
                salle.retirerJoueur(joueurGagnant);
                this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.AnnonceFinPartie, TypeFinPartie.Defaite);
            } else {
                this.server.to(salle.obtenirIdSalle()).emit(SocketEvenements.AnnonceFinPartie, TypeFinPartie.Victoire);
            }
            this.gestionSalle.supprimerSalle(salle.obtenirIdSalle());
            this.gestionParties.supprimerPartie(salle.obtenirIdSalle());
            return true;
        }
        return false;
    }
    prochainJeuTempsLimite(idSalle: string) {
        const partie: Partie = this.gestionParties.obtenirPartie(idSalle);
        const nomJeuGenere: string = partie.obtenirProchainNomJeu(this.fichiersJeuxService.obtenirJeux());
        const prochainJeu: InterfaceJeux = this.fichiersJeuxService.obtenirJeuParNom(nomJeuGenere);
        partie.assignerJeu(prochainJeu, this.fichiersJeuxService.recupererTableauEtMatriceJSON(prochainJeu.id));
        this.server.to(idSalle).emit(SocketEvenements.ProchainJeuTempsLimite, prochainJeu);
    }
    envoyerMessageSysteme(idSalle: string, message: Message) {
        if (idSalle === ID_SALLE_BROADCAST) {
            this.server.emit(SocketEvenements.Message, message);
        } else this.server.to(idSalle).emit(SocketEvenements.Message, message);
    }
    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }
    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        if (this.gestionSalle.obtenirIdSalleDuSocket(socket) !== undefined) {
            this.gererDeconnexionHative(socket);
        }
    }
    private gererDeconnexionHative(socket: Socket) {
        const salle: Salle = this.gestionSalle.obtenirSalleAvecSocket(socket);
        if (this.gestionParties.obtenirPartie(salle.obtenirIdSalle())) {
            this.abandon(socket);
        } else this.quitterSalle(socket);
    }
}
