import {BrowserModule} from '@angular/platform-browser';
import {NgModule, Injectable, LOCALE_ID, ErrorHandler} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AgmCoreModule} from '@agm/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DashboardComponent} from './dashboard/dashboard.component';

import {MaterialModule} from './material/material.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatCheckboxModule} from '@angular/material/checkbox';

import {SightingComponent} from './sighting/sighting.component';
import {SafePipe} from './sighting/safe.pipe';
import {MAT_DATE_LOCALE} from '@angular/material/core';
import {registerLocaleData} from '@angular/common';
import localeNl from '@angular/common/locales/nl-AW';
import {HttpClientModule} from '@angular/common/http';
import {PreferencesComponent} from './preferences/preferences.component';
import {PermissionGuardService} from './permission.guard';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {TernSupportModule} from '../../../tern-support/src/lib/tern-support.module';
import { InstallGuideComponent } from './install-guide/install-guide.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {GlobalErrorHandler} from './core/services/error/error.handler';
import {CoreModule} from './core/core.module';
import {APIKEY} from '../api-key';
import {LoginComponent} from './admin/login/login.component';
import {AdminComponent} from './admin/admin/admin.component';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getStorage, provideStorage} from '@angular/fire/storage';
import {OWL_DATE_TIME_LOCALE, OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule} from '@danielmoncada/angular-datetime-picker';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {MatDialogModule} from '@angular/material/dialog';

@Injectable()
export class DefaultIntl extends OwlDateTimeIntl {
  /** A label for the cancel button */
  cancelBtnLabel = 'Annuleren';

  /** A label for the set button */
  setBtnLabel = 'OK';
}

registerLocaleData(localeNl);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SightingComponent,
    SafePipe,
    PreferencesComponent,
    InstallGuideComponent,
    LoginComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: APIKEY
    }),
    HttpClientModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    TernSupportModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    CoreModule,
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'nl-AW'},
    {provide: MAT_DATE_LOCALE, useValue: 'nl-AW'},
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'nl-AW'},
    {provide: OwlDateTimeIntl, useClass: DefaultIntl},
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    PermissionGuardService,
    DeviceDetectorService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
