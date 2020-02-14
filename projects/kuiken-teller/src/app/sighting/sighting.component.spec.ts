/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SightingComponent } from './sighting.component';

describe('SightingComponent', () => {
  let component: SightingComponent;
  let fixture: ComponentFixture<SightingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SightingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SightingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
