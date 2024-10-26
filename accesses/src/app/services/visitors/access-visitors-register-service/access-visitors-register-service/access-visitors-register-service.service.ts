import { Injectable } from '@angular/core';
import { AllowedDay, Visitor,AuthRange } from '../../../../models/visitors/VisitorsModels';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsRegisterServiceService {
   // Eliminamos las variables locales y solo mantenemos los BehaviorSubjects
   private visitorsSubject = new BehaviorSubject<Visitor[]>([]);
   private allowedDaysSubject = new BehaviorSubject<AllowedDay[]>([]);
   private authRangeSubject = new BehaviorSubject<AuthRange | null>(null);
 
   // Observables públicos
   readonly visitors$ = this.visitorsSubject.asObservable();
   readonly allowedDays$ = this.allowedDaysSubject.asObservable();
   readonly authRange$ = this.authRangeSubject.asObservable();



  // private visitors: Visitor[] = [];
  // private visitorsTemporalsSubject = new BehaviorSubject<Visitor[]>([]);

  // private allowedDays: AllowedDay[] = [];
  // private allowedDaysSubject = new BehaviorSubject<AllowedDay[]>([]);

  // private authRange: AuthRange | null = null;
  // private authRangeSubject = new BehaviorSubject<AuthRange | null>(null);
  getAuthRange(): Observable<AuthRange | null> {
    return this.authRange$;
  }

  setAuthRange(authRange: AuthRange): void {
    this.authRangeSubject.next(authRange);
  }

  getAllowedDays(): Observable<AllowedDay[]> {
    return this.allowedDays$;
  }

  addAllowedDays(allowedDays: AllowedDay[]): void {
    const currentDays = this.allowedDaysSubject.value;
    this.allowedDaysSubject.next([...currentDays, ...allowedDays]);
  }

  updateAllowedDays(allowedDays: AllowedDay[]): void {
    this.allowedDaysSubject.next(allowedDays);
  }

  addVisitorsTemporalsSubject(visitor: Visitor): boolean {
    const currentVisitors = this.visitorsSubject.value;
    const documentExists = currentVisitors.some(v => v.document === visitor.document);
    const licensePlateExists = currentVisitors.some(v => 
      v.vehicle?.licensePlate === visitor.vehicle?.licensePlate && visitor.vehicle?.licensePlate
    );

    if (documentExists || licensePlateExists) {
      console.log('Documento o patente ya existen:', visitor);
      return false;
    }

    this.visitorsSubject.next([...currentVisitors, visitor]);
    return true;
  }

  deleteVisitorsTemporalsSubject(visitor: Visitor): void {
    const currentVisitors = this.visitorsSubject.value;
    const updatedVisitors = currentVisitors.filter(v => v.document !== visitor.document);
    this.visitorsSubject.next(updatedVisitors);
  }

  getVisitorsTemporalsSubject(): Observable<Visitor[]> {
    return this.visitors$;
  }

  updateVisitorsTemporalsSubject(visitorToUpdate: Visitor): void {
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
