import {inject, Injectable} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {Sighting} from '../../../models/sighting.model';
import {map, switchMap} from 'rxjs/operators';
import {ImageService} from '../image/image.service';
import {
  collection,
  collectionData,
  Firestore,
  CollectionReference,
  addDoc,
  query,
  getDocs,
  doc,
  QueryDocumentSnapshot,
  updateDoc, orderBy, limit
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SightingService {
  private firestore: Firestore = inject(Firestore);
  private collection: CollectionReference<Sighting>;

  constructor(private imageService: ImageService) {
    this.collection = collection(this.firestore, 'sighting') as CollectionReference<Sighting>;
  }

  public add(sighting: Sighting): Observable<string> {
    const nextSighting = { ...sighting };
    nextSighting.photo = null;
    return this.addSighting(nextSighting)
      .pipe(switchMap(id => !!sighting.photo ? this.uploadSightingImage(nextSighting, sighting.photo, id) : of(id)));
  }

  public queryData(): Observable<Sighting[]> {
    return from(getDocs<Sighting>(query<Sighting>(this.collection, orderBy('uploadDate', 'desc'), limit(50))))
      .pipe(map(documents => documents.docs.map(document => this.convertDocToItem(document))))
  }

  public getAll(): Observable<Sighting[]> {
    return collectionData(this.collection, { idField: 'id' })
        .pipe(map(docData => docData.map(a => {
              a = this.convertSighting(a);
              return a;
            })));
  }

  private addSighting(sighting: Sighting): Observable<string> {
    return from(addDoc(this.collection, sighting)).pipe(
      map(document => document.id));
  }

  private uploadSightingImage(sighting: Sighting, base64: string, fileName: string): Observable<string> {
    return this.imageService.upload(base64, fileName +'.jpg')
      .pipe(
        switchMap(url => this.updateSightingWithPhotoUrl(fileName, sighting, url)),
        map(() => fileName));
  }

  protected convertDocToItem(document: QueryDocumentSnapshot<Sighting>): Sighting {
    let item = document.data() as Sighting;
    (item as any).id = (document as any).id;
    item = this.convertSighting(item);
    return item;
  }

  private convertSighting(item: any): Sighting {
    if(!!item.sigthingDate) {
      item.sigthingDate = item.sigthingDate.toDate();
    }
    return item;
  }

  private updateSightingWithPhotoUrl(id: string, sighting: Sighting, url): Observable<any> {
    sighting.photo = url;
    const docRef = doc<Sighting>(this.collection, id);
    return from(updateDoc<Sighting>(docRef, sighting));
  }
}
