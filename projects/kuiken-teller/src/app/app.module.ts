import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
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
import {OWL_DATE_TIME_LOCALE, OwlDateTimeIntl, OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {TernSupportModule} from '../../../tern-support/src/lib/tern-support.module';
import {AngularFireModule} from '@angular/fire';
import {AngularFirePerformanceModule} from '@angular/fire/performance';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

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
    PreferencesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyC5eDItm0yolchF4-WqFd_9uZ_PNcjw0VQ'
    }),
    HttpClientModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    TernSupportModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirePerformanceModule,
    AngularFireAnalyticsModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'nl-NL'},
    {provide: OWL_DATE_TIME_LOCALE, useValue: 'nl-NL'},
    {provide: OwlDateTimeIntl, useClass: DefaultIntl},
    PermissionGuardService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
