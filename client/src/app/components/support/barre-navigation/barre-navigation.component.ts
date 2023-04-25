import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AudioService } from '@app/services/audio/audio.service';
import { TITRE_PAGE_CREATION_JEU } from '@common/valeurs-par-defaut';

@Component({
    selector: 'app-barre-navigation',
    templateUrl: './barre-navigation.component.html',
    styleUrls: ['./barre-navigation.component.scss'],
})
export class BarreNavigationComponent {
    @Input() titreDePage: string;
    @ViewChild('texteRetour') private texteRetour: ElementRef<HTMLSpanElement>;

    constructor(readonly audioService: AudioService) {}

    boutonRetourInactif(): boolean {
        return this.titreDePage !== TITRE_PAGE_CREATION_JEU;
    }
    apparitionTexteRetour() {
        this.texteRetour.nativeElement.style.visibility = 'visible';
    }
    enleverTexteRetour() {
        this.texteRetour.nativeElement.style.visibility = 'hidden';
    }
}
