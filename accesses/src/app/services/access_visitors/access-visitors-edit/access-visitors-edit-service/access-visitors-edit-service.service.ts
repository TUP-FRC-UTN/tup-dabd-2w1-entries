import { Injectable } from '@angular/core';
import { AccessAllowedDay, AccessVisitor,AccessAuthRange, AccessUserAllowedInfoDto } from '../../../../models/access-visitors/access-visitors-models';
import { Observable, BehaviorSubject } from 'rxjs';
import { AccessApiAllowedDay, AccessAuthRangeInfoDto2, AccessUserAllowedInfoDto2, Owner } from '../../../../models/access-visitors/access-VisitorsModels';
@Injectable({
  providedIn: 'root'
})
export class AccessVisitorsEditServiceService {
  
  private visitorsSubject = new BehaviorSubject<AccessUserAllowedInfoDto2[]>([]);
  private allowedDaysSubject = new BehaviorSubject<AccessApiAllowedDay[]>([]);
  private authRangeSubject = new BehaviorSubject<AccessAuthRangeInfoDto2 | null>(null);
  private OwnerSubject = new BehaviorSubject<Owner | null >(null);
  private neighborsSubject = new BehaviorSubject<number >(0);
  readonly visitors$ = this.visitorsSubject.asObservable();
  readonly allowedDays$ = this.allowedDaysSubject.asObservable();
  readonly authRange$ = this.authRangeSubject.asObservable();
  readonly owner$ = this.OwnerSubject.asObservable();
  readonly neighbors$ = this.neighborsSubject.asObservable();

  getAuthRange(): Observable<AccessAuthRangeInfoDto2 | null> {
    return this.authRange$;
  }

  setAuthRange(authRange: AccessAuthRangeInfoDto2): void {
    this.authRangeSubject.next(authRange);
  }
  getOwner(): Observable<Owner | null> {
    return this.owner$;
  }
  setOwner(owner: Owner): void {
    this.OwnerSubject.next(owner);
  }
  getNeighbors(): Observable<number> {
    return this.neighbors$;
  }
  setNeighbors(neighbors: number): void {
    this.neighborsSubject.next(neighbors);
  }
  getAllowedDays(): Observable<AccessApiAllowedDay[]> {
    return this.allowedDays$;
  }

  addAllowedDays(allowedDays: AccessApiAllowedDay[]): void {
    const currentDays = this.allowedDaysSubject.value;
    this.allowedDaysSubject.next([...currentDays, ...allowedDays]);
  }

  updateAllowedDays(allowedDays: AccessApiAllowedDay[]): void {
    this.allowedDaysSubject.next(allowedDays);
  }

  addVisitorsTemporalsSubject(visitor: AccessUserAllowedInfoDto2): boolean {
    const currentVisitors = this.visitorsSubject.value;
    const documentExists = currentVisitors.some(v => v.document === visitor.document);
    const licensePlateExists = currentVisitors.some(v => 
      v.vehicle?.plate === visitor.vehicle?.plate && visitor.vehicle?.plate
    );

    if (documentExists || licensePlateExists) {
      return false;
    }

    this.visitorsSubject.next([...currentVisitors, visitor]);
    return true;
  }

  deleteVisitorsTemporalsSubject(visitor: AccessUserAllowedInfoDto2): void {
    const currentVisitors = this.visitorsSubject.value;
    const updatedVisitors = currentVisitors.filter(v => v.document !== visitor.document);
    this.visitorsSubject.next(updatedVisitors);
  }

  getVisitorsTemporalsSubject(): Observable<AccessUserAllowedInfoDto2[]> {
    return this.visitors$;
  }

  updateVisitorsTemporalsSubject(visitorToUpdate: AccessUserAllowedInfoDto2): void {
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