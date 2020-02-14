import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot, UrlTree } from '@angular/router';
import { Preferences } from './models/preferences.nodel';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable()
export class PermissionGuardService implements CanActivate {

    constructor(private router: Router, private snackBar: MatSnackBar) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
      const preferences: Preferences = JSON.parse(localStorage.getItem('preferences'));

      if (!preferences || !preferences.permission) {
        this.snackBar.open('Om de applicatie te gebruiken moet u de voorwaarden hebben geaccepteerd.', null,{ duration: 5000 });

        this.router.navigate(['preferences']);
        return false;
      }

      return true;
    }

}
