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

  public rotateImageAsFile(file: File): Observable<File> {
    const fileName = file.name;

    return this.getImageAsCanvas(file)
      .pipe(switchMap(ctx => this.getImageAsFile(ctx, fileName)));
  }

  public rotateImageAsDataUrl(file: File): Observable<string> {
    return this.getImageAsCanvas(file)
      .pipe(map(ctx => this.getImageAsDataUrl(ctx)));
  }

  private getImageAsCanvas(file: File, width?: number): Observable<CanvasRenderingContext2D> {
    return this.getImageOrientation(file)
      .pipe(
        switchMap(orientation => this.getImageAsString(file, orientation)),
        switchMap(result => !!width ?
          this.getCompressedImage(result.image, result.orientation, width) :
          this.getRotatedImage(result.image, result.orientation)));
  }

  private getImageOrientation(file: File): Observable<number> {
    let fileReader$;
    if(this.isTiffOrJpeg(file)) {
      const reader = new FileReader();
      fileReader$ = fromEvent(reader, 'load')
        .pipe(take(1), map(readerEvent => !!ExifReader.load((readerEvent.target as any).result)['Orientation'] ?
          ExifReader.load((readerEvent.target as any).result)['Orientation'].value : null));

      reader.readAsArrayBuffer(file);
    }

    return this.isTiffOrJpeg(file) ? fileReader$ : of(null);
  };

  private getImageAsString(file: File, orientation: number): Observable<{ image: string, orientation: number }> {
    const width = 500;
    // const fileName = e.target.files[0].name;
    const fileReader = new FileReader();
    const fileReader$ = fromEvent(fileReader, 'load')
      .pipe(take(1), map(readerEvent => { return { image: (readerEvent.target as any).result, orientation: orientation }}));

    fileReader.readAsDataURL(file);

    return fileReader$;
  }

  private getCompressedImage(image: string, orientation: number, width: number): Observable<CanvasRenderingContext2D> {
    const img = new Image();
    const imgLoader$ = fromEvent(img, 'load')
      .pipe(take(1), map(() => {
        const scaleFactor = width / img.width;
        const height = img.height * scaleFactor;

        const ctx = this.getCanvas(width, height, orientation);
        if(!!orientation) {
          this.rotateImage(ctx, width, height, orientation);
        }

        ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
        return ctx;
      }));

    img.src = image;

    return imgLoader$;
  }

  private getRotatedImage(image: string, orientation: number): Observable<CanvasRenderingContext2D> {
    const img = new Image();
    const imgLoader$ = fromEvent(img, 'load')
      .pipe(take(1), map(() => {
        const ctx = this.getCanvas(img.width, img.height, orientation);
        if(!!orientation) {
          this.rotateImage(ctx, img.width, img.height, orientation);
        }

        ctx.drawImage(img, 0, 0, img.width, img.height);
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

  private getCanvas(width: number, height: number, orientation: number): CanvasRenderingContext2D  {
    const elem = document.createElement('canvas');
    const ctx = elem.getContext('2d');

    if (4 < orientation && orientation < 9) {
      elem.width = height;
      elem.height = width;
    } else {
      elem.width = width;
      elem.height = height;
    }

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
