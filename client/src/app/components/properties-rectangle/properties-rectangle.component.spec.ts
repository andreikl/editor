import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesRectangleComponent } from './properties-rectangle.component';

describe('PropertiesRectangleComponent', () => {
  let component: PropertiesRectangleComponent;
  let fixture: ComponentFixture<PropertiesRectangleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesRectangleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesRectangleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
