import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionConfigurationsComponent } from './option-configurations.component';

describe('OptionConfigurationsComponent', () => {
  let component: OptionConfigurationsComponent;
  let fixture: ComponentFixture<OptionConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionConfigurationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
