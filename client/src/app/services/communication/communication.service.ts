import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Message } from '@common/interface/message';
import { Vec2 } from '@common/interface/vec2';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    obtenirDifferencesRestantes(idSalle: string): Observable<Vec2[][]> {
        return this.http.get<Vec2[][]>(`${this.baseUrl}/jeux/differencesRestantes/${idSalle}`);
    }
    obtenirConstantesDeTempsDePartie(idSalle: string): Observable<ConstantesTempsJeux> {
        return this.http.get<ConstantesTempsJeux>(`${this.baseUrl}/jeux/Constantes/${idSalle}`);
    }
    obtenirTempsDeReferenceDePartie(idSalle: string): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/jeux/tempsDeDepart/${idSalle}`);
    }

    obtenirJeux(): Observable<InterfaceJeux[]> {
        return this.http.get<InterfaceJeux[]>(`${this.baseUrl}/jeux/ficheJeux`);
    }

    obtenirJeu(idJeu: number): Observable<InterfaceJeux> {
        return this.http.get<InterfaceJeux>(`${this.baseUrl}/jeux/${idJeu}`);
    }
    supprimerJeuDuServeur(idJeu: number) {
        return this.http.delete(`${this.baseUrl}/jeux/${idJeu}`);
    }

    envoyerJeuAuServeur(nouveauJeu: InterfaceJeux): Observable<InterfaceJeux> {
        return this.http.post<InterfaceJeux>(this.baseUrl + '/jeux/jeu', nouveauJeu);
    }

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/example/send`, message).pipe(catchError(this.handleError<void>('basicPost')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
