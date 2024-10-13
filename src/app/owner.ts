export interface Owner {
    document:string,    
    name:string,
    last_name:string,
    email:string,
    user_allowed_Type: User_allowedTypeDto,
    vehicles?:Vehicle[],
    authRanges:NewAuthRangeDto
}
export interface Vehicle {
    plate: string;
    vehicle_Type: VehicleTypeDto;
    insurance: string;
  }
  export interface Day{
    name: string,
    value: boolean
  }
  export interface DayAllowed {
    day: Day;
    initHour: Date;
    endHour: Date;
    throughMidnight: boolean;
  }
  export interface NewMovements_EntryDto {
    movementDatetime: Date; 
    observations: string;
    newUserAllowedDto: NewUserAllowedDto; 
    authRangesDto: NewAuthRangeDto; 
    vehiclesId?: number;
  }
  export interface NewAuthRangeDto {
    neighbor_id: number;
    init_date: Date; 
    end_date: Date;
    allowedDaysDtos: Allowed_DaysDto[] ;
  }
  export interface Document_TypeDto {
    description: string;
  }
  export interface User_allowedTypeDto {
    description: string;
  }
  export interface VehicleTypeDto {
    description: string;
  }
  export interface User_AllowedInfoDto {
    document:string,    
    name:string,
    last_name:string,
    email:string,
    vehicles?:Vehicle[],
    userType:User_allowedTypeDto,
    authRanges:AuthRangeInfoDto[]
  }
  export interface AuthRangeInfoDto {
    init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
    end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
    allowedDays: Allowed_DaysDto[]; //List<Allowed_DaysDto> 
}
export interface Allowed_DaysDto {
    day: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
    init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
    end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
  }
  export interface NewUserAllowedDto {
    document: string;
    name: string;
    last_name: string;
    documentType: Document_TypeDto;
    user_allowed_Type: User_allowedTypeDto;
    vehicle?: Vehicle;
    email: string;
  }