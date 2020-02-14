import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { Preferences } from '../models/preferences.nodel';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  public preferencesForm: FormGroup;
  public permissionError = false;
  public firstLogin = false;
  public support = false;
  public conditions = false;

  public hide: { [index: number]: boolean } = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true
  };

  public preferences: Preferences;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const support = this.route.snapshot.paramMap.get('support');
    if (support === 'true') {
      this.support = true;
    }

    this.preferences = JSON.parse(localStorage.getItem('preferences'));
    if(!this.preferences) {
      this.firstLogin = true;
    }

    this.preferencesForm = this.fb.group({
      observerEmail: [!!this.preferences ? this.preferences.observerEmail : null, [Validators.email]],
      permission: [!!this.preferences ? this.preferences.permission : false, [Validators.required]],
      observerName: [!!this.preferences ? this.preferences.observerName : null],
      numberOfChicks: [!!this.preferences ? this.preferences.numberOfChicks : null, [Validators.pattern("^[0-9]*$")]],
      habitat: [!!this.preferences ? this.preferences.habitat : null],
    });
  }

  public save() {
    this.preferences = this.preferencesForm.value;
    if(this.preferences.permission) {
      localStorage.setItem('preferences', JSON.stringify(this.preferences));
      this.back();
    } else {
      this.permissionError = true;
    }
  }

  public back() {
    this.router.navigate(['']);
  }

  public toggleConditions() {
    this.conditions = !this.conditions;
  }
}
