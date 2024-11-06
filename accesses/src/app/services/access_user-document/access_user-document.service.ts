import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessUserAllowedInfoDto } from '../../models/access-visitors/access-visitors-models';
import { UserAllowedDto } from '../access_visitors/movement.interface';

@Injectable({
  providedIn: 'root'
})
export class Access_userDocumentService {

constructor() { }
private BASE_URL="http://localhost:8090";
private URL_GET_USER_BY_DOCUMENT=`${this.BASE_URL}/userAllowedByDni`
private http=inject(HttpClient)
getUserByDniAndDocument(dni:string,documentType:string):Observable<UserAllowedDto>{
  console.log(`Llamando a la API con DNI: ${dni} y Tipo de Documento: ${documentType}`);  // Log para depurar
  return this.http.get<UserAllowedDto>(`${this.URL_GET_USER_BY_DOCUMENT}/${dni}/${documentType}`)
}
}