import {Injectable} from '@angular/core';
import {AngularFireStorage} from '@angular/fire/storage';
import {forkJoin, from, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
// @ts-ignore
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import firebase from 'firebase';
import ListResult = firebase.storage.ListResult;

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private storage: AngularFireStorage) {
  }

  public upload(url: string, fileName: string, metadata?: {}): Observable<any> {
    return this.urlToFile(url, fileName).pipe(
      switchMap(file => new Observable<string>(observer => {
        this.storage.upload('images/' + fileName, file, metadata).then(
          () => {
            const fileRef = this.storage.ref('images/' + fileName);
            fileRef.getMetadata().subscribe();
            fileRef.getDownloadURL()
              .subscribe((downloadUrl) => {
                observer.next(downloadUrl);
                observer.complete();
              });
          },
          (error) => console.log(error)
        );
      })));
  }

  public createZipOfAllImages() {
    const imagesDirRef = this.storage.storage.ref().child('/images');

    from(imagesDirRef.listAll())
      .pipe(
        switchMap(res => this.getDownloadUrls(res)),
        switchMap(urls => this.downloadImages(urls))
      ).subscribe(blobs => this.createAndSaveImagesZip(blobs));
  }

  public deleteAllImages(): Observable<any> {
    const imagesDirRef = this.storage.storage.ref().child('/images');

    return from(imagesDirRef.listAll())
      .pipe(tap(ref => ref.items.forEach(itemRef => itemRef.delete())));
  }

  public deleteImage(url: string): Observable<any> {
    return of(this.storage.storage.refFromURL(url).delete());
  }

  public downloadImage(url: string): Observable<any> {
    return from(this.storage.ref(url).getDownloadURL());
  }

  private getDownloadUrls(listResult: ListResult): Observable<string[]> {
    const dUrl = listResult.items.map(itemRef => from(itemRef.getDownloadURL()));
    return forkJoin(dUrl);
  }

  private downloadImages(urls: string[]): Observable<File[]> {
    const blobs: Observable<File>[] = urls.map(url => this.downloadDir(url))
    return forkJoin(blobs);
  }

  private urlToFile(url, filename): Observable<File> {
    return from(fetch(url)).pipe(
      switchMap((res: Response) => from(res.arrayBuffer())),
      map((buf: ArrayBuffer) => new File([buf], filename, {type: 'image/jpg'})));
  }

  private downloadDir(url: string): Observable<File> {
    return new Observable<File>(observer => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const blob = xhr.response;
        const fileName = this.getFileNameFromUrl(url);
        console.log(blob, fileName);
        observer.next(this.blobToFile(blob, fileName));
        observer.complete();
      };
      xhr.open('GET', url);
      xhr.send();
    });
  }

  private blobToFile = (theBlob: Blob, fileName: string): File => {
    const b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return theBlob as File;
  }

  private getFileNameFromUrl(url: string): string {
    return url.split('images%2F')[1].split('?alt')[0];
  }

  private createAndSaveImagesZip(images: File[]) {
    const zip = new JSZip();
    images.forEach(image => zip.file(image.name, image))
    zip.generateAsync({type: 'blob'}).then(content => {
      FileSaver.saveAs(content, `${new Date().toDateString()}_kuikenTeller_images.zip`);
    });
  }
}
