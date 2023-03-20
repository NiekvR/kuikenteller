import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { Preferences } from '../models/preferences.model';
import {StorageService} from '../core/services/storage/storage.service';

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

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute,
              private storageService: StorageService) { }

  ngOnInit() {
    const support = this.route.snapshot.paramMap.get('support');
    if (support === 'true') {
      this.support = true;
    }

    this.preferencesForm = this.fb.group({
      observerEmail: [null, [Validators.email]],
      permission: [false, [Validators.required]],
      observerName: [null],
    });

    this.storageService.getPreferences()
      .subscribe(preferences => {
        this.preferences = preferences;
        if(!this.preferences.permission) {
          this.firstLogin = true;
        }
        this.preferencesForm = this.fb.group({
          observerEmail: [!!this.preferences ? this.preferences.observerEmail : null, [Validators.email]],
          permission: [!!this.preferences ? this.preferences.permission : false, [Validators.required]],
          observerName: [!!this.preferences ? this.preferences.observerName : null],
        });
      });
  }

  public save() {
    const newPreferences = this.preferencesForm.value;
    if(newPreferences.permission) {
      const save = !!this.preferences ?
        this.storageService.updatePreferences(this.preferences) :
        this.storageService.updatePreferences(newPreferences);

      save.subscribe(() => this.back());
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

  public goToInstallGuide() {
    this.router.navigate(['/install-guide']);
  }
}
