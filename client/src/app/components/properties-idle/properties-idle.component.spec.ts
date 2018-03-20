import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesIdleComponent } from './properties-idle.component';

describe('PropertiesIdleComponent', () => {
  let component: PropertiesIdleComponent;
  let fixture: ComponentFixture<PropertiesIdleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesIdleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesIdleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
