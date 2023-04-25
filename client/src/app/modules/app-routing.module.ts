import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreerPartieComponent } from '@app/components/salle-attente/creer-partie/creer-partie.component';
import { JoindrePartieComponent } from '@app/components/salle-attente/joindre-partie/joindre-partie.component';
import { SalleTempsLimiteComponent } from '@app/components/salle-attente/salle-temps-limite/salle-temps-limite/salle-temps-limite.component';
import { AcceuilComponent } from '@app/pages/acceuil/acceuil.component';
import { AdministrationComponent } from '@app/pages/administration/administration.component';
import { CreationJeuComponent } from '@app/pages/creation-jeu/creation-jeu.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ModeClassiqueComponent } from '@app/pages/mode-classique/mode-classique.component';
import { ModeTempsLimiteComponent } from '@app/pages/mode-temps-limite/mode-temps-limite.component';
import { VueJeuComponent } from '@app/pages/vue-jeu/vue-jeu.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: AcceuilComponent },
    // { path: 'game/:id', component: VueJeuComponent },
    { path: 'game', component: VueJeuComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'admin', component: AdministrationComponent },
    { path: 'limite', component: ModeTempsLimiteComponent },
    { path: 'classique', component: ModeClassiqueComponent },
    { path: 'creer-partie', component: CreerPartieComponent },
    { path: 'joindre-partie', component: JoindrePartieComponent },
    { path: 'salle-temps-limite', component: SalleTempsLimiteComponent },
    { path: 'creation-jeu', component: CreationJeuComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
