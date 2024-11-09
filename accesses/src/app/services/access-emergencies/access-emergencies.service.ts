import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccessNewEmergencyDto } from '../../models/access-emergencies/access-new-emergecy-dto';
import { AccessEmergencyPersonDto } from '../../models/access-emergencies/access-emergency-person-dto';
import { AccessRegistryUpdateService } from '../access-registry-update/access-registry-update.service';

@Injectable({
  providedIn: 'root'
})
export class AccessEmergenciesService {
  private URL_POST_EMERGENCY = "http://localhost:8090/";
  private readonly http: HttpClient = inject(HttpClient);
  private readonly registryUpdate = inject(AccessRegistryUpdateService);

  constructor() { }

    registerEmergencyEntry(emergency: AccessNewEmergencyDto): Observable<AccessEmergencyPersonDto[]> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (emergency.observations?.length == 0)
        emergency.observations = null;
      if ((emergency.vehicle?.vehicle_Type.description.length ?? 0) < 1)
        emergency.vehicle = null;
      return this.http.post<AccessEmergencyPersonDto[]>(this.URL_POST_EMERGENCY + "emergency/register_entry", emergency, { headers })
      .pipe(
        tap(() => {
          this.registryUpdate.updateTable(true);
        })
      );
    }

    registerEmergencyExit(emergency: AccessNewEmergencyDto): Observable<AccessEmergencyPersonDto[]> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (emergency.observations?.length == 0)
        emergency.observations = null;
      if ((emergency.vehicle?.vehicle_Type.description.length ?? 0) < 1)
        emergency.vehicle = null;
      return this.http.post<AccessEmergencyPersonDto[]>(this.URL_POST_EMERGENCY + "emergency/register_exit", emergency, { headers })
      .pipe(
        tap(() => {
          this.registryUpdate.updateTable(true);
        })
      );
    }
}
