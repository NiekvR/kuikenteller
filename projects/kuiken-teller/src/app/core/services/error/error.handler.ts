import {ErrorHandler, Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {StorageService} from '../storage/storage.service';
import {map, switchMap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class GlobalErrorHandler implements ErrorHandler{
  constructor(private http: HttpClient, private storageService: StorageService) {}

  handleError(error: Error) {
    environment.production ?
      this.sendFeedback(error) :
      this.handleDebugError(error);
  }

  private sendFeedback(err: Error) {
    this.storageService.getPreferences()
      .pipe(map(preferences => (
          {
            user: preferences.observerEmail,
            date: new Date(),
            type: err.name,
            description: err.message,
            stacktrace: err.stack,
            project: 'ekt'
          } as Exception)),
        switchMap(exception => this.http.post('https://tern-support.firebaseapp.com/api/v1/log/error', exception, {responseType: 'text'})))
      .subscribe(() => console.log('Error logged, contact support!'));
  }

  private handleDebugError(err: Error) {
    console.error(err);
  }
}

interface Exception {
  user: string,
  date: Date,
  type: string,
  description: string,
  stacktrace: string,
  project: string
}
