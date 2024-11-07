import { Injectable } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap} from 'rxjs/operators';
import { inject } from '@angular/core';
import { AccessVisitorRecord, AccessVisitor, AccessAuthRange, AccessAllowedDay, AccessUser, AccessUserAllowedInfoDto } from '../../../../models/access-visitors/access-visitors-models';
import { AccessUserAllowedInfoDto2, Owner } from '../../../../models/access-visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { VisitorsService } from '../../access-visitors.service';
import {AccessVisitorsEditServiceService} from '../access-visitors-edit-service/access-visitors-edit-service.service';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsEditServiceHttpClientService {
  constructor(
    private visitorService: AccessVisitorsEditServiceService
  ) {}
  private readonly http: HttpClient = inject(HttpClient);
  private apiUrl = 'http://localhost:8090';
 
  private dayMapping: { [key: string]: string } = {
    'Lun': 'MONDAY',
    'Mar': 'TUESDAY',
    'Mié': 'WEDNESDAY',
    'Jue': 'THURSDAY',
    'Vie': 'FRIDAY',
    'Sáb': 'SATURDAY',
    'Dom': 'SUNDAY'
  };
  getQRCode(visitorId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/visitor-qr/image/${visitorId}`, {
      responseType: 'blob' 
    });
  }

  getowners(): Observable<Owner[]> {
      const url = 'http://localhost:8090/user_Allowed/ownersAndTenants/';
      return this.http.get<Owner[]>(url).pipe(
        tap(response => {
          // Si la respuesta no es un array, muestra un aviso en la consola
          if (!Array.isArray(response)) {
            console.warn('La respuesta no es un array:', response);
          } else {
            console.log('Respuesta del servidor:', response);
          }
        }),
        map(response => {
          if (Array.isArray(response)) {
            return response; 
          } else {
            return [];
          }
        }),
        catchError(error => {
          console.error('Error al obtener los propietarios:', error);
          return of([]); 
        })
      );
  }
  getSelectedOwner(ownerId: string): Observable<Owner> {
    let owner = this.visitorService.getOwner();
    const url = `http://localhost:8090/user_Allowed/ownersAndTenants/${ownerId}`;
    return this.http.get<Owner>(url);
  }

  getVisitors(id : number):  Observable<AccessUserAllowedInfoDto2[]> {

    const url = `http://localhost:8090/user_Allowed/visitors/by${id}`; 
    
    const response = this.http.get<AccessUserAllowedInfoDto2[]>(url).pipe(
      tap(response => {
        // Si la respuesta no es un array, muestra un aviso en la consola
        if (!Array.isArray(response)) {
          console.warn('La respuesta no es un array:', response);
        } else {
          console.log('Respuesta del servidor:', response);
        }
      }),
      map(response => {
        
        if (Array.isArray(response)) {
          return response; 
        } else {
          
          return [];
        }
      }),
      catchError(error => {
 
        console.error('Error al obtener los visitantes:', error);
        return of([]); 
      })
    );
    console.log('Respuesta:', response);
    return response;
  }
  PutVisitor(visitor: AccessUserAllowedInfoDto2): Observable<any> {
    const url = 'http://localhost:8090/user_Allowed/visitor/update';
    const datePipe = new DatePipe('en-US');
    
    // Crear el cuerpo de la solicitud en el formato esperado
    const requestBody = {
      document: visitor.document,
      documentType: visitor.documentType,
      name: visitor.name,
      last_name: visitor.last_name,
      email: visitor.email,
      authRange: {
        init_date: datePipe.transform(visitor.authRange.init_date, 'yyyy-MM-dd'),
        end_date: datePipe.transform(visitor.authRange.end_date, 'yyyy-MM-dd'),
        allowedDays: visitor.authRange.allowedDays.map(day => ({
          day: day.day,     
          init_hour: `${String(day.init_hour[0]).padStart(2, '0')}:${String(day.init_hour[1]).padStart(2, '0')}`,
          end_hour: `${String(day.end_hour[0]).padStart(2, '0')}:${String(day.end_hour[1]).padStart(2, '0')}`
        })),
        neighbor_id: visitor.authRange.neighbor_id
      },
      vehicle: visitor.vehicle ? { // Verificación de null para vehicle
        id: visitor.vehicle.id,
        plate: visitor.vehicle.plate,
        insurance: visitor.vehicle.insurance,
        vehicle_Type: {
          description: visitor.vehicle.vehicle_Type.description
        }
      } : null, // Asigna null si no existe un vehículo
      authId: parseInt(visitor.authId),
      visitorId: visitor.visitorId !== null ? parseInt(visitor.visitorId.toString()) : null
    };
    console.log('Cuerpo de la solicitud:', requestBody);
    return this.http.put(url, requestBody);
  }
  getVehicleTypes(): Observable<string[]> {
    const url = 'http://localhost:8090/getAll/vehiclesType'; 
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Respuesta completa del servidor:', response)),
      map(response => {
        if (Array.isArray(response)) {
          return response.map(item => item.description || 'Descripción no disponible');
        } else {
          console.error('La respuesta no es un array:', response);
          return [];
        }
      })
    );
  }
  private readonly usersApiUrl = 'https://my-json-server.typicode.com/405786MoroBenjamin/users-responses/users';

  getUsers(): Observable<AccessUser[]> {
    return this.http.get<AccessUser[]>(this.usersApiUrl).pipe(
      tap(response => {
        if (!Array.isArray(response)) {
          console.warn(response);
        }
      }),
      map(users => {
        console.log(users);
        return users;
      }),
    
    );
  }

}
