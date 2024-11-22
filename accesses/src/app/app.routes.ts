import { Routes } from '@angular/router';
import { MainComponent } from './common/components/main/main.component';
import { NotFoundComponent } from './common/components/not-found/not-found.component';

import { UnauthorizedComponent } from './common/components/unauthorized/unauthorized.component';


export const routes: Routes = [
    {
        //si se deja vacío por defecto redirige al login
        path: '',
        redirectTo: '/main/entries',
        pathMatch: 'full'
    },
 
    {
        path: 'main',
        component: MainComponent,
        children: [
         
       {
                path: 'entries',
                loadChildren: () => import("./entries/entry.routes").then((m) => m.ENTRY_ROUTES)
            },
       

        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },

];
