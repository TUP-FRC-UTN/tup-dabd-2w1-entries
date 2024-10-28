


export interface NewVehicleDto {
  plate: string;
  vehicle_Type: string;
  insurance : string;
}

export interface SuppEmpDto {
  document: string;
  name: string;
  last_name: string;
  userType: string;
  documentTypeDto: string;
  email: string;
  vehicles: NewVehicleDto[];
  authRanges:AuthRangeInfoDto;
  neighbor_id: 0;
}
export interface AuthRangeInfoDto {
  neighbor_id: number;
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: Allowed_DaysDto[]; //List<Allowed_DaysDto> 
}
export interface Allowed_DaysDto {
  day: string; // (EJ: "Monday")
  init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
  end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
}
export interface MovementEntryDto {
  description: string;
  movementDatetime: string; //string reprecenta LocalDateTime
  vehiclesId: number;
  document: string;
}

export interface MovementExitDto {
  description: string;
  movementDatetime: string; //string reprecenta LocalDateTime
  vehiclesId: number;
  document: string;
}