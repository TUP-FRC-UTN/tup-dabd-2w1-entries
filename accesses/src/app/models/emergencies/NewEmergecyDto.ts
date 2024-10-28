import { Document_TypeDto, VehicleTypeDto } from "../visitors/access-VisitorsModels";

export interface NewEmergencyDto {
    people: NewEmergencyPerson[];
    vehicle: NewEmergencyVehicleDto | null;
    observations: String | null;
}

export interface NewEmergencyPerson {
    document: {
        type: Document_TypeDto;
        number: string;
    }
    name: String;
    lastName: String;
}

export interface NewEmergencyVehicleDto {
    plate: string | null;
    vehicleType: VehicleTypeDto;
}