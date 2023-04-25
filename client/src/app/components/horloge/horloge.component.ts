import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { COMPTEUR_SECONDE, DELAI_SECONDE, ModesJeu, VALEUR_MAX_COMPTE_A_REBOURS } from '@common/valeurs-par-defaut';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-horloge',
    templateUrl: './horloge.component.html',
    styleUrls: ['./horloge.component.scss'],
})
export class HorlogeComponent implements AfterViewInit, OnDestroy {
    @Input() finDePartie: Subject<void>;
    @Input() modificationDeTemps: Subject<number>;
    @Input() tempsDeReference: number;
    @Input() valeurCompteARebour: number;
    @Input() modeJeu?: ModesJeu;
    @Output() finCompteARebours: EventEmitter<null> = new EventEmitter<null>();
    @Output() incrementationTemps: EventEmitter<number> = new EventEmitter<number>();
    // public car utilisé dans le html
    tempsSecondes: number = 0;
    tempsMinutes: number = 0;

    private modifications: number = 0;
    private intervalleId: number;

    private abonnementFinDePartie: Subscription;
    private abonnementModificationDeTemps: Subscription;

    ngAfterViewInit(): void {
        if (this.modeJeu === ModesJeu.TempsLimite) this.faireDecompteTempsLimite();
        else this.faireDecompte();
        this.abonnerALaFinDePartie();
        this.abonnerAuxModificationsDeTemps();
    }
    ngOnDestroy(): void {
        if (this.abonnementFinDePartie) this.abonnementFinDePartie.unsubscribe();
        if (this.abonnementModificationDeTemps) this.abonnementModificationDeTemps.unsubscribe();
    }

    private calculerMinutes(): number {
        return Math.floor(this.calculerTempsEcoule() / COMPTEUR_SECONDE);
    }

    private calculerSecondes(): number {
        return Math.floor(this.calculerTempsEcoule() % COMPTEUR_SECONDE);
    }
    private calculerTempsEcoule(): number {
        const tempsActuel: number = Date.now();
        const differenceDeTemps: number = (tempsActuel - this.tempsDeReference) / DELAI_SECONDE + this.modifications;
        return differenceDeTemps;
    }

    private faireDecompte() {
        this.intervalleId = window.setInterval(() => {
            this.tempsSecondes = this.calculerSecondes();
            this.tempsMinutes = this.calculerMinutes();
            this.incrementationTemps.emit(this.tempsMinutes * COMPTEUR_SECONDE + this.tempsSecondes);
        }, DELAI_SECONDE);
    }

    private faireDecompteTempsLimite() {
        this.intervalleId = window.setInterval(() => {
            this.tempsMinutes = Math.max(Math.floor((this.valeurCompteARebour - this.calculerTempsEcoule()) / COMPTEUR_SECONDE), 0);
            this.tempsSecondes = Math.max(Math.floor((this.valeurCompteARebour - this.calculerTempsEcoule()) % COMPTEUR_SECONDE), 0);
            if (this.tempsSecondes <= 0 && this.tempsMinutes <= 0) {
                this.finCompteARebours.emit();
                clearInterval(this.intervalleId);
            }
        }, DELAI_SECONDE);
    }

    private trouverModificationPourDeuxMinutes(): number {
        return -VALEUR_MAX_COMPTE_A_REBOURS + this.valeurCompteARebour - (Date.now() - this.tempsDeReference) / DELAI_SECONDE;
    }

    private abonnerAuxModificationsDeTemps(): void {
        if (this.modificationDeTemps) {
            this.abonnementModificationDeTemps = this.modificationDeTemps.subscribe((modification) => {
                this.modifications = Math.max(this.modifications + modification, this.trouverModificationPourDeuxMinutes());
            });
        }
    }

    private abonnerALaFinDePartie(): void {
        if (this.finDePartie) {
            this.abonnementFinDePartie = this.finDePartie.subscribe(() => {
                clearInterval(this.intervalleId);
            });
        }
    }
}
