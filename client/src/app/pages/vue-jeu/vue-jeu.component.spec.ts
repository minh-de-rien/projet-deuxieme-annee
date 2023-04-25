import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { ZoneJeuComponent } from '@app/components/zone-jeu/zone-jeu.component';
import { ZoneMessagerieComponent } from '@app/components/zone-messagerie/zone-messagerie.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DiffusionJeuService } from '@app/services/diffusion-jeu/diffusion-jeu.service';
import { DiffusionJoueurService } from '@app/services/diffusion-joueur/diffusion-joueur.service';
import { EvenementJeuService } from '@app/services/evenement-jeu/evenement-jeu.service';
import { FenetreModaleService } from '@app/services/fenetre-modale/fenetre-modale.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { jeuTest, joueurTest } from '@common/constantes/constantes-test';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { TypeFinPartie } from '@common/enum/type-fin-partie';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { INDEX_JOUEUR_HOTE, INDEX_JOUEUR_INVITE, ModesJeu } from '@common/valeurs-par-defaut';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { VueJeuComponent } from './vue-jeu.component';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
const SCORE = [
    { nomJoueur: 'Pol Malone1', temps: 333 },
    { nomJoueur: 'LePujanJames1', temps: 6969 },
    { nomJoueur: 'Thomas', temps: 763 },
];
const jeu: InterfaceJeux = {
    id: 1,
    nom: 'Camion Bleu',
    meilleursTempsSolo: SCORE,
    meilleursTemps1v1: SCORE,
    imgOriginale: '/images/image-chien.bmp',
    imgModifiee: '/images/image-chien.bmp',
    nombreDifferences: 3,
};

describe('VueJeuComponent', () => {
    let component: VueJeuComponent;
    let fixture: ComponentFixture<VueJeuComponent>;
    const routerSpy = {
        navigate: jasmine.createSpy('navigate'),
    };
    let socketServiceSpy: GestionSocketClientService;
    let assisantSocket: AssistantTestsSocket;
    let serviceEvenement: EvenementJeuService;
    let serviceDiffusion: DiffusionJoueurService;
    let serviceDiffusionJeu: DiffusionJeuService;
    let serviceHttp: CommunicationService;
    let serviceModale: FenetreModaleService;

    beforeEach(async () => {
        assisantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assisantSocket as unknown as Socket;

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [VueJeuComponent, ZoneMessagerieComponent, ZoneJeuComponent],
            providers: [
                // CommunicationService,
                { provide: Router, useValue: routerSpy },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
                { provide: MatDialog, useValue: {} },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(VueJeuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        serviceEvenement = TestBed.inject(EvenementJeuService);
        serviceDiffusion = TestBed.inject(DiffusionJoueurService);
        serviceHttp = TestBed.inject(CommunicationService);
        serviceDiffusionJeu = TestBed.inject(DiffusionJeuService);
        serviceModale = TestBed.inject(FenetreModaleService);
    });
    afterEach(() => {
        fixture.destroy();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });
    it("modeTriche devrait appeler gererModeTriche si le message de fin n'est pas actif", () => {
        const gererModeTricheSpy = spyOn<any>(serviceEvenement, 'gererModeTriche');
        component.messageDeFinActive = false;
        component.estPasDansZoneMessage = true;
        component.modeTriche();
        expect(gererModeTricheSpy).toHaveBeenCalled();
    });
    it("demandeIndice() devrait appeler evenementService.demandeIndice et décrémenter le nombre d'indices restants", fakeAsync(() => {
        const mockContexte = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        const mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);
        mockCanvas.getContext.and.callFake(() => {
            return mockContexte;
        });
        component['canvasIndice'] = { nativeElement: mockCanvas };
        spyOn<any>(component, 'demandeIndiceEstValide').and.callFake(() => {
            return true;
        });
        const demandeIndiceSpy = spyOn<any>(serviceEvenement, 'demandeIndice');
        component.estPasDansZoneMessage = true;
        component.demandeIndice();
        expect(demandeIndiceSpy).toHaveBeenCalled();
    }));
    it('gestionChangementHash devrait causer un abandon', () => {
        spyOn(component, 'abandonner').and.stub();
        component.gestionChangementHash();
        expect(component.abandonner).toHaveBeenCalled();
    });
    it("ngOnInit devrait appeler les quatre fonctions d'abonnement", () => {
        const diffusionJoueurSpy = spyOn<any>(component, 'abonnerAuServiceDiffusionJoueur');
        const notifFinDePartieSpy = spyOn<any>(component, 'abonnerAuServiceEvenementDeNotifDifferenceTrouvee');
        const abonnerASocketInvalideSpy = spyOn<any>(component, 'abonnerASocketInvalide');
        const abonnerALaFinDePartieSpy = spyOn<any>(component, 'abonnerALaFinDePartie');
        component.ngOnInit();
        expect(diffusionJoueurSpy).toHaveBeenCalled();
        expect(notifFinDePartieSpy).toHaveBeenCalled();
        expect(abonnerASocketInvalideSpy).toHaveBeenCalled();
        expect(abonnerALaFinDePartieSpy).toHaveBeenCalled();
    });
    it('estModeClassique devrait retourner le bon boolean', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
            estHote: true,
            modeJeu: ModesJeu.Classique,
        };
        component.joueur = mockJoueur;
        const result: boolean = component.estModeClassique();
        expect(result).toEqual(true);
    });
    it('abandonner()', () => {
        const forcerDesactivationModeTricheSpy = spyOn<any>(serviceEvenement, 'forcerDesactivationModeTriche');
        const abandonnerSpy = spyOn<any>(serviceEvenement, 'abandonner');
        component.abandonner();
        expect(forcerDesactivationModeTricheSpy).toHaveBeenCalled();
        expect(abandonnerSpy).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
    it('miseAJourScore()', () => {
        component.miseAJourScore(3);
        expect(component.score).toEqual(3);
    });
    it('defaiteTempsLimite()', () => {
        const annonceTempsEcouleSpy = spyOn<any>(serviceEvenement, 'annonceTempsEcoule');
        const finDePartieSpy = spyOn<any>(component, 'finDePartie');
        component.defaiteTempsLimite();
        expect(annonceTempsEcouleSpy).toHaveBeenCalled();
        expect(finDePartieSpy).toHaveBeenCalled();
    });
    it('abonnerAuServiceDiffusionJoueur()', () => {
        const traiterAbonnementAuServiceCommunicationSpy = spyOn<any>(component, 'traiterAbonnementAuServiceCommunication');
        const gererAbonnementTempsLimiteSpy = spyOn<any>(component, 'gererAbonnementTempsLimite');
        const etablirJoueurSpy = spyOn<any>(serviceEvenement, 'etablirJoueur');
        const demanderValeursInitialisationHorlogeAuServeurSpy = spyOn<any>(component, 'demanderValeursInitialisationHorlogeAuServeur');
        serviceDiffusion.joueur = new BehaviorSubject<Joueur>(joueurTest);

        component['abonnerAuServiceDiffusionJoueur']();
        serviceDiffusion.definirJoueur(joueurTest);

        expect(component.joueur).toEqual(joueurTest);
        expect(etablirJoueurSpy).toHaveBeenCalled();
        expect(demanderValeursInitialisationHorlogeAuServeurSpy).toHaveBeenCalled();
        expect(traiterAbonnementAuServiceCommunicationSpy).toHaveBeenCalled();

        component.joueur.modeJeu = ModesJeu.TempsLimite;

        component['abonnerAuServiceDiffusionJoueur']();
        serviceDiffusion.definirJoueur(joueurTest);

        expect(gererAbonnementTempsLimiteSpy).toHaveBeenCalled();
    });
    it("traiterAbonnementAuServiceCommunication() devrait modifier l'état du jeu", () => {
        const idJeu = 1;
        const subject = new Subject<InterfaceJeux>();
        spyOn(serviceHttp, 'obtenirJeu').and.returnValue(subject);
        component['traiterAbonnementAuServiceCommunication'](idJeu);
        subject.next(jeu);
        expect(component.jeu).toEqual(jeu);
    });
    it('gererAbonnementTempsLimite()', () => {
        const subject = new Subject<InterfaceJeux>();
        const abonnerAuServiceDeDiffusionJeuSpy = spyOn<any>(component, 'abonnerAuServiceDeDiffusionJeu');
        const abonnerReceptionDuProchainJeuSpy = spyOn<any>(serviceEvenement, 'abonnerReceptionDuProchainJeu');
        spyOn(serviceEvenement, 'obtenirProchainJeu').and.returnValue(subject);
        component['gererAbonnementTempsLimite']();
        subject.next(jeu);
        expect(component.jeu).toEqual(jeu);
        expect(abonnerAuServiceDeDiffusionJeuSpy).toHaveBeenCalled();
        expect(abonnerReceptionDuProchainJeuSpy).toHaveBeenCalled();
    });
    it('abonnerAuServiceDeDiffusionJeu()', () => {
        serviceDiffusionJeu.jeu = new BehaviorSubject<InterfaceJeux>(jeu);
        component['abonnerAuServiceDeDiffusionJeu']();
        serviceDiffusionJeu.definirJeu(jeu);
        expect(component.jeu).toEqual(jeu);
    });
    it('abonnerAuServiceEvenementDeNotifDifferenceTrouvee() devrait incrémenter le bon compteur', fakeAsync(() => {
        const subject = new Subject<number>();
        spyOn(serviceEvenement, 'obtenirNouvelleDifferenceTrouvee').and.returnValue(subject);
        const verifSpy = spyOn<any>(component, 'verifierCorrespondanceIndex').and.returnValue(true);
        component['abonnerAuServiceEvenementDeNotifDifferenceTrouvee']();
        component.pointageAdversaire = 0;
        subject.next(0);
        expect(component.nombreDifferencesTrouvees).toEqual(1);
        verifSpy.and.returnValue(false);
        component.nombreDifferencesTrouvees = 0;
        subject.next(1);
        expect(component.pointageAdversaire).toEqual(1);
    }));
    it('finDePartie() devrait établir le message et appeler send(finDePartie)', () => {
        const forcerDesactivationModeTricheSpy = spyOn(serviceEvenement, 'forcerDesactivationModeTriche');
        const ouvrirModaleAnnonceSpy = spyOn(serviceModale, 'ouvrirModaleAnnonce');
        component['finDePartie']('message pour tests');
        expect(component.messageDeFinActive).toEqual(true);
        expect(forcerDesactivationModeTricheSpy).toHaveBeenCalled();
        expect(ouvrirModaleAnnonceSpy).toHaveBeenCalled();
    });
    it("verifierCorrespondanceIndex() devrait retourner true si l'indexJoueur correspond au statut du joueur", () => {
        const mockJoueur1: Joueur = {
            nom: 'mark',
            estHote: true,
        };
        component.joueur = mockJoueur1;
        expect(component['verifierCorrespondanceIndex'](INDEX_JOUEUR_HOTE)).toEqual(true);
        expect(component['verifierCorrespondanceIndex'](INDEX_JOUEUR_INVITE)).toEqual(false);

        const mockJoueur2: Joueur = {
            nom: 'michou',
            estHote: false,
        };
        component.joueur = mockJoueur2;
        expect(component['verifierCorrespondanceIndex'](INDEX_JOUEUR_HOTE)).toEqual(false);
        expect(component['verifierCorrespondanceIndex'](INDEX_JOUEUR_INVITE)).toEqual(true);
    });
    it('abonnerASocketInvalide() devrait appeler send et navigate', () => {
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component['abonnerASocketInvalide']();
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.VerifierSocket);
        assisantSocket.emitParLesPairs(SocketEvenements.SocketInvalide);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
    });
    it('demandeIndiceEstValide() ', () => {
        component.messageDeFinActive = false;
        component.joueur.estSolo = true;
        component.nombreIndicesRestants = 1;
        const resultat: boolean = component['demandeIndiceEstValide']();
        expect(resultat).toBeTruthy();
    });
    it('identifierIndiceCourant() ', () => {
        component.nombreIndicesRestants = 1;
        const identifiant: number = component['identifierIndiceCourant']();
        expect(identifiant).toEqual(3);
    });
    it('demanderValeursInitialisationHorlogeAuServeur() ', () => {
        const demanderTempsDeReferenceDePartieAuServeurSpy = spyOn<any>(component, 'demanderTempsDeReferenceDePartieAuServeur');
        const demanderConstantesDeTempsDePartieAuServeurSpy = spyOn<any>(component, 'demanderConstantesDeTempsDePartieAuServeur');
        component['demanderValeursInitialisationHorlogeAuServeur']();
        expect(demanderTempsDeReferenceDePartieAuServeurSpy).toHaveBeenCalled();
        expect(demanderConstantesDeTempsDePartieAuServeurSpy).toHaveBeenCalled();
    });
    it('demanderTempsDeReferenceDePartieAuServeur() ', () => {
        const subject = new Subject<number>();
        spyOn(serviceHttp, 'obtenirTempsDeReferenceDePartie').and.returnValue(subject);
        component['demanderValeursInitialisationHorlogeAuServeur']();
        subject.next(1);
        expect(component.tempsDeReferencePourLeCompteur).toEqual(1);
    });
    it('demanderConstantesDeTempsDePartieAuServeur() ', () => {
        const constantes: ConstantesTempsJeux = {
            compteARebours: 3,
            penalite: 4,
            gain: 5,
        };
        const subject = new Subject<ConstantesTempsJeux>();
        const etablirGainDeTempsSpy = spyOn<any>(serviceEvenement, 'etablirGainDeTemps');
        const etablirPenaliteDeTempsSpy = spyOn<any>(serviceEvenement, 'etablirPenaliteDeTemps');
        spyOn(serviceHttp, 'obtenirConstantesDeTempsDePartie').and.returnValue(subject);
        component['demanderValeursInitialisationHorlogeAuServeur']();
        subject.next(constantes);
        expect(component.valeurDeDepartDuCompteur).toEqual(3);
        expect(component.valeurPenaliteDeTemps).toEqual(4);
        expect(component.valeurGainDeTemps).toEqual(5);
        expect(etablirGainDeTempsSpy).toHaveBeenCalled();
        expect(etablirPenaliteDeTempsSpy).toHaveBeenCalled();
    });
    it('abonnerALaFinDePartie() ', () => {
        const subject = new Subject<TypeFinPartie>();
        const gererAbandonSpy = spyOn<any>(component, 'gererAbandon');
        const gererVictoireSpy = spyOn<any>(component, 'gererVictoire');
        const nextSpy = spyOn<any>(component.arretHorloge, 'next');
        const finDePartieSpy = spyOn<any>(component, 'finDePartie');
        spyOn(serviceEvenement, 'obtenirFinDePartie').and.returnValue(subject);
        component['abonnerALaFinDePartie']();
        subject.next(TypeFinPartie.Abandon);
        expect(gererAbandonSpy).toHaveBeenCalled();
        subject.next(TypeFinPartie.Victoire);
        expect(gererVictoireSpy).toHaveBeenCalled();
        subject.next(TypeFinPartie.Defaite);
        expect(nextSpy).toHaveBeenCalled();
        expect(finDePartieSpy).toHaveBeenCalled();
    });
    it('gererAbandon() ', () => {
        component.joueur = {
            nom: 'michou',
            estHote: false,
            modeJeu: ModesJeu.Classique,
            estSolo: false,
        };
        const nextSpy = spyOn<any>(component.arretHorloge, 'next');
        const finDePartieSpy = spyOn<any>(component, 'finDePartie');
        component['gererAbandon']();
        expect(nextSpy).toHaveBeenCalled();
        expect(finDePartieSpy).toHaveBeenCalled();
        component.joueur.modeJeu = ModesJeu.TempsLimite;
        component['gererAbandon']();
        expect(component.joueur.estSolo).toEqual(true);
    });
    it('gererVictoire() ', () => {
        component.jeu = jeuTest;
        const nextSpy = spyOn<any>(component.arretHorloge, 'next');
        const finDePartieSpy = spyOn<any>(component, 'finDePartie');
        const sendSpy = spyOn(socketServiceSpy, 'send');
        component.joueur.modeJeu = ModesJeu.Classique;
        component.joueur.estSolo = true;
        component['gererVictoire']();
        expect(nextSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalled();
        expect(finDePartieSpy).toHaveBeenCalledTimes(1);
        component.joueur.estSolo = false;
        component['gererVictoire']();
        expect(finDePartieSpy).toHaveBeenCalledTimes(2);
        component.joueur.modeJeu = ModesJeu.TempsLimite;
        component['gererVictoire']();
        expect(finDePartieSpy).toHaveBeenCalledTimes(3);
    });
});
