import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Sighting } from '../models/sighting.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DeviceDetectorService} from 'ngx-device-detector';
import {StorageService} from '../core/services/storage/storage.service';
import {map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {SightingService} from '../core/services/sighting/sighting.service';
import {CompressImageService} from '@ternwebdesign/compress-image';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private baseUrl = 'http://localhost:3000/api';
  private baseUrlServer = 'https://kuikens-app-test.herokuapp.com/api';
  private baseUrlProd = 'https://damp-sands-20336.herokuapp.com/api';
  private url: string;
  private test = false;
  private server = true;

  public sightings: Sighting[] = [];
  public uploaded: Sighting[] = [];

  private numberOfSightingsDone: number = null;
  public progress: number;
  public deletingSighting: Sighting;
  public loading = false;
  public isMobile = false;

  constructor(private router: Router, private sightingService: SightingService, private snackBar: MatSnackBar,
              private deviceService: DeviceDetectorService, private storageService: StorageService,
              private compressImageService: CompressImageService) {
    this.url = this.test ? this.server ? this.baseUrlServer : this.baseUrl : this.baseUrlProd;
  }

  ngOnInit() {
    this.setSightings();
    this.isMobile = this.deviceService.isMobile();
  }

  public addSighting(id?: number) {
    if(!!id) {
      this.router.navigate(['/sighting', id]);
    } else {
      this.router.navigate(['/sighting']);
    }
  }

  public goToPreferences() {
    this.router.navigate(['/preferences']);
  }

  public goToInstallGuide() {
    this.router.navigate(['/install-guide']);
  }

  public goToSupport() {
    this.router.navigate(['/preferences', { support: true}]);
  }

  public deleteSighting(sighting: Sighting) {
    this.deletingSighting = sighting;
  }

  public delete(accept: boolean) {
    if(accept) {
      this.storageService.deleteSighting(this.deletingSighting.localId).subscribe();
      this.setSightings();
    }
    this.deletingSighting = null;
  }

  public uploadSightings() {
    if(!this.loading) {
      this.loading = true;
      this.numberOfSightingsDone = 0;
      const sightingsToUpload = this.sightings.filter(sighting => !sighting.uploaded);
      sightingsToUpload.forEach((sighting, index) => {
        sighting.uploadDate = new Date().getTime();
        this.sightingService.add(sighting)
          .pipe(
            map(sightingId => {
              sighting.waarnemingId = sightingId;
              sighting.uploaded = true;
              return sighting;
            }),
            switchMap(uploadedSighting => !!uploadedSighting.photo ? this.compressImageOfUploadedSighting(uploadedSighting) : of(uploadedSighting)),
            switchMap(uploadedSighting => this.storageService.updateSighting(uploadedSighting))
          )
          .subscribe(
            () => {
              this.numberOfSightingsDone++;
              this.progress = this.numberOfSightingsDone / sightingsToUpload.length * 100;
              if (this.progress === 100) {
                this.loading = false;
                this.setSightings();
                this.numberOfSightingsDone = null;
                this.progress = 0;
                this.snackBar.open('Waarnemingen verstuurd', null, {duration: 3000})
              }
            },
            (error) => {
              console.error(error);
              this.numberOfSightingsDone++;
              this.loading = false;
              this.snackBar.open('Het versturen van de waarneming van ' + sighting.sigthingDate.toString() + ' is niet gelukt: ' + error, null, {duration: 5000});
            });
      });
    }
  }

  private setSightings() {
    this.storageService.getUploadedSightings()
      .pipe(map(sightings => sightings.sort((a: Sighting, b: Sighting) => new Date(b.sigthingDate).getTime() - new Date(a.sigthingDate).getTime())))
      .subscribe(sightings => this.uploaded = sightings);
    this.storageService.getSightingsToUpload()
      .pipe(map(sightings => sightings.sort((a: Sighting, b: Sighting) => new Date(b.sigthingDate).getTime() - new Date(a.sigthingDate).getTime())))
      .subscribe(sightings => this.sightings = sightings);
  }

  private compressImageOfUploadedSighting(sighting: Sighting): Observable<Sighting> {
    return this.compressImageService.compressAndRotateImageAsDataUrl(this.dataURLtoFile(sighting.photo, 'sighting.jpg'), 50)
      .pipe(map(image => {
        sighting.photo = image;
        return sighting;
      }));
  }

  private dataURLtoFile(dataurl, filename): File {

    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
  }

}
