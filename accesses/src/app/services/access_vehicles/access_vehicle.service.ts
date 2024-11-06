import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccessNewVehicleDto, AccessUserAllowedInfoDto } from '../../models/access-visitors/access-visitors-models';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/access-visitors/interface/access-owner';

@Injectable({
  providedIn: 'root'
})
export class Access_vehicleService {

constructor() { }
private BASE_URL="http://localhost:8090";
private POST_ADD_VEHICLES=`${this.BASE_URL}/addVehicleToUser`;
private PATCH_LOGIC_DOWN=`${this.BASE_URL}/logicDown`
private http=inject(HttpClient)

addVehicle(vehicles:AccessNewVehicleDto[],dni:string,documentType:string):Observable<ApiResponse<AccessUserAllowedInfoDto>>{
return this.http.post<ApiResponse<AccessUserAllowedInfoDto>>(`${this.POST_ADD_VEHICLES}/${dni}/${documentType}`,vehicles)
}
logicDown(plate:string,userId:number):Observable<ApiResponse<AccessNewVehicleDto>>{
    return this.http.patch<ApiResponse<AccessNewVehicleDto>>(`${this.PATCH_LOGIC_DOWN}/${plate}/${userId}`,{})
}

}
