import { Document_TypeDto } from "../access-VisitorsModels";

export interface VehicleOwner {
  plate: string;
  vehicle_Type: VehicleTypeDto;
  insurance: string;
}
export interface Day{
  name: string,
  value: boolean
}
export interface DayAllowedOwner {
  day: Day;
  initHour: Date;
  endHour: Date;
  throughMidnight: boolean;
}
export interface NewMovements_EntryDtoOwner {
  movementDatetime: Date; 
  observations: string;
  newUserAllowedDto: NewUserAllowedDtoOwner; 
  authRangesDto: NewAuthRangeDtoOwner; 
  vehiclesId?: number;
}
export interface NewAuthRangeDtoOwner {
  neighbor_id: number;
  init_date: Date; 
  end_date: Date;
  allowedDaysDtos: Allowed_DaysDtoOwner[] ;
}
export interface Document_TypeDtoOwner {
  description: string;
}
export interface User_allowedTypeDtoOwner {
  description: string;
}
export interface VehicleTypeDto {
  description: string;
}
export interface User_AllowedInfoDtoOwner {
  document:string,    
  name:string,
  last_name:string,
  email:string,
  vehicles:VehicleOwner[],
  userType:User_allowedTypeDtoOwner,
  authRanges:AuthRangeInfoDtoOwner[],
  documentTypeDto: Document_TypeDto;
}
export interface AuthRangeInfoDtoOwner {
  neighbor_id: number;
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: Allowed_DaysDtoOwner[]; //List<Allowed_DaysDto> 
}
export interface Allowed_DaysDtoOwner {
  day: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
  end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
}
export interface NewUserAllowedDtoOwner {
  document: string;
  name: string;
  last_name: string;
  documentType: Document_TypeDtoOwner;
  user_allowed_Type: User_allowedTypeDtoOwner;
  vehicle?: VehicleOwner;
  email: string;
}