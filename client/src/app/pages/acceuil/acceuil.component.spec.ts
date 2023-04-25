import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AcceuilComponent } from '@app/pages/acceuil/acceuil.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('AcceuilComponent', () => {
    let component: AcceuilComponent;
    let fixture: ComponentFixture<AcceuilComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        // communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of());

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [AcceuilComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AcceuilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer', () => {
        expect(component).toBeTruthy();
    });
});
