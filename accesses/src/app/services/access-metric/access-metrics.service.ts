import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessCount, AccessMetricsDTO, DayOfWeekMetricEntryDTO, DayOfWeekMetricExitDTO, HourlyMetricDTO, TopUser, UserTypeMetricDTO, UtilizationRateResponse } from '../../models/access-metric/metris';
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

  /* aca */
  getAccessCountByUserTypeForCurrentMonth(): Observable<{ userType: string, count: number }[]> {
    return this.http.get<{ userType: string, count: number }[]>(`${this.baseUrl}/access-count-by-user-type`);
  }
  
  /* Filtro */
  getAccessCountByUserTypeFilter(
    year: number,
    startMonth: number,
    endMonth: number
  ): Observable<AccessCount[]> {
    return this.http.get<AccessCount[]>(
      `${this.baseUrl}/access-count-by-user-type-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString()
        }
      }
    );
  }
  
  getExitCountByUserTypeFilter(
    year: number,
    startMonth: number,
    endMonth: number
  ): Observable<AccessCount[]> {
    return this.http.get<AccessCount[]>(
      `${this.baseUrl}/exit-count-by-user-type-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString()
        }
      }
    );
  }
  

getTotalCountsMovementsByFilter(   
  year: number,
  startMonth: number,
  endMonth: number
): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/total-access-and-exit-counts`,
    {
      params: {
        year: year.toString(),
        startMonth: startMonth.toString(),
        endMonth: endMonth.toString()
      }
    }
  );
}
  /* aca */
  getAccessAndExitByDayOfWeek(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/access-exit-count-by-day`);
  }

  /* filtro */
  getMovementCountsFilter(
    year: number, 
    startMonth: number, 
    endMonth: number, 
    filterType: 'ingresos' | 'egresos' | 'total'
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/access-exit-count-by-day-filter`,
      {
        params: {
          year: year.toString(),
          startMonth: startMonth.toString(),
          endMonth: endMonth.toString(),
          filterType: filterType // Parámetro para filtrar ingresos o egresos
        }
      }
    );
  }



  


  getStatsTypeUsers(fromMonth?: number, toMonth?: number, year?: number): Observable<any[]> {
    let params = new HttpParams();
    
    if (fromMonth !== undefined) {
      params = params.set('fromMonth', fromMonth.toString());
    }
    if (toMonth !== undefined) {
      params = params.set('toMonth', toMonth.toString());
    }
    if (year !== undefined) {
      params = params.set('year', year.toString());
    }

    return this.http.get<any[]>(this.baseUrl+ '/stats-type-users', { params });
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


  getTopUsers(startMonth: number, endMonth: number, year: number): Observable<TopUser[]> {
    const params = {
      startMonth: startMonth.toString(),
      endMonth: endMonth.toString(),
      year: year.toString()
    };
    return this.http.get<TopUser[]>(this.baseUrl + '/top-users-entries-exits', { params });
  }



  getUtilizationRateEntries(startMonth?: number, endMonth?: number, year?: number): Observable<UtilizationRateResponse> {
    let params = new HttpParams();
    
    if (startMonth) params = params.set('startMonth', startMonth.toString());
    if (endMonth) params = params.set('endMonth', endMonth.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get<UtilizationRateResponse>(this.baseUrl+'/utilization-rate-entries', { params });
  }

  getUtilizationRateExit(startMonth?: number, endMonth?: number, year?: number): Observable<UtilizationRateResponse> {
    let params = new HttpParams();
    
    if (startMonth) params = params.set('startMonth', startMonth.toString());
    if (endMonth) params = params.set('endMonth', endMonth.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get<UtilizationRateResponse>(this.baseUrl+'/utilization-rate-exits', { params });
  }

}