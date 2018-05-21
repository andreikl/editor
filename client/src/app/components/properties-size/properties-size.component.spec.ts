import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesSizeComponent } from './properties-size.component';

describe('PropertiesSizeComponent', () => {
  let component: PropertiesSizeComponent;
  let fixture: ComponentFixture<PropertiesSizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesSizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
