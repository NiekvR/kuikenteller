import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SightingService} from '../../core/services/sighting/sighting.service';
import {Sighting} from '../../models/sighting.model';
import {from, ReplaySubject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import { Parser } from 'json2csv';
import {ImageService} from '../../core/services/image/image.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {limit, orderBy} from '@angular/fire/firestore';
import {Auth, signOut} from '@angular/fire/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  public sightings: Sighting[];

  public ages = {
    1: '0-1 week',
    2: '1-2 weken',
    3: '2-3 weken',
    4: '3-4 weken',
    5: '4-5 weken',
    6: '5-6 weken',
    7: '6-7 weken',
    8: '>7 weken'
  }

  public habitatTypes = {
    bsg: 'bebouwd',
    bebouwd: 'bebouwd',
    ag: 'agrarisch',
    agrarisch: 'agrarisch',
    nb: 'natuur',
    natuur: 'natuur'
  };

  public species = {
    mal: 'Wilde Eend',
    dom: 'Soepeend',
    kra: 'Krakeend'
  };

  public shore = {
    nno: 'Kaal',
    nlv: 'Lage veg',
    nhv: 'Hoge veg',
    emb: 'Kade',
    oth: 'Anders'
  };

  public water = {
    cle: 'Helder',
    tur: 'Troebel',
    wee: 'Kroos',
    oth: 'Anders'
  };

  public causeOfDeath = {
    pre: 'Predatie',
    agg: 'Agressie',
    hac: 'Mens',
    bon: 'Vogel',
    bre: 'Blauwe Reiger',
    zkr: 'Zwarte kraai',
    bui: 'Buizerd',
    zon: 'Zoogdier',
    hon: 'Hond',
    kat: 'Kat',
    rat: 'Rat',
    von: 'Vis',
    sno: 'Snoek',
    kar: 'Karper',
    nijl: 'Nijlgangs',
    mee: 'Meerkoet',
    aot: 'Agressie anders',
    ver: 'Verkeer',
    maa: 'Maaien',
    hot: 'Menselijke activiteit anders'
  };

  // @ts-ignore
  public fields = ['uploadDate', 'sigthingDate', 'id', 'species', 'numberOfChicks', 'observerName', 'observerEmail', 'gezinEerderGemeld', 'certaintyRecapture', 'remarks', 'lat', 'lng', 'age', 'permission', 'surface', 'shore', 'water', 'numberOfDeaths', 'causeOfDeath', 'extraFeedings'];

  public opts = { fields: this.fields }
  public subscription: Subscription;

  public dialogRef: MatDialogRef<any>;

  @ViewChild('modal', { read: TemplateRef }) modalTemplate:TemplateRef<any>;

  constructor(private sightingService: SightingService, public afAuth: Auth, private router: Router,
              private imageService: ImageService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.setSightings();
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if(this.dialogRef) {
      this.closeDialog();
    }
  }

  public signout() {
    from(signOut(this.afAuth))
      .subscribe(() => this.router.navigate([ '/login' ]));
  }

  public sightingsToCsv() {
    this.sightingService.getAll()
      .subscribe(sightings => {
        try {
          const parser = new Parser(this.opts);
          const csv = parser.parse(sightings);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url= window.URL.createObjectURL(blob);
          window.open(url);
        } catch (err) {
          console.error(err);
        }
      });
  }

  public getImagesZip() {
    this.imageService.createZipOfAllImages();
  }

  public deleteImagesModal() {
    this.dialogRef = this.dialog.open(this.modalTemplate, { width: '300px'});
  }

  public closeDialog() {
    this.dialogRef.close();
    this.dialogRef = null;
  }

  public deleteImages() {
    this.imageService.deleteAllImages()
      .subscribe(() => this.closeDialog());
  }

  private setSightings() {
    this.subscription = this.sightingService.queryData()
      .subscribe(sightings => {
        console.log(sightings);
        this.sightings = sightings
      });
  }

}
