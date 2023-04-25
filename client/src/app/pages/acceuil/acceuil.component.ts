import { Component } from '@angular/core';
import { AudioService } from '@app/services/audio/audio.service';

@Component({
    selector: 'app-acceuil',
    templateUrl: './acceuil.component.html',
    styleUrls: ['./acceuil.component.scss'],
})
export class AcceuilComponent {
    constructor(readonly audioService: AudioService) {}
}
