import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GestionSalleAttenteService } from '@app/services/gestion-salle-attente/gestion-salle-attente.service';

import { SalleTempsLimiteComponent } from './salle-temps-limite.component';

describe('SalleTempsLimiteComponent', () => {
    let component: SalleTempsLimiteComponent;
    let fixture: ComponentFixture<SalleTempsLimiteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            declarations: [SalleTempsLimiteComponent],
            providers: [GestionSalleAttenteService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(SalleTempsLimiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
