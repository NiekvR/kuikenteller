import {Injectable} from '@angular/core';
import {forkJoin, from, Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
// @ts-ignore
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import {getDownloadURL, listAll, ref, Storage, uploadBytes, ListResult} from '@angular/fire/storage';
import {deleteObject} from '@firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private storage: Storage) {
  }

  public upload(url: string, fileName: string): Observable<any> {
    return this.urlToFile(url, fileName).pipe(
      switchMap(file => {
        const storageRef = ref(this.storage, 'images/' + fileName);
        return from(uploadBytes(storageRef, file));
      }),
      switchMap(uploadResult => from(getDownloadURL(uploadResult.ref))));
  }

  public createZipOfAllImages() {
    const imagesDirRef = ref(this.storage, 'images/');

    from(listAll(imagesDirRef))
      .pipe(
        switchMap(listResult => this.getDownloadUrls(listResult)),
        switchMap(urls => this.downloadImages(urls))
      ).subscribe(blobs => this.createAndSaveImagesZip(blobs));
  }

  public deleteAllImages(): Observable<any> {
    const imagesDirRef = ref(this.storage, 'images/');

    return from(listAll(imagesDirRef))
      .pipe(tap(listResult => listResult.items.forEach(item => deleteObject(item))));
  }

  private getDownloadUrls(listResult: ListResult): Observable<string[]> {
    const dUrl = listResult.items.map(itemRef => from(getDownloadURL(itemRef)));
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
