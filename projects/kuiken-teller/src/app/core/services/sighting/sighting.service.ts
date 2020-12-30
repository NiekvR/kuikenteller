import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {Sighting} from '../../../models/sighting.model';
import {AngularFirestoreCollection} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SightingService {
  private collection: AngularFirestoreCollection<T>;

  constructor() { }

  public add(sighting: Sighting): Observable<any> {
    from(this.collection.add(sighting))
  }
}
