import { Injectable } from '@angular/core';
import { AllowedDay, Visitor } from '../../../../models/visitors/VisitorsModels';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceService {

  private visitors: Visitor[] = [];
  private visitorsTemporalsSubject = new BehaviorSubject<Visitor[]>([]);

  private allowedDays: AllowedDay[] = [];
  private allowedDaysSubject = new BehaviorSubject<AllowedDay[]>([]);

  getAllowedDays(): Observable<AllowedDay[]> {
    return this.allowedDaysSubject.asObservable();
  }

  addAllowedDays(allowedDays: AllowedDay[]): void {
    this.allowedDays = [...this.allowedDays, ...allowedDays];
    this.allowedDaysSubject.next(this.allowedDays);
  }

  updateAllowedDays(allowedDays: AllowedDay[]): void {
    this.allowedDays = [...allowedDays];
    this.allowedDaysSubject.next(this.allowedDays);
  }

  addVisitorsTemporalsSubject(visitor: Visitor): void {
    this.visitors.push({ ...visitor });
    this.visitorsTemporalsSubject.next(this.visitors);
  }

  deleteVisitorsTemporalsSubject(visitor: Visitor): void {
    const index = this.visitors.findIndex(v => 
      v.document === visitor.document && 
      v.firstName === visitor.firstName && 
      v.lastName === visitor.lastName
    );
    
    if (index !== -1) {
      this.visitors.splice(index, 1);
      this.visitorsTemporalsSubject.next([...this.visitors]);
    } else {
      console.log('Visitante no encontrado:', visitor);
    }
  }

  getVisitorsTemporalsSubject(): Observable<Visitor[]> {
    return this.visitorsTemporalsSubject.asObservable();
  }

  updateVisitorsTemporalsSubject(visitorToUpdated: Visitor): void {
    const indice = this.visitors.findIndex(v => v.document === visitorToUpdated.document);
    if (indice !== -1) {
      this.visitors[indice] = { ...visitorToUpdated };
      this.visitorsTemporalsSubject.next([...this.visitors]);
    } else {
      console.log('Visitante no encontrado para modificar:', visitorToUpdated);
    }
  }
}
