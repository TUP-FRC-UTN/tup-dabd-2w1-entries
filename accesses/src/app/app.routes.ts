import { Routes } from '@angular/router';
import { AccessContainerVisitorsRegistrationComponent } from './components/access_visitors/access_visitors_register/access-container-visitors-registration/access-container-visitors-registration.component';
import { AccessVisitorRegistryComponent } from './components/access_visitors/access-visitor-registry/access-visitor-registry.component';
import { AccessGlobalReportComponent } from './components/access_reports/access-global-report/access-global-report.component';
import { AccessGeneralDashboardComponent } from './components/access_dashboards/access-general-dashboard/access-general-dashboard.component';
import { AccessDailyFetchComponent } from './components/access_entrys/access-daily-fetch/access-daily-fetch.component';
import { AccessEntryComponent } from './components/access_entrys/access-entry/access-entry.component';

import { AccessContainerVisitorsEditComponent } from './components/access_visitors/access-edit/access-container-visitors-edit/access-container-visitors-edit.component';
import { AccessDashboardEgressComponent } from './components/access_dashboards/access_dashboard_egress/access-dashboard-egress-container/access-dashboard-egress.component';
import { AccessVehiclesViewComponent } from './components/access_vehicles-register/access-vehicles-view/access-vehicles-view.component';
import { DashboardPruebaComponent } from './components/access_dashboards/dashboard-prueba/dashboard-prueba.component';
import { DashboardComponent } from 'angular-google-charts';


export const routes: Routes = [
    { path: '', redirectTo: 'reports', pathMatch: 'full' },
    { path: 'visitors', component: AccessVisitorRegistryComponent },
    { path: 'reports', component: AccessGlobalReportComponent },
    { path: 'entry', component: AccessEntryComponent },
    { path: 'dashboards', component: DashboardPruebaComponent },
    { path: 'dashboards1', component: AccessGeneralDashboardComponent },

    { path: 'entry', component: AccessDailyFetchComponent },
    { path: 'edit', component: AccessContainerVisitorsEditComponent },
    { path: 'visitor/register', component: AccessContainerVisitorsRegistrationComponent },
    {path:'dasboard-egress', component:AccessDashboardEgressComponent},
    {path: 'vehicleAdd', component: AccessVehiclesViewComponent}

];
