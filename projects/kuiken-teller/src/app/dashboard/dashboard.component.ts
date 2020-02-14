import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Sighting } from '../models/sighting.model';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  public allSightings: Sighting[] = [];
  public sightings: Sighting[] = [];
  public uploaded: Sighting[] = [];

  private numberOfSightingsDone: number = null;
  public progress: number;
  public deletingSighting: Sighting;
  public loading = false;

  constructor(private router: Router, private http: HttpClient, private snackBar: MatSnackBar) {
    this.url = this.test ? this.server ? this.baseUrlServer : this.baseUrl : this.baseUrlProd;
  }

  ngOnInit() {
    this.setSightings();
  }

  public addSighting(id?: string) {
    if(!!id) {
      this.router.navigate(['/sighting', id]);
    } else {
      this.router.navigate(['/sighting']);
    }
  }

  public goToPreferences() {
    this.router.navigate(['/preferences']);
  }

  public goToSupport() {
    this.router.navigate(['/preferences', { support: true}]);
  }

  public deleteSighting(sighting: Sighting) {
    this.deletingSighting = sighting;
  }

  public delete(accept: boolean) {
    if(accept) {
      const index = this.allSightings.findIndex(sighting => sighting.sigthingDate === this.deletingSighting.sigthingDate);
      this.allSightings.splice(index, 1);
      localStorage.setItem('sightinglist', JSON.stringify(this.allSightings));
      this.sightings = this.allSightings.filter(sighting => !sighting.uploaded);
      this.uploaded = this.allSightings.filter(sighting => sighting.uploaded);
    }
    this.deletingSighting = null;
  }

  public uploadSightings() {
    if(!this.loading) {
      this.loading = true;
      this.numberOfSightingsDone = 0;
      const sightingsAtStart = this.sightings;
      const sightingsToUpload = this.sightings.filter(sighting => !sighting.uploaded);
      sightingsToUpload.forEach((sighting, index) => {
        this.http.post(this.url + '/sighting', {sighting: sighting})
          .subscribe(
            (testSighting: Sighting) => {
              sighting.waarnemingId = testSighting.waarnemingId;
              sighting.uploaded = true;
              sightingsAtStart[index] = sighting;
              localStorage.setItem('sightinglist', JSON.stringify(sightingsAtStart.concat(this.uploaded)));
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
              this.numberOfSightingsDone++;
              this.loading = false;
              this.snackBar.open('Het versturen van de waarneming van ' + sighting.sigthingDate.toString() + ' is niet gelukt: ' + error.error.message, null, {duration: 5000});
            });
      });
    }
  }

  private setSightings() {
    let data = localStorage.getItem('sightinglist');
    if(data) {
      this.allSightings = JSON.parse(data);
      this.sightings = this.allSightings.filter(sighting => !sighting.uploaded);
      this.uploaded = this.allSightings.filter(sighting => sighting.uploaded);
    }
  }

}
