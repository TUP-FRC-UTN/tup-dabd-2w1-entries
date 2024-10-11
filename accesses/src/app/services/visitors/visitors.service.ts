import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VisitorDto } from '../../models/visitors/VisitorDto';
import { MovementEntryDto } from '../../models/visitors/MovementEntryDto';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_POST_VisitorInList = "";
  private URL_POST_VisitorNotInList = "";

  visitorsListData: VisitorDto[] = [];

  constructor(private http: HttpClient) {
  }

  registerVisitor(movement: MovementEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_VisitorInList, movement, { headers });
  }

  registerUnregisteredVisitor(movement: MovementEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_VisitorNotInList, movement, { headers });
  }


  GetList(): VisitorDto[]{
    return [...this.visitorsListData]
  }

  filterVisitorByParams(param: string | null, startDate: Date | null, endDate: Date | null): VisitorDto[] {
    return this.visitorsListData.filter(user => (user.document === param || 
                      user.name === param || 
                      user.lastName === param) 
                    );
  }
}
