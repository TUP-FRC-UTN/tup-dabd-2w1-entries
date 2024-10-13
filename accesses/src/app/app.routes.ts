import { Routes } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { VisitorRegisterEntryComponent } from './components/visitors/(no-hace-falta)visitor-register-entry/visitor-register-entry.component';
import { InformComponent } from './components/Inform/inform/inform.component';
import { EntryComponent } from './components/Entrys/entry/entry.component';

export const routes: Routes = [
    { path: 'Visitors', component: VisitorRegistryComponent },
    { path: 'RegisterVisitorEntry', component: VisitorRegisterEntryComponent },
    { path: 'Inform', component: InformComponent },
    { path: 'entry', component: EntryComponent }
];
