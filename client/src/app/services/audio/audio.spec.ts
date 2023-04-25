import { TestBed } from '@angular/core/testing';
import { UrlAudio } from '@common/valeurs-par-defaut';
import { AudioService } from './audio.service';

/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('AudioServiceService', () => {
    let service: AudioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioService);
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    it('jouerSonErreur() devrait appeler son()', () => {
        const joueurSonSpy = spyOn<any>(service, 'jouerSon');
        service.jouerSonErreur();
        expect(joueurSonSpy).toHaveBeenCalledWith(UrlAudio.Erreur);
    });

    it('jouerSonValidation() devrait appeler son()', () => {
        const joueurSonSpy = spyOn<any>(service, 'jouerSon');
        service.jouerSonValidation();
        expect(joueurSonSpy).toHaveBeenCalledWith(UrlAudio.Validation);
    });

    it('jouerSonClic() devrait appeler son()', () => {
        const joueurSonSpy = spyOn<any>(service, 'jouerSon');
        service.jouerSonClic();
        expect(joueurSonSpy).toHaveBeenCalledWith(UrlAudio.Clic);
    });

    // it("jouerSon() devrait faire un son d'erreur spécifique", (done) => {
    //     const mockAudio = new Audio();
    //     service['audio'] = mockAudio as HTMLAudioElement;

    //     const spy = spyOn(service['audio'], 'play').and.returnValue(Promise.resolve());

    //     service['jouerSon'](UrlAudio.Erreur);
    //     spy.calls.mostRecent().returnValue.then(() => {
    //         expect(service['audio'].play).toHaveBeenCalled();
    //         done();
    //     });
    // });
});
