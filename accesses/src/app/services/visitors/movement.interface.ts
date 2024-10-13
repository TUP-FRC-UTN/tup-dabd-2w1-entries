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
    id: bigint | null;
    vehicleTypeId: bigint | null;
    vehicle_Type: bigint | null;
    plate: string;
    insurance: string;
}
  export interface Movement {
    movementDatetime: string;
    observations: string;
    user_allowed: UserAllowed;
    vehicle : any | null;
  }
export interface AllowedDaysDto {
    day: Date;
    init_date: Date;
    end_date: Date;
}
