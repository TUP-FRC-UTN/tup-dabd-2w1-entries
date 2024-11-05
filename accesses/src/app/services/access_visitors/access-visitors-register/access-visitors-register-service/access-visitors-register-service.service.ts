import { Injectable } from '@angular/core';
import { AccessAllowedDay, AccessVisitor,AccessAuthRange } from '../../../../models/access-visitors/access-visitors-models';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceService {
  
  private visitorsSubject = new BehaviorSubject<AccessVisitor[]>([]);
  private allowedDaysSubject = new BehaviorSubject<AccessAllowedDay[]>([]);
  private authRangeSubject = new BehaviorSubject<AccessAuthRange | null>(null);


  readonly visitors$ = this.visitorsSubject.asObservable();
  readonly allowedDays$ = this.allowedDaysSubject.asObservable();
  readonly authRange$ = this.authRangeSubject.asObservable();



  getAuthRange(): Observable<AccessAuthRange | null> {
    return this.authRange$;
  }

  setAuthRange(authRange: AccessAuthRange): void {
    this.authRangeSubject.next(authRange);
  }

  getAllowedDays(): Observable<AccessAllowedDay[]> {
    return this.allowedDays$;
  }

  addAllowedDays(allowedDays: AccessAllowedDay[]): void {
    const currentDays = this.allowedDaysSubject.value;
    this.allowedDaysSubject.next([...currentDays, ...allowedDays]);
  }

  updateAllowedDays(allowedDays: AccessAllowedDay[]): void {
    this.allowedDaysSubject.next(allowedDays);
  }

  addVisitorsTemporalsSubject(visitor: AccessVisitor): boolean {
    const currentVisitors = this.visitorsSubject.value;
    
    // Verifica si el documento ya existe
    const documentExists = currentVisitors.some(v => v.document === visitor.document);
  
    // Verifica si la matrícula del vehículo ya existe
    const licensePlateExists = currentVisitors.some(v => 
      v.vehicle?.licensePlate === visitor.vehicle?.licensePlate && visitor.vehicle?.licensePlate
    );
  
    // Verifica si el correo electrónico ya existe
    const emailExists = currentVisitors.some(v => v.email === visitor.email);
  
    // Si el documento, matrícula o correo ya existen, rechaza la adición
    if (documentExists || licensePlateExists || emailExists) {
      return false;
    }
  
    // Agrega el visitante a la lista si todas las validaciones pasaron
    this.visitorsSubject.next([...currentVisitors, visitor]);
    return true;
  }
  

  deleteVisitorsTemporalsSubject(visitor: AccessVisitor): void {
    const currentVisitors = this.visitorsSubject.value;
    const updatedVisitors = currentVisitors.filter(v => v.document !== visitor.document);
    this.visitorsSubject.next(updatedVisitors);
  }

  getVisitorsTemporalsSubject(): Observable<AccessVisitor[]> {
    return this.visitors$;
  }

  updateVisitorsTemporalsSubject(visitorToUpdate: AccessVisitor): void {
    const currentVisitors = this.visitorsSubject.value;
    const updatedVisitors = currentVisitors.map(visitor => 
      visitor.document === visitorToUpdate.document ? visitorToUpdate : visitor
    );
    this.visitorsSubject.next(updatedVisitors);
  }

  resetAllData(): void {
    this.visitorsSubject.next([]);
    this.allowedDaysSubject.next([]);
    this.authRangeSubject.next(null);
  }
}
