import { Injectable } from '@angular/core';
import * as ExifReader from 'exifreader';
import {BehaviorSubject, fromEvent, Observable, of} from 'rxjs';
import {map, skip, switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompressImageService {
  private tiffDefault = 'image/tiff';
  private jpegDefault = 'image/jpeg';

  constructor() { }

  public compressAndRotateImageAsFile(file: File, width: number): Observable<File> {
    const fileName = file.name;

    return this.getImageAsCanvas(file, width)
      .pipe(switchMap(ctx => this.getImageAsFile(ctx, fileName)));
  }

  public compressAndRotateImageAsDataUrl(file: File, width: number): Observable<string> {
    return this.getImageAsCanvas(file, width)
      .pipe(map(ctx => this.getImageAsDataUrl(ctx)));
  }

  private getImageAsCanvas(file: File, width: number): Observable<CanvasRenderingContext2D> {
    return this.getImageAsString(file)
      .pipe(
        switchMap(image => this.getCompressedImage(image, width)));
  }

  private getImageAsString(file: File): Observable<string> {
    const fileReader = new FileReader();
    const fileReader$ = fromEvent(fileReader, 'load')
      .pipe(take(1), map(readerEvent => (readerEvent.target as any).result ));

    fileReader.readAsDataURL(file);

    return fileReader$;
  }

  private getCompressedImage(image: string, width: number): Observable<CanvasRenderingContext2D> {
    const img = new Image();
    const imgLoader$ = fromEvent(img, 'load')
      .pipe(take(1), map(() => {
        const scaleFactor = width / img.width;
        const height = img.height * scaleFactor;

        const ctx = this.getCanvas(width, height);

        ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
        return ctx;
      }));

    img.src = image;

    return imgLoader$;
  }

  private getImageAsFile(ctx: CanvasRenderingContext2D, fileName: string): Observable<File> {
    const fileSubject = new BehaviorSubject<File>(null);
    ctx.canvas.toBlob((blob) => {
      fileSubject.next(new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      }));
    },'image/jpeg', 1);

    return fileSubject.asObservable().pipe(skip(1), take(1));
  }

  private getImageAsDataUrl(ctx: CanvasRenderingContext2D): string {
    return ctx.canvas.toDataURL('image/jpeg', 1);
  }

  private getCanvas(width: number, height: number): CanvasRenderingContext2D  {
    const elem = document.createElement('canvas');
    const ctx = elem.getContext('2d');

    elem.width = width;
    elem.height = height;

    return ctx;
  }

  private rotateImage(ctx: CanvasRenderingContext2D, width: number, height: number, orientation: number) {
    switch (orientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height, width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }
  }

  private isTiffOrJpeg(file: File) {
    return file.type === this.jpegDefault || file.type === this.tiffDefault;
  }
}
