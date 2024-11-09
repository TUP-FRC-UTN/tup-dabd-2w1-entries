import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessMetricsDTO, DayOfWeekMetricDTO, HourlyMetricDTO, UserTypeMetricDTO } from '../../models/access-metric/metris';
@Injectable({
  providedIn: 'root'
})
export class AccessMetricsService {

  private baseUrl = 'http://localhost:8090';
  
  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<AccessMetricsDTO> {
    return this.http.get<AccessMetricsDTO>(`${this.baseUrl}/dashboard`);
  }

  getHourlyMetrics(): Observable<HourlyMetricDTO[]> {
    return this.http.get<HourlyMetricDTO[]>(`${this.baseUrl}/hourly`);
  }

  getUserTypeMetrics(): Observable<UserTypeMetricDTO[]> {
    return this.http.get<UserTypeMetricDTO[]>(`${this.baseUrl}/user-types`);
  }

  getDailyAccessData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(`${this.baseUrl}/daily-access-count`);
  }

  getAccessCountByUserTypeForCurrentMonth(): Observable<{ userType: string, count: number }[]> {
    return this.http.get<{ userType: string, count: number }[]>(`${this.baseUrl}/access-count-by-user-type`);
  }

  getAccessCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricDTO> {
    return this.http.get<DayOfWeekMetricDTO>(`${this.baseUrl}/day-with-most-accesses`);
  }


}