import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { ModeTempsLimiteComponent } from './mode-temps-limite.component';

describe('ModeTempsLimiteComponent', () => {
    let component: ModeTempsLimiteComponent;
    let fixture: ComponentFixture<ModeTempsLimiteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModeTempsLimiteComponent],
            imports: [RouterTestingModule, MatDialogModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ModeTempsLimiteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });
});
