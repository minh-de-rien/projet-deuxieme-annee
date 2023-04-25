import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DialogAjouteNomJoueurComponent } from './dialog-ajoute-nom-joueur.component';

describe('DialogAjouteNomJoueurComponent', () => {
    let component: DialogAjouteNomJoueurComponent;
    let fixture: ComponentFixture<DialogAjouteNomJoueurComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatFormFieldModule, MatInputModule, BrowserAnimationsModule],
            declarations: [DialogAjouteNomJoueurComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DialogAjouteNomJoueurComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
