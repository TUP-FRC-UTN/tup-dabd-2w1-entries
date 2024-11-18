import { Routes } from '@angular/router';
import { AccessContainerVisitorsRegistrationComponent } from './components/access_visitors/access_visitors_register/access-container-visitors-registration/access-container-visitors-registration.component';
import { AccessVisitorRegistryComponent } from './components/access_visitors/access-visitor-registry/access-visitor-registry.component';
import { AccessGlobalReportComponent } from './components/access_reports/access-global-report/access-global-report.component';
import { AccessDailyFetchComponent } from './components/access_entrys/access-daily-fetch/access-daily-fetch.component';
import { AccessEntryComponent } from './components/access_entrys/access-entry/access-entry.component';

import { AccessContainerVisitorsEditComponent } from './components/access_visitors/access-edit/access-container-visitors-edit/access-container-visitors-edit.component';
import { AccessVehiclesViewComponent } from './components/access_vehicles-register/access-vehicles-view/access-vehicles-view.component';
import { DashboardComponent } from 'angular-google-charts';
import { MetricsComponent } from './components/access_dashboards/metric-dashboard/metrics/metrics.component';
import { AccessEditComponent } from './components/visitors/edit/access-edit.component';


export const routes: Routes = [
    { path: '', redirectTo: 'reports', pathMatch: 'full' },
    { path: 'visitors', component: AccessVisitorRegistryComponent },
    { path: 'reports', component: AccessGlobalReportComponent },
    { path: 'entry', component: AccessEntryComponent },
    { path: 'dashboards', component: MetricsComponent },
    { path: 'entry', component: AccessDailyFetchComponent },
    { path: 'edit', component: AccessContainerVisitorsEditComponent },
    { path: 'visitor/register', component: AccessContainerVisitorsRegistrationComponent },
    {path: 'vehicleAdd', component: AccessVehiclesViewComponent},
    {path: 'edit_viejito', component: AccessEditComponent}

];
