import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ZoneJeuComponent } from '@app/components/zone-jeu/zone-jeu.component';
import { ZoneMessagerieComponent } from '@app/components/zone-messagerie/zone-messagerie.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AcceuilComponent } from '@app/pages/acceuil/acceuil.component';
import { AppComponent } from '@app/pages/app/app.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { VueJeuComponent } from '@app/pages/vue-jeu/vue-jeu.component';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';
import { DialogAjouteNomJoueurComponent } from './components/dialog-ajoute-nom-joueur/dialog-ajoute-nom-joueur.component';
import { FenetreModaleComponent } from './components/fenetre-modale/fenetre-modale.component';
import { FicheJeuComponent } from './components/fiche-jeu/fiche-jeu.component';
import { HorlogeComponent } from './components/horloge/horloge.component';
import { MessageComponent } from './components/message/message.component';
import { NavigateurFichesComponent } from './components/navigateur-fiches/navigateur-fiches.component';
import { PaletteCouleurComponent } from './components/palette-couleur/palette-couleur.component';
import { CreerPartieComponent } from './components/salle-attente/creer-partie/creer-partie.component';
import { JoindrePartieComponent } from './components/salle-attente/joindre-partie/joindre-partie.component';
import { BarreNavigationComponent } from './components/support/barre-navigation/barre-navigation.component';
import { ChampConstantesJeuComponent } from './components/support/champ-constantes-jeu/champ-constantes-jeu.component';
import { ZoneDessinComponent } from './components/zone-dessin/zone-dessin.component';
import { AdministrationComponent } from './pages/administration/administration.component';
import { CreationJeuComponent } from './pages/creation-jeu/creation-jeu.component';
import { ModeClassiqueComponent } from './pages/mode-classique/mode-classique.component';
import { ModeTempsLimiteComponent } from './pages/mode-temps-limite/mode-temps-limite.component';
import { CreationJeuService } from './services/creation-jeu/creation-jeu.service';
import { DetectionDifferencesService } from './services/detection-differences/detection-differences.service';
import { ElargissementDifferencesService } from './services/detection-differences/elargissement-differences.service';
import { IdentificationDifferencesService } from './services/detection-differences/identification-differences.service';
import { RegroupementDifferencesService } from './services/detection-differences/regroupement-differences.service';
import { GestionPixelService } from './services/gestion-pixel/gestion-pixel.service';
import { GestionSocketClientService } from './services/gestion-socket-client/gestion-socket-client.service';
import { PileLIFOService } from './services/pile-lifo/pile-lifo.service';
import { SalleTempsLimiteComponent } from './components/salle-attente/salle-temps-limite/salle-temps-limite/salle-temps-limite.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        VueJeuComponent,
        AcceuilComponent,
        MaterialPageComponent,
        ZoneJeuComponent,
        ZoneMessagerieComponent,
        AdministrationComponent,
        ModeClassiqueComponent,
        ModeTempsLimiteComponent,
        FicheJeuComponent,
        CreationJeuComponent,
        NavigateurFichesComponent,
        BarreNavigationComponent,
        HorlogeComponent,
        DialogAjouteNomJoueurComponent,
        CreerPartieComponent,
        JoindrePartieComponent,
        ZoneDessinComponent,
        PaletteCouleurComponent,
        MessageComponent,
        ChampConstantesJeuComponent,
        FenetreModaleComponent,
        SalleTempsLimiteComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],
    providers: [
        CreationJeuService,
        HttpClient,
        DetectionDifferencesService,
        ElargissementDifferencesService,
        IdentificationDifferencesService,
        RegroupementDifferencesService,
        GestionPixelService,
        GestionSalleAttenteService,
        GestionSocketClientService,
        PileLIFOService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
