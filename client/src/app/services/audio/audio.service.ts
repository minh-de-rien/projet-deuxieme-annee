import { Injectable } from '@angular/core';
import { UrlAudio } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private audio: HTMLAudioElement;

    constructor() {
        this.preTelechargerTousLesAudios();
    }

    jouerSonErreur(): void {
        this.jouerSon(UrlAudio.Erreur);
    }

    jouerSonValidation(): void {
        this.jouerSon(UrlAudio.Validation);
    }

    jouerSonClic(): void {
        this.jouerSon(UrlAudio.Clic);
    }

    private jouerSon(src: string): void {
        this.audio.src = src;
        this.audio.play();
    }

    private async preTelechargerAudio(url: string) {
        this.audio = new Audio();
        this.audio.src = url;
    }

    private preTelechargerTousLesAudios() {
        Object.values(UrlAudio).map(async (audio) => await this.preTelechargerAudio(audio));
    }
}
