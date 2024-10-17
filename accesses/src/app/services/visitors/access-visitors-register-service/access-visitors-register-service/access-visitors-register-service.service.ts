import { Injectable } from '@angular/core';
import { AllowedDay, Visitor } from '../../../../models/visitors/VisitorsModels';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceService {

  private visitors: Visitor[] = [];
  private visitorsTemporalsSubject = new BehaviorSubject<Visitor[]>([]);

  private diasPermitidos: AllowedDay[] = [];
  private diasPermitidosSubject = new BehaviorSubject<AllowedDay[]>([]);

  obtenerDiasPermitidos(): Observable<AllowedDay[]> {
    return this.diasPermitidosSubject.asObservable();
  }

  agregarDiasPermitidos(diasPermitidos: AllowedDay[]): void {
    this.diasPermitidos = [...this.diasPermitidos, ...diasPermitidos];
    this.diasPermitidosSubject.next(this.diasPermitidos);
  }

  actualizarDiasPermitidos(diasPermitidos: AllowedDay[]): void {
    this.diasPermitidos = [...diasPermitidos];
    this.diasPermitidosSubject.next(this.diasPermitidos);
  }

  agregarVisitanteTemporal(visitante: Visitor): void {
    this.visitors.push({ ...visitante });
    this.visitorsTemporalsSubject.next(this.visitors);
  }

  eliminarVisitanteTemporal(visitante: Visitor): void {
    const index = this.visitors.findIndex(v => 
      v.document === visitante.document && 
      v.firstName === visitante.firstName && 
      v.lastName === visitante.lastName
    );
    
    if (index !== -1) {
      this.visitors.splice(index, 1);
      this.visitorsTemporalsSubject.next([...this.visitors]);
    } else {
      console.log('Visitante no encontrado:', visitante);
    }
  }

  obtenerVisitantesTemporales(): Observable<Visitor[]> {
    return this.visitorsTemporalsSubject.asObservable();
  }

  modificarVisitanteTemporal(visitorToUpdated: Visitor): void {
    const indice = this.visitors.findIndex(v => v.document === visitorToUpdated.document);
    if (indice !== -1) {
      this.visitors[indice] = { ...visitorToUpdated };
      this.visitorsTemporalsSubject.next([...this.visitors]);
    } else {
      console.log('Visitante no encontrado para modificar:', visitorToUpdated);
    }
  }
}
