import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { NewMovements_EntryDto, User_AllowedInfoDto } from '../../models/visitors/interface/owner';

@Injectable({
  providedIn: 'root'
})
export class AccessOwnerRenterserviceService {
  private BASE_URL = "http://localhost:8090";
  private URL_POST_OwnerRenterInList = "http://localhost:8090/movements_entry/register";
  private URL_GET_UserAllowedVisitors = `${this.BASE_URL}/user_Allowed/ownersAndTenants/`;
  private httpClient:HttpClient=inject(HttpClient)
  constructor(){}
  registerOwnerRenterEntry(movemen:NewMovements_EntryDto){
    const headers=new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post<any>(this.URL_POST_OwnerRenterInList,movemen,{headers})
  }
  getAllOwnerRenterList():Observable<User_AllowedInfoDto[]>{
    return this.httpClient.get<User_AllowedInfoDto[]>(`${this.URL_GET_UserAllowedVisitors}`);
  }
}
