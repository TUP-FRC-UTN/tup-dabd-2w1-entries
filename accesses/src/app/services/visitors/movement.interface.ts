export interface AuthRangeDto {
    neighborhood_id: BigInt;
    init_date: Date;
    end_date: Date;
    allowedDaysDtos: AllowedDaysDto[];
}
export  interface UserAllowed {
    document: string;
    name: string;
    last_name: string;
    email: string;
    vehicles: any | null;
    
 
} 
export interface VehicleDto {
    plate: string;
    vehicle_Type: vehicleTypeDto | null;
    insurance: string;
}
export interface vehicleTypeDto {
    description: string;
}

  export interface Movement {
    movementDatetime: string;
    observations: string;
    user_allowed: UserAllowed;
    vehicle : VehicleDto | null;
  }
export interface AllowedDaysDto {
    day: Date;
    init_date: Date;
    end_date: Date;
}
