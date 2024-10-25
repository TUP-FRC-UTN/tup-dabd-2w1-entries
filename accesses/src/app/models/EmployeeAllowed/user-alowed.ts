

export interface NewVehicleDto {
    vehicleId: string;
    vehicleType: string;
    plateNumber: string;
  }
  
  export interface SuppEmpDto {
    document: string;
    name: string;
    last_name: string;
    userType: string;
    email: string;
    vehicles: NewVehicleDto[];
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
