export interface AccessMetricsDTO {
    totalAccesses: number;
    averageProcessingTime: number;
    hourlyMetrics: HourlyMetricDTO[];
    userTypeMetrics: UserTypeMetricDTO[];
    dailyMetrics: DailyMetricDTO[];
  }
  
  export interface HourlyMetricDTO {
    hour: number;
    count: number;
  }
  
  export interface UserTypeMetricDTO {
    userType: string;
    count: number;
  }
  
  export interface DailyMetricDTO {
    date: string;
    count: number;
  }

  export interface DayOfWeekMetricEntryDTO {
    accessCount: number;  
    dayOfWeek: string;      
  }

  export interface DayOfWeekMetricExitDTO {
    dayOfWeek: string;
    exitsCountPeak: number;
  }
  