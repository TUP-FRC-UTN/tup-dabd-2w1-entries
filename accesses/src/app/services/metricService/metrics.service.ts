import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthlyVisitorCount } from '../../models/VisitorsCount/MonthlyVisitorCount';
@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private apiUrl = 'http://localhost:8090';
  
  constructor(private http:HttpClient) { }

  getMonthlyVisitorCounts(): Observable<MonthlyVisitorCount[]> {
    return this.http.get<MonthlyVisitorCount[]>(this.apiUrl + "/monthly_counts");
  }

  getMonthlyVisitorCountsByType(): Observable<MonthlyVisitorCount[]> {
    return this.http.get<MonthlyVisitorCount[]>(this.apiUrl + "/monthly-visitors-by-type");
  }

}
  
