import { Routes } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { VisitorRegisterEntryComponent } from './components/visitors/(no-hace-falta)visitor-register-entry/visitor-register-entry.component';
import { InformComponent } from './components/Inform/ReportToNeighbor/report-neighboor/inform.component';
import { EntryComponent } from './components/Entrys/entry/entry.component';

import { GeneralDashboardComponent } from './components/Dashboards/general-dashboard/general-dashboard.component';
import { RegistroComponent } from './components/Employee/registro/registro.component';
import { GlobalReportComponent } from './components/Inform/global-report/global-report.component';
import { EditComponent } from './components/visitors/edit/edit.component';
import { AccessContainerVisitorsRegistrationComponent } from './components/visitors/access_visitors_register/access-container-visitors-registration/access-container-visitors-registration.component';

export const routes: Routes = [
    { path: '', redirectTo: 'Inform', pathMatch: 'full' },
    { path: 'Visitors', component: VisitorRegistryComponent },
    { path: 'Inform', component: GlobalReportComponent },
    //{ path: 'entry', component: EntryComponent },
    { path: 'Dashboards', component: GeneralDashboardComponent },
    { path: 'Entry', component: RegistroComponent },
    { path: 'edit', component: EditComponent },
    { path: 'VisitorRegister', component: AccessContainerVisitorsRegistrationComponent }

];
