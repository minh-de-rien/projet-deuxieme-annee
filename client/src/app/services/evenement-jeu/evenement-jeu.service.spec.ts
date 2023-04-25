/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AssistantTestsSocket } from '@app/classes/assistant-tests-socket/assistant-tests-socket';
import { AudioService } from '@app/services/audio/audio.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GestionAffichageJeuService } from '@app/services/gestion-affichage-jeu/gestion-affichage-jeu.service';
import { GestionIndicesService } from '@app/services/gestion-indices/gestion-indices.service';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { InterfaceReponseVerification } from '@common/interface/interface-reponse-verification';
import { Joueur } from '@common/interface/joueur';
import { Vec2 } from '@common/interface/vec2';
import { DELAI_APPARITION_INDICE_SPECIAL, ModesJeu } from '@common/valeurs-par-defaut';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { EvenementJeuService } from './evenement-jeu.service';
import SpyObj = jasmine.SpyObj;

const reponse: InterfaceReponseVerification = {
    difference: [
        { x: 3, y: 4 },
        { x: 5, y: 7 },
    ],
    indexJoueur: 0,
    partieEstFinie: true,
};
const coord: Vec2 = {
    x: 0,
    y: 1,
};
/* eslint @typescript-eslint/no-magic-numbers: "off"*/
describe('EvenementJeuService', () => {
    let service: EvenementJeuService;
    let gestionAffichageJeuServiceSpy: SpyObj<GestionAffichageJeuService>;
    let audioService: AudioService;
    let socketServiceSpy: GestionSocketClientService;
    let assistantSocket: AssistantTestsSocket;
    let gestionIndicesServiceSpy: SpyObj<GestionIndicesService>;
    let serviceHttpSpy: SpyObj<CommunicationService>;

    beforeEach(() => {
        assistantSocket = new AssistantTestsSocket();
        socketServiceSpy = new GestionSocketClientService();
        socketServiceSpy.socket = assistantSocket as unknown as Socket;
        gestionAffichageJeuServiceSpy = jasmine.createSpyObj('GestionAffichageJeuService', [
            'afficheErreur',
            'modificationCanvasTriche',
            'clignotementCanvasTriche',
            'desactivationClignotementTriche',
            'afficherDifferenceTrouvee',
            'miseAJourCanvasTriche',
            'afficherCadranIndice',
            'dessinerImage',
        ]);
        serviceHttpSpy = jasmine.createSpyObj('CommunicationService', ['obtenirDifferencesRestantes']);
        gestionIndicesServiceSpy = jasmine.createSpyObj('GestionIndiceService', ['etablirIndiceSpecial', 'etablirIndice']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: CommunicationService, useValue: serviceHttpSpy },
                { provide: GestionSocketClientService, useValue: socketServiceSpy },
                { provide: GestionAffichageJeuService, useValue: gestionAffichageJeuServiceSpy },
                { provide: GestionIndicesService, useValue: gestionIndicesServiceSpy },
            ],
        });
        service = TestBed.inject(EvenementJeuService);
        audioService = TestBed.inject(AudioService);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it("le .on reponseverificationcoord dans le constructeur devrait être executé lors de l'emit approprié", () => {
        const gestionErreurSpy = spyOn<any>(service, 'gestionErreur');
        const gestionDifferenceTrouveeSpy = spyOn<any>(service, 'gestionDifferenceTrouvee');

        assistantSocket.emitParLesPairs(SocketEvenements.ReponseVerificationCoord, reponse);
        expect(gestionDifferenceTrouveeSpy).toHaveBeenCalledWith(reponse);

        reponse.difference = null;
        assistantSocket.emitParLesPairs(SocketEvenements.ReponseVerificationCoord, reponse);
        expect(gestionErreurSpy).toHaveBeenCalled();
    });

    it("le .on AnnonceFinPartie dans le constructeur devrait être executé lors de l'emit approprié", () => {
        const spyNext = spyOn<any>((service as any).finDePartie, 'next');
        assistantSocket.emitParLesPairs(SocketEvenements.AnnonceFinPartie, reponse);
        expect(spyNext).toHaveBeenCalledWith(reponse);
    });

    it('obtenirFinDePartie() devrait retourner FinDePartie', () => {
        expect(service.obtenirFinDePartie()).toEqual(service['finDePartie']);
    });

    it('obtenirNouvelleDifferenceTrouvee() devrait retourner nouvelleDifferenceTrouvee', () => {
        expect(service.obtenirNouvelleDifferenceTrouvee()).toEqual(service['nouvelleDifferenceTrouvee']);
    });

    it('obtenirModificationDuCompteurDeTemps() devrait retourner modificationDuCompteurDeTemps', () => {
        expect(service.obtenirModificationDuCompteurDeTemps()).toEqual(service['modificationDuCompteurDeTemps']);
    });

    it('obtenirProchainJeu() devrait retourner prochainJeu', () => {
        expect(service.obtenirProchainJeu()).toEqual(service['prochainJeu']);
    });

    it('etablirJoueur devrait enregistrer le joueur rentrer en parametre', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        service.etablirJoueur(mockJoueur);
        expect((service as any).joueur).toEqual(mockJoueur);
    });

    it('etablirGainDeTemps devrait enregistrer le gain de temps rentré en parametre', () => {
        service.etablirGainDeTemps(10);
        expect((service as any).valeurGainDeTemps).toEqual(10);
    });

    it('etablirPenaliteDeTemps devrait enregistrer la penalité de temps rentré en parametre', () => {
        service.etablirPenaliteDeTemps(10);
        expect((service as any).valeurPenaliteDeTemps).toEqual(10);
    });

    it('abonnerReceptionDuProchainJeu devrait receptionner les jeux de temps limité et les afficher', () => {
        const mockJeu: InterfaceJeux = {
            id: 0,
            nom: 'test',
            imgOriginale: 'imageOTest',
            imgModifiee: 'imageMTest',
            nombreDifferences: 2,
        };
        const mockCtx = {} as CanvasRenderingContext2D;
        gestionAffichageJeuServiceSpy.contexteImageOriginaleBot = mockCtx;
        gestionAffichageJeuServiceSpy.contexteImageModifieeBot = mockCtx;
        spyOn<any>((service as any).prochainJeu, 'next');
        service.abonnerReceptionDuProchainJeu();
        assistantSocket.emitParLesPairs(SocketEvenements.ProchainJeuTempsLimite, mockJeu);
        expect((service as any).prochainJeu.next).toHaveBeenCalledWith(mockJeu);
        expect(gestionAffichageJeuServiceSpy.dessinerImage).toHaveBeenCalledWith(mockJeu.imgOriginale, mockCtx);
        expect(gestionAffichageJeuServiceSpy.dessinerImage).toHaveBeenCalledWith(mockJeu.imgModifiee, mockCtx);
    });

    it('verifierCoord() devrait appeler differencePasEncoreTrouvee() et verifierDifference()', () => {
        const valeurBool = true;
        const sendSpy = spyOn(socketServiceSpy, 'send');
        service.verifierCoord(coord, valeurBool);
        expect(service['coordDuClic']).toEqual(coord);
        expect(service['clicSurCanvasOriginal']).toEqual(valeurBool);
        expect(sendSpy).toHaveBeenCalledWith(SocketEvenements.VerificationCoord, coord);
    });

    it('gererModeTriche devrait appeler les bonne méthodes en fonction de si triche est actif ou non', () => {
        spyOn<any>(service, 'mettreAJourCanvasTriche');
        service['tricheActif'] = false;
        service.gererModeTriche();
        expect(service['mettreAJourCanvasTriche']).toHaveBeenCalled();
        expect(gestionAffichageJeuServiceSpy.clignotementCanvasTriche).toHaveBeenCalled();
        service['tricheActif'] = true;
        service.gererModeTriche();
        expect(gestionAffichageJeuServiceSpy.desactivationClignotementTriche).toHaveBeenCalled();
    });

    it('forcerDesactivationModeTriche() devrait appeler gestionAffichageJeuService.desactivationClignotementTriche()', () => {
        service.forcerDesactivationModeTriche();
        expect(gestionAffichageJeuServiceSpy.desactivationClignotementTriche).toHaveBeenCalled();
    });

    it(' demandeIndice() devrait get les différences restantes et gererIndice()', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        (service as any).joueur = mockJoueur;
        (service as any).joueur.idSalle = 0;
        const gererIndiceSpy = spyOn<any>(service, 'gererIndice');
        const mockContexte = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        const subject = new Subject<Vec2[][]>();
        serviceHttpSpy.obtenirDifferencesRestantes.and.returnValue(subject);
        spyOn((service as any).modificationDuCompteurDeTemps, 'next');
        (service as any).valeurPenaliteDeTemps = 5;
        service.demandeIndice(0, mockContexte);
        subject.next([[coord]]);
        expect(gererIndiceSpy).toHaveBeenCalledWith(0, [coord], mockContexte);
        expect((service as any).modificationDuCompteurDeTemps.next).toHaveBeenCalledWith(5);
    });

    it("abandonner devrait send l'evenement Abandon", () => {
        spyOn(socketServiceSpy, 'send');
        service.abandonner();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(SocketEvenements.Abandon);
    });

    it("annonceTempsEcoule devrait send l'evenement TempsEcoule", () => {
        spyOn(socketServiceSpy, 'send');
        service.annonceTempsEcoule();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(SocketEvenements.TempsEcoule);
    });

    it(' gestionDifferencetrouvee() devrait appeler les bonnes méthodes', () => {
        const sonValidationSpy = spyOn(audioService, 'jouerSonValidation');
        const differenceNextSpy = spyOn(service['nouvelleDifferenceTrouvee'], 'next');
        const mettreAJourCanvasTricheSpy = spyOn<any>(service, 'mettreAJourCanvasTriche');
        const spyModifCompteur = spyOn(service['modificationDuCompteurDeTemps'], 'next');
        const mockJoueur: Joueur = {
            nom: 'mark',
            modeJeu: ModesJeu.TempsLimite,
        };
        (service as any).joueur = mockJoueur;
        (service as any).valeurGainDeTemps = 10;
        service['gestionDifferenceTrouvee'](reponse);
        expect(gestionAffichageJeuServiceSpy.afficherDifferenceTrouvee).toHaveBeenCalled();
        expect(sonValidationSpy).toHaveBeenCalled();
        expect(differenceNextSpy).toHaveBeenCalled();
        expect(spyModifCompteur).toHaveBeenCalledWith(-10);
        (service as any).joueur.modeJeu = ModesJeu.Classique;
        service['gestionDifferenceTrouvee'](reponse);
        expect(mettreAJourCanvasTricheSpy).toHaveBeenCalled();
    });

    it('gestionErreur() devrait appeler afficheErreur et sonErreur', () => {
        const sonErreurStub = spyOn(audioService, 'jouerSonErreur');
        service['gestionErreur'](coord, true);
        expect(gestionAffichageJeuServiceSpy.afficheErreur).toHaveBeenCalledWith(coord, true);
        expect(sonErreurStub).toHaveBeenCalled();
    });

    it(' mettreAJourCanvasTriche() devrait appeler gestionAffichageJeuService.miseAJourCanvasTriche()', () => {
        const mockJoueur: Joueur = {
            nom: 'mark',
        };
        (service as any).joueur = mockJoueur;
        (service as any).joueur.idSalle = 0;
        const subject = new Subject<Vec2[][]>();
        serviceHttpSpy.obtenirDifferencesRestantes.and.returnValue(subject);
        service['mettreAJourCanvasTriche']();
        subject.next([[coord]]);
        expect(gestionAffichageJeuServiceSpy.miseAJourCanvasTriche).toHaveBeenCalledWith([[coord]]);
    });

    it(' gererIndice() devrait appeler les bonnes méthodes', () => {
        const faireApparaitreIndiceSpy = spyOn<any>(service, 'faireApparaitreIndice');
        const mockContexte = jasmine.createSpyObj('CanvasRenderingContext2D', ['getImageData']);
        service['gererIndice'](3, [coord], mockContexte);
        expect(gestionIndicesServiceSpy.etablirIndiceSpecial).toHaveBeenCalled();
        expect(faireApparaitreIndiceSpy).toHaveBeenCalled();
        service['gererIndice'](2, [coord], mockContexte);
        expect(gestionIndicesServiceSpy.etablirIndice).toHaveBeenCalled();
        expect(gestionAffichageJeuServiceSpy.afficherCadranIndice).toHaveBeenCalled();
    });

    it(' faireApparaitreIndice() devrait faire apparaitre le canvas pour 3 secondes', fakeAsync(() => {
        const mockCanvas = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);
        mockCanvas.hidden = false;
        const mockContexte = jasmine.createSpyObj('CanvasRenderingContext2D', ['canvas']);
        mockContexte.canvas.and.callFake(() => {
            return mockCanvas;
        });

        service['faireApparaitreIndice'](mockContexte);

        tick(DELAI_APPARITION_INDICE_SPECIAL);
        expect(mockCanvas.hidden).toEqual(false);
    }));
});
