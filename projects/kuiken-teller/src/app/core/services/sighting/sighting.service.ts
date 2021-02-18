import { Injectable } from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {Sighting} from '../../../models/sighting.model';
import {AngularFirestore, AngularFirestoreCollection, QueryFn} from '@angular/fire/firestore';
import {map, switchMap} from 'rxjs/operators';
import {ImageService} from '../image/image.service';
import firebase from 'firebase';
import DocumentData = firebase.firestore.DocumentData;

@Injectable({
  providedIn: 'root'
})
export class SightingService {
  private collection: AngularFirestoreCollection<Sighting>;

  constructor(private imageService: ImageService, private db: AngularFirestore) {
    this.collection = this.db.collection<Sighting>('sighting');
  }

  public add(sighting: Sighting): Observable<string> {
    const nextSighting = { ...sighting };
    nextSighting.photo = null;
    return this.addSighting(nextSighting)
      .pipe(switchMap(id => !!sighting.photo ? this.uploadSightingImage(nextSighting, sighting.photo, id) : of(id)));
  }

  public getAll(query?: QueryFn<DocumentData>): Observable<Sighting[]> {
    return this.db.collection<Sighting>('sighting', query).snapshotChanges().pipe(
      map(list => list.map(a => {
        let item = a.payload.doc.data() as Sighting;
        (item as any).waarnemingId = a.payload.doc.id;
        item = this.convertSighting(item);
        return item;
      })));
  }

  private addSighting(sighting: Sighting): Observable<string> {
    return from(this.collection.add(sighting)).pipe(
      map(doc => doc.id));
  }

  private uploadSightingImage(sighting: Sighting, base64: string, fileName: string): Observable<string> {
    return this.imageService.upload(base64, fileName +'.jpg')
      .pipe(
        switchMap(url => this.updateSightingWithPhotoUrl(fileName, sighting, url)),
        map(() => fileName));
  }

  private convertSighting(item: any): Sighting {
    item.sigthingDate = item.sigthingDate.toDate();
    return item;
  }

  private updateSightingWithPhotoUrl(id: string, sighting: Sighting, url): Observable<any> {
    sighting.photo = url;
    return from(this.collection.doc(id).update(sighting))
  }
}
