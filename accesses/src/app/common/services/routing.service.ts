import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SideButton } from '../models/SideButton';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private readonly router: Router = inject(Router);
  private redirectEvent = new Subject<string>();

  private readonly buttonsList: SideButton[] = [
  
    ///////////////////////////////////////////////////////////////////////////////
    //Botones de acceso
    {
      icon: 'bi-shield-fill-exclamation',
      name: 'Accesos',
      roles: [
        'SuperAdmin',
        'Gerente general',
        'Seguridad',
        'Propietario',
        'Inquilino',
      ],
      childButtons: [
        {
          icon: 'bi bi-person-lines-fill',
          name: 'Informe',
          title: 'Informe de Ingresos/Egresos',
          route: 'main/entries/reports',
          roles: ['SuperAdmin', 'Gerente general', 'Seguridad'],
        },
        {
          icon: 'bi bi-door-open-fill',
          name: 'Registro',
          title: 'Añadir Visitante',
          route: 'main/entries/visitor',
          roles: ['SuperAdmin', 'Gerente general', 'Propietario', 'Inquilino'],
        },
        {
          icon: 'bi bi-car-front-fill',
          name: 'Vehiculos',
          title: 'Registro de Vehículos',
          route: 'main/entries/vehicles',
          roles: ['SuperAdmin', 'Gerente general', 'Seguridad'],
        },
      ],
    },
  ];

  private titleSubject = new Subject<string>();
  private title: string = localStorage.getItem('title') || 'Página principal';

  constructor() {
    this.titleSubject.next(this.title);
  }

  getButtons() {
    return [...this.buttonsList];
  }

  //Redirige y setea el titulo(si es que viene)
  redirect(url: string, title?: string) {
    if (title) {
      this.setTitle(title);
    }
    this.router.navigate([url]);
    this.redirectEvent.next(this.getTitle());
  }

  getRedirectObservable(): Observable<string> {
    return this.redirectEvent.asObservable();
  }

  //Setear el titulo
  setTitle(title: string) {
    this.title = title;
    localStorage.setItem('title', title);
    this.titleSubject.next(title);
  }

  //Obtener el titulo
  getTitle(): string {
    return this.title;
  }

  getTitleObservable(): Observable<string> {
    return this.titleSubject.asObservable();
  }

  //Obtiene la ruta en forma de lista
  getRouteSegments(): string[] {
    const currentUrl = this.router.url;
    return currentUrl.split('/').filter((segment) => segment);
  }

  //Obtiene la ruta para cada dashboard
  getDashboardRoute() {
    const url: string[] = this.getRouteSegments();
    if (url.length > 1) {
      return `main/${url[1]}/dashboard`;
    }
    return '';
  }

  cleanStorage() {
    localStorage.removeItem('title');
    this.title = 'Página principal';
    this.titleSubject.next(this.title);
  }
}
