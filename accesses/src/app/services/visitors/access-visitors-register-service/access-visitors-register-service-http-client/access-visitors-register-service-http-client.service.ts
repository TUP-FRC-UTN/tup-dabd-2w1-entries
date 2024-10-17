import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceHttpClientService {
  private readonly http: HttpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:8090/getAll/vehiclesType';
  getVehicleTypes(): Observable<string[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(response => console.log('Respuesta completa del servidor:', response)),
      map(response => {
        if (Array.isArray(response)) {
          return response.map(item => {
            console.log('Item individual:', item);
            return item.description || 'Descripción no disponible';
          });
        } else {
          console.error('La respuesta no es un array:', response);
          return [];
        }
      })
    );
  }
}
