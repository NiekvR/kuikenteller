import { Injectable } from '@angular/core';
import {Sighting} from '../../../models/sighting.model';
import {Preferences} from '../../../models/preferences.model';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {forkJoin, from, Observable} from 'rxjs';
import {filter, map, switchMap, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private SIGHTING_LIST = 'sightings';
  private PREFERENCES = 'preferences';

  constructor(private dbService: NgxIndexedDBService) {
    const sightings: Sighting[] = JSON.parse(localStorage.getItem(this.SIGHTING_LIST));
    if(!!sightings && sightings.length > 0) {
      sightings.forEach(sighting => this.saveSighting(sighting).subscribe());
    }
    localStorage.removeItem(this.SIGHTING_LIST);

    const preferences: Preferences = JSON.parse(localStorage.getItem(this.PREFERENCES));
    if(!!preferences) {
      this.updatePreferences(preferences).subscribe();
    }
    localStorage.removeItem(this.PREFERENCES);
    // this.clearSightingsFromEarlierYears();
  }

  public saveSighting(sighting: Sighting): Observable<Sighting> {
    delete sighting.localId;
    return this.dbService.add(this.SIGHTING_LIST, sighting);
  }

  public getSighting(id: number): Observable<Sighting> {
    return this.dbService.getByID<Sighting>(this.SIGHTING_LIST, id).pipe(filter(sighting => !!sighting));
  }

  public updateSighting(sighting: Sighting): Observable<any> {
    return from(this.dbService.update(this.SIGHTING_LIST, sighting));
  }

  public deleteSighting(id: number): Observable<any> {
    return from(this.dbService.delete(this.SIGHTING_LIST, id));
  }

  public getSightings(): Observable<Sighting[]> {
    return this.dbService.getAll<Sighting>(this.SIGHTING_LIST)
      .pipe(map(sightings => !!sightings && sightings.length > 0 ? sightings : []));
  }

  public getUploadedSightings(): Observable<Sighting[]> {
    return this.getSightings().pipe(map(sightings => sightings.filter(sighting => sighting.uploaded)));
  }

  public getSightingsToUpload(): Observable<Sighting[]> {
    return this.getSightings().pipe(map(sightings => sightings.filter(sighting => !sighting.uploaded)));
  }

  public updatePreferences(preferences: Preferences): Observable<Preferences> {
    preferences.id = 1;
    return this.dbService.update<Preferences>(this.PREFERENCES, preferences);
  }

  public getPreferences(): Observable<Preferences> {
    return this.dbService.getAll<Preferences>(this.PREFERENCES)
      .pipe(map(preferences => preferences.length > 0 ?
        preferences[0] :
        { observerEmail: null, observerName: null, permission: false } as Preferences))
  }

  public clearSightingsFromEarlierYears() {
    this.getSightings()
      .pipe(
        map(sightings => sightings
          .filter(sighting => new Date(sighting.sigthingDate).getTime() < new Date('2023-12-31').getTime())),
        switchMap(sightings => this.deleteAllSightings(sightings)))
      .subscribe();
  }

  private deleteAllSightings(sightings: Sighting[]): Observable<any[]> {
    return forkJoin(sightings.map(sighting => this.deleteSighting(sighting.localId)));
  }
}
