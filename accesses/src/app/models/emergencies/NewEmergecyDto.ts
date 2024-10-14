import { VehicleTypeDto } from "../visitors/VisitorsModels";

export interface NewEmergencyDto {
    dni: String;
    name: String;
    lastName: String;
    vehicle: NewEmergencyVehicleDto;
    observations: String | null;
}

export interface NewEmergencyVehicleDto {
    plate: string;
    vehicle_Type: VehicleTypeDto;
}