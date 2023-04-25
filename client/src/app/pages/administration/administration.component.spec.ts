import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { AdministrationComponent } from './administration.component';

describe('AdministrationComponent', () => {
    let component: AdministrationComponent;
    let fixture: ComponentFixture<AdministrationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdministrationComponent],
            providers: [
                { provide: MatBottomSheet, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(AdministrationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
