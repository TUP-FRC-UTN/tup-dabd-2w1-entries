// cosas front de fede
export interface Vehicle {
  type: string;
  plat: string;
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
export interface Visitor {
  name: string;
  lastName: string;
  document: string;
  phoneNumber: string;
  email: string;
  vehicle?: Vehicle;
  hasVehicle: boolean;
  plate?: string;
  vehicleType?:string;
}
export interface RegistryVisitor {
  visitors: Visitor[];
  daysAllowed: DayAllowed[];
}
// FIN cosas front de fede



// CLASES del back necesarias para ciertos METODOS

  // METODOS: registerMovementEntry(NewMovements_EntryDto movementsEntryDto) / registerMoventEntryIfNotExistsInvitation(String documento, LocalDate date, NewMovements_EntryDto movementsEntryDto)
  // CLase necesaria: NewMovements_EntryDto
  export interface NewMovements_EntryDto {
    movementDatetime: Date; // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z")
    observations: string;
    newUserAllowedDto: NewUserAllowedDto; //interface declarada mas abajo
    authRangesDto: NewAuthRangeDto; //interface declarada mas abajo
    vehiclesId: number;
  }

    // todo lo necesario para NewAuthRangeDto
    export interface NewAuthRangeDto {
      neighbor_id: number;
      init_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDaysDtos: Allowed_DaysDto[];
    }
    export interface Allowed_DaysDto {
      day: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      init_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
      end_hour: string; //LocalTime (EJ: "14:30:00" / "hh:mm:ss")
    }
    // FIN todo lo necesario para NewAuthRangeDto

    // todo lo necesario para NewUserAllowedDto
    export interface NewUserAllowedDto {
      document: string;
      name: string;
      last_name: string;
      documentType: Document_TypeDto;
      user_allowed_Type: User_allowedTypeDto;
      vehicle?: NewVehicleDto;
      email: string;
    }

    export interface NewVehicleDto {
      plate: string;
      vehicle_Type: VehicleTypeDto;
      insurance: string;
    }

      // types
      export interface Document_TypeDto {
        description: string;
      }
      export interface User_allowedTypeDto {
        description: string;
      }
      export interface VehicleTypeDto {
        description: string;
      }
      //FIN types
    // FIN todo lo necesario para NewUserAllowedDto

    
    //METODO getAllUserAllowedVisitors(@PathVariable String visitor)
    //Clase necesaria (para recibir la data): User_AllowedInfoDto
    export interface User_AllowedInfoDto {
      document: string;
      name: string;
      last_name: string;
      email: string;
      vehicles: NewVehicleDto[]; //List<NewVehicleDto> 
      authRanges: AuthRangeInfoDto[]; //List<AuthRangeInfoDto>
      observations?: string; //campo extra (no esta en el back)
    }

    export interface AuthRangeInfoDto {
      init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDays: Allowed_DaysDto[]; //List<Allowed_DaysDto> 
    }
    //FIN Clase necesaria (para recibir la data): User_AllowedInfoDto


// FIN CLASES del back necesarias para ciertos METODOS
