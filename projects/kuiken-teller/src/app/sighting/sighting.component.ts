import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import { Sighting } from '../models/sighting.model';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {debounce, debounceTime, filter, map, switchMap, tap} from 'rxjs/operators';
import { Preferences } from '../models/preferences.model';
import {BehaviorSubject, of} from 'rxjs';
import {StorageService} from '../core/services/storage/storage.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-sighting',
  templateUrl: './sighting.component.html',
  styleUrls: ['./sighting.component.scss']
})
export class SightingComponent implements OnInit, OnDestroy {
  public uploadedSightings: Sighting[] = [];
  public uploaded: Sighting[] = [];
  public sighting: Sighting;
  public sightingForm: FormGroup;
  public age = 1;
  public map: { zoom: number, position: Position } = { zoom: 15, position: { lat: 52.1008, lng: 5.2461 } };
  public marker: Position = {lat: null, lng: null};
  public base64textString: string;
  public getPosition = false;
  public defaultPosition: Position = { lat: 52.1008, lng: 5.2461 };
  public deaths = false;

  public species = [
    { name: 'Wilde eend', latin: 'Anas platyrhynchos', value: 'mal' },
    { name: 'Soepeend', latin: 'Anas platyrhynchos forma domesticus', value: 'dom' },
    { name: 'Krakeend', latin: 'Mareca strepera', value: 'gad' },
  ];

  public hide: { [index: number]: boolean } = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true
  };

  public currentStep = 1;
  public step: { [index: number]: {active: boolean, title: string } } = {
    1: { active: true, title: 'Nieuwe waarneming' },
    2: { active: false, title: 'Leeftijd' },
    3: { active: false, title: 'Habitat - optioneel' },
    4: { active: false, title: 'Sterfte - optioneel' },
    5: { active: false, title: 'Overig - optioneel' },
    6: { active: false, title: 'Locatie' },
    7: { active: false, title: 'Afbeelding' },
    8: { active: false, title: 'Opslaan' }
  };

  public maxDate = new Date(new Date().getTime() + 60*60*1000);
  public minDate = new Date(`01-01-${new Date().getFullYear()}`);

  public matcher = new MyErrorStateMatcher();
  public numberFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
  ]);

  private markerSet = false;
  private positionSubject = new BehaviorSubject<{lat: number, lng: number}>(null);

  constructor(private fb: FormBuilder, private router: Router, private snackBar: MatSnackBar, private route: ActivatedRoute,
              private el: ElementRef, private compressImageService: CompressImageService, private storageService: StorageService) { }

  ngOnInit() {
    this.initializeComponent();

    this.positionSubject.asObservable()
      .pipe(
        filter(latLng => !!latLng),
        debounceTime(250))
      .subscribe(latLng => this.setMapCenter(latLng.lat, latLng.lng));
  }

  ngOnDestroy() {
    this.positionSubject.complete();
  }

  public nextStep() {
    return this.step[7].active ? this.isUploaded() ? 'home' : 'opslaan' : this.currentStep + '/7';
  }

  public isDisabled() {
    return this.isUploaded() ?
      false :
      !this.sightingForm.valid ?
        !this.sightingForm.valid :
        this.currentStep === 6 && !this.getPosition;
  }

  next(step) {
    if (step === 0) {
      this.router.navigate(['']);
    } else if (this.sightingForm.valid || this.isUploaded()) {
      !!this.step[step - 1] ? this.step[step - 1].active = false : null;
      !!this.step[step + 1] ? this.step[step + 1].active = false : null;
      this.step[step].active = true;
      this.currentStep = step;

      if (step === 8) {
        if(!this.isUploaded()) {
          const newSighting: Sighting = this.sightingForm.value;
          newSighting.photo = !!this.base64textString ? this.base64textString : null;
          newSighting.causeOfDeath = this.setCauseOfDeath(newSighting);

          const saveSubscriptions = !!this.sighting ?
            this.storageService.updateSighting(newSighting) :
            this.storageService.saveSighting(newSighting);

          saveSubscriptions.subscribe(
            () => {
              this.snackBar.open('Waarneming opgeslagen', null, {duration: 3000});
              this.router.navigate(['']);
            },
            () => {
              this.snackBar.open('Er is iets fout gegaan bij het opslaan van de waarneming', null, {duration: 3000});
              this.next(7);
            });
        } else {
          this.router.navigate(['']);
        }
      }
    }
  }

  previewImage(event) {
    if(!this.isUploaded()) {
      const file = event.target.files[0];
      if (file) {
        this.sightingForm.patchValue({
          photo: event.target.files[0].name
        });

        const containerEl = this.el.nativeElement.querySelector('.container');

        console.log()
        this.compressImageService.compressAndRotateImageAsDataUrl(event.target.files[0], 800)
          .subscribe(base64 => this.base64textString = base64);
      }
    }
  }

  openImageSelector() {
    if(!this.isUploaded()) {
      const inputEl = this.el.nativeElement.querySelector('#image');
      inputEl.click();
    }
  };

  setAge(age) {
    if(!this.isUploaded()) {
      this.sightingForm.patchValue({age: age});
      this.age = age;
    }
  }

  mapClicked(position) {
    if(!this.isUploaded()) {
      this.markerSet = true;
      this.setMarker(position.coords.lat, position.coords.lng);
    }
  }

  getSpecies(val: string) {
    return this.species.find(spec => spec.value === val);
  }

  showOtherDeathReason() {
    return this.sightingForm.controls['deathReason'].value === 'oth' ||
      this.sightingForm.controls['aggression'].value === 'aot' ||
      this.sightingForm.controls['humanActivity'].value === 'hot' ||
      this.sightingForm.controls['predation'].value === 'pot'
  }

  toggleDeaths() {
    this.deaths = !this.deaths;
    if(!this.deaths) {
      this.sightingForm.controls['numberOfDeaths'].reset();
      this.sightingForm.controls['deathReason'].reset();
      this.sightingForm.controls['predation'].reset();
      this.sightingForm.controls['aggression'].reset();
      this.sightingForm.controls['humanActivity'].reset();
      this.sightingForm.controls['deathReasonOther'].reset();
    }
  }

  private getLocation() {
    this.setMapCenter(this.defaultPosition.lat, this.defaultPosition.lng, 7);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if(!this.markerSet) {
          this.setMapCenter(position.coords.latitude, position.coords.longitude, 15);
          this.setMarker(position.coords.latitude, position.coords.longitude);
        }
      },
      err => {
        this.snackBar.open('Het is niet mogelijk om uw huidige locatie op te halen', null, {duration: 3000})
      }
      ,{timeout:10000});
  }

  public resetLocationToYourLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setMapCenter(position.coords.latitude, position.coords.longitude, 15);
      },
      err => {
        this.snackBar.open('Het is niet mogelijk om uw huidige locatie op te halen', null, {duration: 3000})
      }
      ,{timeout:2000});
  }

  public setPosition(latLngEvent) {
    this.positionSubject.next(latLngEvent);
  }

  public isUploaded() {
    return !!this.sighting && this.sighting.uploaded;
  }

  private setMapCenter(lat, lng, zoom?) {
    this.map.position.lat = lat;
    this.map.position.lng = lng;
    if(!!zoom) {
      this.map.zoom = zoom
    }
    this.setMarker(lat, lng);
  }

  private setMarker(lat: number, lng: number) {
    this.getPosition = true;
    this.marker.lat = lat;
    this.marker.lng = lng;
    this.sightingForm.patchValue({
      lat: lat,
      lng: lng
    });
  }

  private setLocationFromSighting(sighting: Sighting) {
    this.setMapCenter(sighting.lat, sighting.lng);
    this.setMarker(sighting.lat, sighting.lng);
  }

  private setSighting() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        switchMap(id => !!id ? this.storageService.getSighting(+id) : of(null)),
        tap(sighting => !!sighting ? this.setLocationFromSighting(sighting) : this.getLocation()))
      .subscribe(sighting => {
        if(!!sighting) {
          this.sighting = sighting;
          this.formBuilderForSighting(this.sighting);
          this.base64textString = this.sighting.photo as string;
          this.age = parseInt(this.sighting.age);
        }
      })
  }

  private initializeComponent() {
    this.storageService.getPreferences()
      .pipe(
        map(preferences => this.sightingForm = this.formBuilderForNewSighting(preferences)),
        tap(() => this.setSighting()),
        switchMap(() => this.storageService.getUploadedSightings()),
        map(uploadedSightings => this.uploadedSightings = uploadedSightings),
        map(uploadedSightings => uploadedSightings.filter(sighting => sighting.uploaded && sighting.species === this.sightingForm.controls['species'].value)),
        map(uploadedSightings => uploadedSightings.sort((a: Sighting, b: Sighting) => new Date(b.sigthingDate).getTime() - new Date(a.sigthingDate).getTime())),
        map(uploadedSightings => this.uploaded = uploadedSightings),
        switchMap(() => this.sightingForm.controls['species'].valueChanges))
      .subscribe(() => this.uploaded = this.uploadedSightings
          .filter(sighting => sighting.uploaded && sighting.species === this.sightingForm.controls['species'].value)
          .sort((a: Sighting, b: Sighting) => new Date(b.sigthingDate).getTime() - new Date(a.sigthingDate).getTime()));
  }

  private formBuilderForNewSighting(preferences: Preferences): FormGroup {
    return this.fb.group({
      species: ['mal', [Validators.required]],
      sigthingDate: [new Date(), [Validators.required]],
      numberOfChicks: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      gezinEerderGemeld: [null],
      certaintyRecapture: [null],
      habitat: [null],
      remarks: [''],
      age: [this.age],
      lat: [null],
      lng: [null],
      photo: [null],
      permission: [preferences.permission],
      observerEmail: [preferences.observerEmail],
      observerName: [preferences.observerName],
      surface: [null],
      shore: [null],
      water: [null],
      numberOfDeaths: [null],
      deathReason: [null],
      predation: [null],
      aggression: [null],
      humanActivity: [null],
      deathReasonOther: [null],
      extraFeedings: [null],
      version: '2.0',
      localId: null
    });
  }

  private formBuilderForSighting(sighting: Sighting) {
    this.sightingForm.patchValue({
      species: sighting.species,
      sigthingDate: sighting.sigthingDate,
      numberOfChicks: sighting.numberOfChicks,
      gezinEerderGemeld: sighting.gezinEerderGemeld,
      certaintyRecapture: sighting.certaintyRecapture,
      habitat: sighting.habitat,
      remarks: sighting.remarks,
      age: sighting.age,
      photo: sighting.photo,
      permission: sighting.permission,
      observerEmail: sighting.observerEmail,
      observerName: sighting.observerName,
      surface: sighting.surface,
      shore: sighting.shore,
      water: sighting.water,
      numberOfDeaths: sighting.numberOfDeaths,
      deathReason: sighting.deathReason,
      predation: sighting.predation,
      aggression: sighting.aggression,
      humanActivity: sighting.humanActivity,
      deathReasonOther: sighting.deathReasonOther,
      extraFeedings: sighting.extraFeedings,
      localId: sighting.localId
    });

    this.deaths = sighting.numberOfDeaths > 0 || (!!sighting.causeOfDeath && sighting.causeOfDeath.length > 0);

    if(sighting.uploaded) {
      this.sightingForm.disable()
    }
  }

  private setCauseOfDeath(sighting: Sighting) {
    return this.getCauseOfDeath(sighting);
  }

  private getCauseOfDeath(sighting: Sighting) {
    let causeofDeath = null;
    switch (sighting.deathReason) {
      case 'pre': causeofDeath = sighting.predation; break;
      case 'agg': causeofDeath = sighting.aggression; break;
      case 'hac': causeofDeath = sighting.humanActivity; break;
    }
    causeofDeath = !!sighting.deathReasonOther && sighting.deathReasonOther.length > 0 ?
      sighting.deathReasonOther : causeofDeath;

    return !!causeofDeath && causeofDeath.length > 0 ? causeofDeath : sighting.deathReason;
  }
}

interface Position {
	lat: number;
	lng: number;
}
