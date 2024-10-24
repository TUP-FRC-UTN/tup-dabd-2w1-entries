import { Injectable } from '@angular/core';
import { AllowedDay, Visitor, AuthRange } from '../../../../models/visitors/VisitorsModels';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceService {
  private visitors: Visitor[] = [];
  private visitorsTemporalsSubject = new BehaviorSubject<Visitor[]>([]);

  private allowedDays: AllowedDay[] = [];
  private allowedDaysSubject = new BehaviorSubject<AllowedDay[]>([]);

  private authRange: AuthRange | null = null;
  private authRangeSubject = new BehaviorSubject<AuthRange | null>(null);

  getAuthRange(): Observable<AuthRange | null> {
    return this.authRangeSubject.asObservable();
  }

  setAuthRange(authRange: AuthRange): void {
    this.authRange = authRange;
    this.authRangeSubject.next(this.authRange);
  }

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

  addVisitorsTemporalsSubject(visitor: Visitor): boolean {
    // Validar si el documento o la patente ya existen
    const documentExists = this.visitors.some(v => v.document === visitor.document);
    const licensePlateExists = this.visitors.some(v => v.vehicle?.licensePlate === visitor.vehicle?.licensePlate);

    if (documentExists) {
      return false; // Retornar false si el documento ya existe
    }

    if (licensePlateExists) {
      return false; // Retornar false si la patente ya existe
    }

    // Agregar el visitante si no existen documentos ni patentes duplicadas
    this.visitors.push({ ...visitor });
    this.visitorsTemporalsSubject.next(this.visitors);
    return true; // Retornar true si se agregó el visitante
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
    const index = this.visitors.findIndex(v => v.document === visitorToUpdated.document);
    if (index !== -1) {
      this.visitors[index] = { ...visitorToUpdated };
      this.visitorsTemporalsSubject.next([...this.visitors]);
    } else {
      console.log('Visitante no encontrado para modificar:', visitorToUpdated);
    }
  }
  clearVisitorsTemporalsSubject(): void {
    this.visitorsTemporalsSubject.next([]);
  }
  clearAllowedDayTemporalsSubject(): void {
    this.allowedDaysSubject.next([]);
  }

  clearAuthRange(): void {
    this.authRangeSubject.next(null);
  }
}
