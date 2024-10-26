import { Injectable } from '@angular/core';
import { AllowedDay, Visitor,AuthRange } from '../../../../models/visitors/VisitorsModels';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
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
    const documentExists = this.visitors.some(v => v.document === visitor.document);
    const licensePlateExists = this.visitors.some(v => v.vehicle?.licensePlate === visitor.vehicle?.licensePlate);
    
    if (documentExists || licensePlateExists) {
      // Retornar false si ya existe un documento o patente duplicado
      console.log('Documento o patente ya existen:', visitor);
      // Emitir la lista actualizada incluso si no se agrega el visitante
      this.visitorsTemporalsSubject.next([...this.visitors]);
      return false;
    }
    
    // Agregar el visitante si no existen documentos ni patentes duplicadas
    this.visitors = [...this.visitors, visitor]; // Crear una nueva referencia
    this.visitorsTemporalsSubject.next(this.visitors); // Emitir la lista actualizada
    return true; // Retornar true si se agregó el visitante
  }
  
  deleteVisitorsTemporalsSubject(visitor: Visitor): void {
    this.visitors = this.visitors.filter(v => v.document !== visitor.document);
    this.visitorsTemporalsSubject.next([...this.visitors]); // Emitir la lista sin el visitante eliminado
  }

  getVisitorsTemporalsSubject(): Observable<Visitor[]> {
    return this.visitorsTemporalsSubject.asObservable();
  }

  updateVisitorsTemporalsSubject(visitorToUpdate: Visitor): void {
    const index = this.visitors.findIndex(v => v.document === visitorToUpdate.document);
    if (index !== -1) {
      this.visitors[index] = { ...visitorToUpdate };
      this.visitorsTemporalsSubject.next([...this.visitors]); 
    } else {
      console.log('Visitante no encontrado para modificar:', visitorToUpdate);
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
  resetAllData() {
    this.clearVisitorsTemporalsSubject();
    this.clearAllowedDayTemporalsSubject();
    this.clearAuthRange();
  }

}
