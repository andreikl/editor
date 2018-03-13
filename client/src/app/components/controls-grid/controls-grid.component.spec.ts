import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlsGridComponent } from './controls-grid.component';

describe('ControlsGridComponent', () => {
    let component: ControlsGridComponent;
    let fixture: ComponentFixture<ControlsGridComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ControlsGridComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ControlsGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
