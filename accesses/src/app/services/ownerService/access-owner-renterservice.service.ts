import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { NewMovements_EntryDtoOwner, User_AllowedInfoDtoOwner } from '../../models/visitors/interface/owner';

@Injectable({
  providedIn: 'root'
})
export class AccessOwnerRenterserviceService {
  private BASE_URL = "http://localhost:8090";
  private URL_POST_OwnerRenterInList = "http://localhost:8090/movements_entry/register";
  private URL_GET_UserAllowedVisitors = `${this.BASE_URL}/user_Allowed/ownersAndTenants/`;
  private URL_POST_OwnerExit="http://localhost:8090/movements_exit/registerOwnerExit"
  private httpClient:HttpClient=inject(HttpClient)
  constructor(){}
  registerOwnerRenterEntry(movemen:NewMovements_EntryDtoOwner): Observable<any>{
    const headers=new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post<any>(this.URL_POST_OwnerRenterInList,movemen,{headers})
  }
  getAllOwnerRenterList():Observable<User_AllowedInfoDtoOwner[]>{
    return this.httpClient.get<User_AllowedInfoDtoOwner[]>(`${this.URL_GET_UserAllowedVisitors}`);
  }
  registerExitOwner(movement:NewMovements_EntryDtoOwner){
    const headers=new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post<any>(this.URL_POST_OwnerExit,movement,{headers})
  }
}
