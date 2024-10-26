import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NewEmergencyDto } from '../../models/emergencies/NewEmergecyDto';
import { NewUserAllowedDto } from '../../models/visitors/VisitorsModels';

@Injectable({
  providedIn: 'root'
})
export class EmergenciesService {
  private URL_POST_EMERGENCY = "http://localhost:8090/";
  private readonly http: HttpClient = inject(HttpClient);

  constructor() { }

    registerEmergencyEntry(emergency: NewEmergencyDto): Observable<NewUserAllowedDto> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log(emergency);
      if (emergency.observations?.length == 0)
        emergency.observations = null;
      if ((emergency.vehicle?.vehicleType.description.length ?? 0) < 1)
        emergency.vehicle = null;
      return this.http.post<NewUserAllowedDto>(this.URL_POST_EMERGENCY + "emergency/register_entry", emergency, { headers });
    }

    registerEmergencyExit(emergency: NewEmergencyDto): Observable<NewUserAllowedDto> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (emergency.observations?.length == 0)
        emergency.observations = null;
      if ((emergency.vehicle?.vehicleType.description.length ?? 0) < 1)
        emergency.vehicle = null;
      return this.http.post<NewUserAllowedDto>(this.URL_POST_EMERGENCY + "emergency/register_exit", emergency, { headers });
    }
}
