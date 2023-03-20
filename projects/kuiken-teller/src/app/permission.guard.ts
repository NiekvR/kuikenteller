import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StorageService} from './core/services/storage/storage.service';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';


@Injectable()
export class PermissionGuardService {

  constructor(private router: Router, private snackBar: MatSnackBar, private storageService: StorageService) {
  }

  canActivate(): Observable<boolean> {
    return this.storageService.getPreferences()
      .pipe(
        map(preferences => !!preferences && preferences.permission),
        tap(permission => this.navigateToPreferences(permission)));
  }

  private navigateToPreferences(permission: boolean) {
    if(!permission) {
      this.snackBar.open('Om de applicatie te gebruiken moet u de voorwaarden hebben geaccepteerd.', null, {duration: 5000});

      this.router.navigate(['preferences']);
    }
  }

}
