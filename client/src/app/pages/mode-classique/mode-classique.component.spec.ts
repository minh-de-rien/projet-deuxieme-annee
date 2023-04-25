import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeClassiqueComponent } from './mode-classique.component';

describe('ModeClassiqueComponent', () => {
    let component: ModeClassiqueComponent;
    let fixture: ComponentFixture<ModeClassiqueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModeClassiqueComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ModeClassiqueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
