import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Message } from '@common/interface/message';
import { Vec2 } from '@common/interface/vec2';

/* eslint @typescript-eslint/no-magic-numbers: "off" */
/* eslint @typescript-eslint/dot-notation: "off" */
/* eslint @typescript-eslint/no-empty-function: "off" */
const SCORE = [
    { nomJoueur: 'Pol Malone1', temps: 420 },
    { nomJoueur: 'LePujanJames1', temps: 6969 },
    { nomJoueur: 'Mr Worldwide1', temps: 9235 },
];

const jeuTest: InterfaceJeux = {
    id: 0,
    nom: 'jeux test 1',
    meilleursTempsSolo: SCORE,
    meilleursTemps1v1: SCORE,
    imgOriginale: 'urlImageOriginale',
    imgModifiee: 'urlImageModifiee',
    nombreDifferences: 3,
};

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it("devrait récupérer les différences restantes d'une partie", () => {
        const differencesAttendues: Vec2[][] = [[{ x: 0, y: 2 }]];

        service.obtenirDifferencesRestantes('0').subscribe({
            next: (contenu) => expect(contenu).toEqual(differencesAttendues),
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/jeux/differencesRestantes/0`);
        expect(req.request.method).toBe('GET');
        req.flush(differencesAttendues);
    });

    it('devrait récupérer tous les jeux attendus dans le serveur', () => {
        const jeuxAttendus: InterfaceJeux[] = [jeuTest, jeuTest];

        service.obtenirJeux().subscribe({
            next: (contenu) => expect(contenu).toEqual(jeuxAttendus),
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/jeux/ficheJeux`);
        expect(req.request.method).toBe('GET');
        req.flush(jeuxAttendus);
    });

    it('devrait récupérer le jeu attendu en fonction du id', () => {
        service.obtenirJeu(0).subscribe({
            next: (contenu) => expect(contenu).toEqual(jeuTest),
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/jeux/0`);
        expect(req.request.method).toBe('GET');
        req.flush(jeuTest);
    });

    it('devrait récupérer le jeu attendu en fonction du id', () => {
        service.supprimerJeuDuServeur(0).subscribe({
            next: (contenu) => expect(contenu).toEqual(jeuTest),
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/jeux/0`);
        expect(req.request.method).toBe('DELETE');
        req.flush(jeuTest);
    });

    it('envoyerAuServeur() devrait bien envoyer un jeu au serveur avec un POST', () => {
        service.envoyerJeuAuServeur(jeuTest).subscribe({
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/jeux/jeu`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toBe(jeuTest);

        req.flush(jeuTest);
    });

    it('ne devrait envoyer aucun message en envoyant un POST (HttpClient called once)', () => {
        const sentMessage: Message = { destinateur: jeuTest, contenu: 'Hello World' };

        service.basicPost(sentMessage).subscribe({
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');

        req.flush(sentMessage);
    });

    it('devrait traiter les erreurs http', () => {
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    // it('verifierDifference() devrait retourner ', () => {
    //     const coordTest: Vec2[] = [
    //         { x: 1, y: 2 },
    //         { x: 2, y: 3 },
    //         { x: 3, y: 4 },
    //     ];
    //     service.verifierDifference(1, 3).subscribe({
    //         next: (contenu) => expect(contenu).toEqual(coordTest),
    //         error: fail,
    //     });
    //     const req = httpMock.expectOne(`${baseUrl}/jeux/difference/${1}/${3}`);
    //     expect(req.request.method).toBe('GET');
    //     req.flush(coordTest);
    // });
});
