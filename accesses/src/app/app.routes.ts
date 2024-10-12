import { Routes } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { VisitorRegisterEntryComponent } from './components/visitors/(no-hace-falta)visitor-register-entry/visitor-register-entry.component';

export const routes: Routes = [
    { path: 'Visitors', component: VisitorRegistryComponent },
    { path: 'RegisterVisitorEntry', component: VisitorRegisterEntryComponent }
];
