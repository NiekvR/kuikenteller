import { Injectable } from '@angular/core';
import {Sighting} from '../../../models/sighting.model';
import {Preferences} from '../../../models/preferences.model';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {from, Observable, of} from 'rxjs';
import {catchError, filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private SIGHTING_LIST = 'sightings';
  private PREFERENCES = 'preferences';

  constructor(private dbService: NgxIndexedDBService) {
    let sightings: Sighting[] = JSON.parse(localStorage.getItem(this.SIGHTING_LIST));
    if(!!sightings && sightings.length > 0) {
      sightings.forEach(sighting => this.saveSighting(sighting).subscribe());
    }
    localStorage.removeItem(this.SIGHTING_LIST);

    let preferences: Preferences = JSON.parse(localStorage.getItem(this.PREFERENCES));
    if(!!preferences) {
      this.updatePreferences(preferences).subscribe();
    }
    localStorage.removeItem(this.PREFERENCES);
  }

  public saveSighting(sighting: Sighting): Observable<number> {
    delete sighting.localId;
    console.log('SAVE', sighting);
    return from(this.dbService.add<Sighting>(this.SIGHTING_LIST, sighting));
  }

  public getSighting(id: number): Observable<Sighting> {
    return from(this.dbService.getByID<Sighting>(this.SIGHTING_LIST, id)).pipe(filter(sighting => !!sighting));
  }

  public updateSighting(sighting: Sighting): Observable<any> {
    console.log('UP', sighting);
    return from(this.dbService.update<Sighting>(this.SIGHTING_LIST, sighting));
  }

  public deleteSighting(id: number): Observable<any> {
    return from(this.dbService.delete(this.SIGHTING_LIST, id));
  }

  public getSightings(): Observable<Sighting[]> {
    return from(this.dbService.getAll<Sighting>(this.SIGHTING_LIST))
      .pipe(map(sightings => !!sightings && sightings.length > 0 ? sightings : []));
  }

  public getUploadedSightings(): Observable<Sighting[]> {
    return this.getSightings().pipe(map(sightings => sightings.filter(sighting => sighting.uploaded)));
  }

  public getSightingsToUpload(): Observable<Sighting[]> {
    return this.getSightings().pipe(map(sightings => sightings.filter(sighting => !sighting.uploaded)));
  }

  public updatePreferences(preferences: Preferences): Observable<number> {
    preferences.id = 1;
    return from(this.dbService.update<Preferences>(this.PREFERENCES, preferences));
  }

  public getPreferences(): Observable<Preferences> {
    return from(this.dbService.getAll<Preferences>(this.PREFERENCES))
      .pipe(map(preferences => preferences.length > 0 ?
        preferences[0] :
        { observerEmail: null, observerName: null, permission: false } as Preferences))
  }
}
