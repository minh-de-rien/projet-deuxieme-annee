import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GestionSocketClientService } from '@app/services/gestion-socket-client/gestion-socket-client.service';
import { MessageConfigTemps } from '@common/enum/message-configuration-temps';
import { MessageSnackBar } from '@common/enum/message-snack-bar';
import { SocketEvenements } from '@common/enum/socket.gateway.events';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { DUREE_SNACK_BAR } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-champ-constantes-jeu',
    templateUrl: './champ-constantes-jeu.component.html',
    styleUrls: ['./champ-constantes-jeu.component.scss'],
})
export class ChampConstantesJeuComponent implements OnInit {
    /* Attributs public car utilisé dans le html*/
    formulaire: FormGroup;
    tempsJeux: ConstantesTempsJeux;

    readonly messageConfigTemps = MessageConfigTemps;

    // eslint-disable-next-line max-params
    constructor(
        private readonly champBasFenetreRef: MatBottomSheetRef<ChampConstantesJeuComponent>,
        private readonly constructeurDeFormulaire: FormBuilder,
        private readonly socketService: GestionSocketClientService,
        private readonly snackBar: MatSnackBar,
    ) {
        this.tempsJeux = { compteARebours: 0, penalite: 0, gain: 0 };
    }

    ngOnInit() {
        this.abonnerAuSocketDemandeConstantesTempsJeux();
        this.creerFormulaire();
        this.abonnerAuSocketEnvoiConstantesTempsJeux();
    }

    verifierLaValiditeDesValeursDuFormulaire() {
        if (this.aucuneValeurEntree()) this.ouvrirSnackBar(MessageSnackBar.AucuneValeurDetectee, '');
        else if (this.formulaire.valid && this.valeursFormulaireOntChangees()) {
            this.sauvegarderConstantes();
            this.ouvrirSnackBar(MessageSnackBar.ChangementsEnregistres, '');
        } else if (!this.valeursFormulaireOntChangees()) this.ouvrirSnackBar(MessageSnackBar.ValeursPasChangees, '');
        else this.ouvrirSnackBar(MessageSnackBar.ChangementsPasEnregistres, '');
    }

    reinitialiserConstantes(): void {
        this.socketService.send(SocketEvenements.ReinitialisationConstantesTempsJeux);
        this.ouvrirSnackBar(MessageSnackBar.TempsReinitialises, '');
    }

    fermerChampBasFenetre(event: MouseEvent): void {
        this.champBasFenetreRef.dismiss();
        event.preventDefault();
    }

    private creerFormulaire() {
        this.formulaire = this.constructeurDeFormulaire.group({
            tempsCompteARebours: null,
            tempsPenalite: null,
            tempsGain: null,
        });
    }

    private initialiserTempsJeuxAvecValeursFormulaire(): void {
        this.tempsJeux.compteARebours =
            this.formulaire.value.tempsCompteARebours !== null ? this.formulaire.value.tempsCompteARebours : this.tempsJeux.compteARebours;
        this.tempsJeux.penalite = this.formulaire.value.tempsPenalite !== null ? this.formulaire.value.tempsPenalite : this.tempsJeux.penalite;
        this.tempsJeux.gain = this.formulaire.value.tempsGain !== null ? this.formulaire.value.tempsGain : this.tempsJeux.gain;
    }

    private sauvegarderConstantes(): void {
        this.initialiserTempsJeuxAvecValeursFormulaire();
        this.socketService.send(SocketEvenements.MiseAJourConstantesTempsJeux, this.tempsJeux);
    }

    private valeursFormulaireOntChangees(): boolean {
        return (
            this.formulaire.value.tempsCompteARebours !== this.tempsJeux.compteARebours ||
            this.formulaire.value.tempsPenalite !== this.tempsJeux.penalite ||
            this.formulaire.value.tempsGain !== this.tempsJeux.gain
        );
    }

    private aucuneValeurEntree(): boolean {
        return (
            this.formulaire.value.tempsCompteARebours === null &&
            this.formulaire.value.tempsPenalite === null &&
            this.formulaire.value.tempsGain === null
        );
    }

    private abonnerAuSocketEnvoiConstantesTempsJeux(): void {
        this.socketService.on(SocketEvenements.EnvoiConstantesTempsJeux, (donnee: ConstantesTempsJeux) => {
            this.tempsJeux = donnee;
        });
    }

    private abonnerAuSocketDemandeConstantesTempsJeux(): void {
        this.socketService.send(SocketEvenements.DemandeConstantesTempsJeux);
    }

    private ouvrirSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: DUREE_SNACK_BAR,
        });
    }
}
