import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessMetricsDTO, DayOfWeekMetricEntryDTO, DayOfWeekMetricExitDTO, HourlyMetricDTO, UserTypeMetricDTO } from '../../models/access-metric/metris';
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

  getDailyExitData(): Observable<{ date: string, count: number }[]> {
    return this.http.get<{ date: string, count: number }[]>(`${this.baseUrl}/daily-exit-count`);
  }

  getAccessCountByUserTypeForCurrentMonth(): Observable<{ userType: string, count: number }[]> {
    return this.http.get<{ userType: string, count: number }[]>(`${this.baseUrl}/access-count-by-user-type`);
  }

  getAccessCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricEntryDTO> {
    return this.http.get<DayOfWeekMetricEntryDTO>(`${this.baseUrl}/day-with-most-accesses`);
  }


  getExitCountByWeekAndDayOfWeek(): Observable<DayOfWeekMetricExitDTO> {
    return this.http.get<DayOfWeekMetricExitDTO>(`${this.baseUrl}/day-with-most-exits`);
  }




  getThisMonthlyAccessCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/this-monthly-access-count`);
  }

  getThisMonthlyExitCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/this-monthly-exit-count`);
  }


  getAccessAndExitByDayOfWeek(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/access-exit-count-by-day`);
  }

  getTotalEntriesForCurrentYear(): Observable<number> {
    return this.http.get<number>(this.baseUrl +'/total-entries-this-year');
  }

  getMonthWithMostEntries(): Observable<any> {
    return this.http.get<any>(this.baseUrl + "/month-with-most-entries");
  }



  getTotalExitsForCurrentYear(): Observable<number> {
    return this.http.get<number>(this.baseUrl +'/total-exits-current-year');
  }

  getMonthWithMostExitss(): Observable<any> {
    return this.http.get<any>(this.baseUrl + "/month-with-most-exits");
  }



}