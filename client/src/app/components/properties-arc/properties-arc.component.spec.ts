import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesArcComponent } from './properties-arc.component';

describe('PanelArcComponent', () => {
  let component: PropertiesArcComponent;
  let fixture: ComponentFixture<PropertiesArcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesArcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesArcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
