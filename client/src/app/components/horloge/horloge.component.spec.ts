import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModesJeu } from '@common/valeurs-par-defaut';
import { Subject } from 'rxjs';
import { HorlogeComponent } from './horloge.component';

/* eslint @typescript-eslint/no-magic-numbers: "off"*/
/* eslint @typescript-eslint/no-explicit-any: "off"*/
describe('HorlogeComponent', () => {
    let component: HorlogeComponent;
    let fixture: ComponentFixture<HorlogeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HorlogeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HorlogeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // component.finDePartie = new Subject<void>();
        // component.modificationDeTemps = new Subject<number>();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit devrait appeler fairedecompte() en classique et fairedecomptetempslimite en temps limite', () => {
        component.modeJeu = ModesJeu.TempsLimite;
        spyOn<any>(component, 'faireDecompte');
        spyOn<any>(component, 'faireDecompteTempsLimite');
        spyOn<any>(component, 'abonnerALaFinDePartie');
        spyOn<any>(component, 'abonnerAuxModificationsDeTemps');
        component.ngAfterViewInit();
        expect(component['faireDecompteTempsLimite']).toHaveBeenCalled();
        expect(component['abonnerALaFinDePartie']).toHaveBeenCalled();
        expect(component['abonnerAuxModificationsDeTemps']).toHaveBeenCalled();
        component.modeJeu = ModesJeu.Classique;
        component.ngAfterViewInit();
        expect(component['faireDecompte']).toHaveBeenCalled();
        expect(component['abonnerALaFinDePartie']).toHaveBeenCalled();
        expect(component['abonnerAuxModificationsDeTemps']).toHaveBeenCalled();
    });

    it('calculerMinutes devrait retourner le nombre de minutes écoulés', () => {
        spyOn<any>(component, 'calculerTempsEcoule').and.returnValue(130);
        expect((component as any).calculerMinutes()).toEqual(2);
    });

    it('calculerSecondes devrait retourner le nombre de secondes écoulés', () => {
        spyOn<any>(component, 'calculerTempsEcoule').and.returnValue(130);
        expect((component as any).calculerSecondes()).toEqual(10);
    });

    it('calculertempsecoule devrait retourner le temps ecoulé depuis le début de la partie', () => {
        component.tempsDeReference = 20;
        spyOn(Date, 'now').and.returnValue(20);
        (component as any).modifications = 0;
        expect((component as any).calculerTempsEcoule()).toEqual(0);
    });

    it('faireDecompte devrait incrémenter le temps et emit la valeur du temps écoulé au component parent', fakeAsync(() => {
        spyOn<any>(component, 'calculerSecondes').and.returnValue(20);
        spyOn<any>(component, 'calculerMinutes').and.returnValue(1);
        spyOn(component.incrementationTemps, 'emit');
        (component as any).faireDecompte();
        tick(1000);
        clearInterval((component as any).intervalleId);
        expect(component.incrementationTemps.emit).toHaveBeenCalledWith(80);
    }));

    it('faireDecompteTempsLimite devrait décrémenter le temps et emit fincomptearebours au parent si le compte a rebours est a 0', fakeAsync(() => {
        const spyTemps = spyOn<any>(component, 'calculerTempsEcoule').and.returnValue(24);
        component.valeurCompteARebour = 25;
        (component as any).faireDecompteTempsLimite();
        tick(1000);
        expect(component.tempsMinutes).toEqual(0);
        expect(component.tempsSecondes).toEqual(1);
        spyTemps.calls.reset();
        spyTemps.and.returnValue(25);
        spyOn(component.finCompteARebours, 'emit');
        tick(1000);
        expect(component.tempsMinutes).toEqual(0);
        expect(component.tempsSecondes).toEqual(0);
        expect(component.finCompteARebours.emit).toHaveBeenCalled();
    }));

    it('trouverModificationPourDeuxMinutes devrait retourner la modification nécessaire à ajouter au temps écoulé pour obtenir 2 minutes', () => {
        component.tempsDeReference = 20;
        spyOn(Date, 'now').and.returnValue(20);
        component.valeurCompteARebour = 25;
        expect(Math.floor((component as any).trouverModificationPourDeuxMinutes())).toEqual(-95);
    });

    it("abonnerAuxModificationsDeTemps devrait subscribe à l'annonce d'une modification et modifier l'attribut", () => {
        component.modificationDeTemps = new Subject<number>();
        (component as any).modifications = 5;
        spyOn<any>(component as any, 'trouverModificationPourDeuxMinutes').and.returnValue(15);
        (component as any).abonnerAuxModificationsDeTemps();
        component.modificationDeTemps.next(20);
        expect((component as any).modifications).toEqual(25);
        (component as any).abonnementModificationDeTemps.unsubscribe();
    });

    it("abonneralafindepartie devrait subscribe à l'annonce d'une fin de partie et clear l'interval", () => {
        component.finDePartie = new Subject<void>();
        (component as any).intervalleId = 0;
        spyOn<any>(window, 'clearInterval');
        (component as any).abonnerALaFinDePartie();
        component.finDePartie.next();
        expect(window.clearInterval).toHaveBeenCalledWith(0);
        (component as any).abonnementFinDePartie.unsubscribe();
    });
});
