import { Routes } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { InformComponent } from './components/Inform/inform/inform.component';
import { EntryComponent } from './components/Entrys/entry/entry.component';
import { AccesOwnerRentEntryViewComponent } from './components/owner/acces-owner-rent-entry-view/acces-owner-rent-entry-view.component';
import { GeneralDashboardComponent } from './components/Dashboards/general-dashboard/general-dashboard.component';
import { RegistroComponent } from './components/Employee/registro/registro.component';

export const routes: Routes = [
    { path: '', redirectTo: 'entry', pathMatch: 'full' },
    { path: 'Visitors', component: VisitorRegistryComponent },
    { path: 'Inform', component: InformComponent },
    { path: 'entry', component: EntryComponent },
    {path:'OwnerAccess',component:AccesOwnerRentEntryViewComponent},
    {path: 'Dashboards',component:GeneralDashboardComponent},
    {path: 'Entry',component:RegistroComponent}
];
