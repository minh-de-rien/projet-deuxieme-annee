import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChampConstantesJeuComponent } from './champ-constantes-jeu.component';

describe('ChampConstantesJeuComponent', () => {
    let component: ChampConstantesJeuComponent;
    let fixture: ComponentFixture<ChampConstantesJeuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChampConstantesJeuComponent],
            imports: [MatSnackBarModule],
            providers: [{ provide: MatBottomSheetRef, useValue: {} }, FormBuilder],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ChampConstantesJeuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
