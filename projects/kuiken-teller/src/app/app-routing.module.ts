import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SightingComponent } from './sighting/sighting.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PermissionGuardService } from './permission.guard';
import { InstallGuideComponent } from './install-guide/install-guide.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [PermissionGuardService] },
  { path: 'sighting', component: SightingComponent, canActivate: [PermissionGuardService] },
  { path: 'sighting/:id', component: SightingComponent, canActivate: [PermissionGuardService] },
  { path: 'install-guide', component: InstallGuideComponent },
  { path: 'preferences', component: PreferencesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
