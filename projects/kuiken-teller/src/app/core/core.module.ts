import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {DBConfig, NgxIndexedDBModule} from 'ngx-indexed-db';
import {StorageService} from './services/storage/storage.service';

const dbConfig: DBConfig  = {
  name: 'kuikenTellerDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'sightings',
      storeConfig: { keyPath: 'localId', autoIncrement: true },
      storeSchema: [
        { name: 'species', keypath: 'species', options: { unique: false } },
        { name: 'numberOfChicks', keypath: 'numberOfChicks', options: { unique: false } },
        { name: 'gezinEerderGemeld', keypath: 'gezinEerderGemeld', options: { unique: false } },
        { name: 'certaintyRecapture', keypath: 'certaintyRecapture', options: { unique: false } },
        { name: 'habitat', keypath: 'habitat', options: { unique: false } },
        { name: 'remarks', keypath: 'remarks', options: { unique: false } },
        { name: 'lat', keypath: 'lat', options: { unique: false } },
        { name: 'lng', keypath: 'lng', options: { unique: false } },
        { name: 'age', keypath: 'age', options: { unique: false } },
        { name: 'photo', keypath: 'photo', options: { unique: false } },
        { name: 'waarnemingId', keypath: 'waarnemingId', options: { unique: true } },
        { name: 'sigthingDate', keypath: 'sigthingDate', options: { unique: false } },
        { name: 'observerName', keypath: 'observerName', options: { unique: false } },
        { name: 'observerEmail', keypath: 'observerEmail', options: { unique: false } },
        { name: 'permission', keypath: 'permission', options: { unique: false } },
        { name: 'uploaded', keypath: 'uploaded', options: { unique: false } },
        { name: 'gezinEerderGemeldWithId', keypath: 'gezinEerderGemeldWithId', options: { unique: false } },
        { name: 'surface', keypath: 'surface', options: { unique: false } },
        { name: 'shore', keypath: 'shore', options: { unique: false } },
        { name: 'water', keypath: 'water', options: { unique: false } },
        { name: 'numberOfDeaths', keypath: 'numberOfDeaths', options: { unique: false } },
        { name: 'causeOfDeath', keypath: 'causeOfDeath', options: { unique: false } },
        { name: 'deathReason', keypath: 'deathReason', options: { unique: false } },
        { name: 'predation', keypath: 'predation', options: { unique: false } },
        { name: 'aggression', keypath: 'aggression', options: { unique: false } },
        { name: 'humanActivity', keypath: 'humanActivity', options: { unique: false } },
        { name: 'deathReasonOther', keypath: 'deathReasonOther', options: { unique: false } },
        { name: 'extraFeedings', keypath: 'extraFeedings', options: { unique: false } }
      ]
    },
    {
      store: 'preferences',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'observerName', keypath: 'observerName', options: { unique: true } },
        { name: 'observerEmail', keypath: 'observerEmail', options: { unique: true } },
        { name: 'permission', keypath: 'permission', options: { unique: false } }
      ]
    }
  ]
};

@NgModule({
  providers: [
    StorageService
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxIndexedDBModule.forRoot(dbConfig)
  ],
  exports: [
    NgxIndexedDBModule
  ]
})
export class CoreModule { }
