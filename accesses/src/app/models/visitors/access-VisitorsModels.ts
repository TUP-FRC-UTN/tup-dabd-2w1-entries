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
      neighbor_id: number; //me lo tiene q pasar el back (Todavia no esta implementado!!)
      init_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: string; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDaysDtos: Allowed_DaysDto[];
    }
    export interface Allowed_DaysDto {
      day: string; // (EJ: "Monday")
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
      userType: User_allowedTypeDto;
      authRanges: AuthRangeInfoDto[]; //List<AuthRangeInfoDto>
      observations?: string; //campo extra (no esta en el back)

      //ATENCION: documentTypeDto antes se llamaba document_TypeDto 
      // (no se pq pero si tenia _ no me lo leia y tiraba error, ese cambio lo arreglo)
      documentTypeDto: Document_TypeDto; // tipo de documento q se va a mostrar
      neighbor_id: number; //se necesita para el post del Visitor
    }

    export interface AuthRangeInfoDto {
      init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
      allowedDays: Allowed_DaysDto[]; //List<Allowed_DaysDto> 
    }

    //FIN Clase necesaria (para recibir la data): User_AllowedInfoDto

    // METODO: registerMovementExit(NewMovements_ExitDto movementsExitDto)
    // CLase necesaria: NewMovements_ExitDto
    export interface NewMovement_ExitDto {
      movementDatetime: Date; // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z")
      observations: string;
      newUserAllowedDto: NewUserAllowedDto; //interface declarada mas abajo
      authRangesDto: NewAuthRangeDto; //interface declarada mas abajo
      vehiclesId: number;
    }
    // FIN METODOS: registerMovementExit(NewMovements_ExitDto movementsExitDto)
    // FIN CLase necesaria: NewMovements_ExitDto

    //METODO: getUserAllowedLastExitByDocument(@RequestParam String document)
    //Clase q recibe la info: LastExitUserAllowedDto
    export interface LastExitUserAllowedDto {
      //la data q nos importa
      movementDatetime: number[] | null;
      firstExit: boolean;
  
      //datos del UserAllowed
      userType: User_allowedTypeDto;
      name: string;
      last_name: string;
      document: string;
      documentType: Document_TypeDto;
    }
    //FIN METODO: getUserAllowedLastExitByDocument(@RequestParam String document)

    //METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)
    //Clase q recibe la info: LastEntryUserAllowedDto
    export interface LastEntryUserAllowedDto {
      //la data q nos importa
      movementDatetime: number[] | null;
      firstEntry: boolean;
  
      //datos del UserAllowed
      userType: User_allowedTypeDto;
      name: string;
      last_name: string;
      document: string;
      documentType: Document_TypeDto;
    }
    //FIN METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)

// FIN CLASES del back necesarias para ciertos METODOS



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

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';


export interface ApiAllowedDay {
  day: string;
  init_hour: number[];
  end_hour: number[];
}

export interface FormattedHours {
  init_hour: string;
  end_hour: string;
}

export interface User_AllowedInfoDto2 {
  document: string;
  name: string;
  last_name: string;
  email: string;
  authId : string;
  authRange: AuthRangeInfoDto2; //List<AuthRangeInfoDto>
  observations?: string; //campo extra (no esta en el back)
}
export interface AuthRangeInfoDto2 {
  init_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  end_date: Date; //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
  allowedDays: ApiAllowedDay[]; //List<Allowed_DaysDto> 
}
export interface CommonSettings {
  authRange: {
    init_date: Date;
    end_date: Date;
    allowedDays: any[];
  };
}