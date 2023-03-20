import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SightingComponent } from './sighting/sighting.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PermissionGuardService } from './permission.guard';
import { InstallGuideComponent } from './install-guide/install-guide.component';
import {LoginComponent} from './admin/login/login.component';
import {AdminComponent} from './admin/admin/admin.component';
import {AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToAdmin = () => redirectLoggedInTo(['admin']);

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [PermissionGuardService] },
  { path: 'sighting', component: SightingComponent, canActivate: [PermissionGuardService] },
  { path: 'sighting/:id', component: SightingComponent, canActivate: [PermissionGuardService] },
  { path: 'install-guide', component: InstallGuideComponent },
  { path: 'preferences', component: PreferencesComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { authGuardPipe: redirectLoggedInToAdmin } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
