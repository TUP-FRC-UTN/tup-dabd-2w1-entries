import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewMovements_EntryDto } from '../../models/visitors/VisitorsModels';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_POST_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  constructor(private http: HttpClient) {
  }


  // METODO: registerMovementEntry(NewMovements_EntryDto movementsEntryDto)
  registerVisitor(movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_VisitorInList, movement, { headers });
  }

  //METODO registerMoventEntryIfNotExistsInvitation(String documento, LocalDate date, NewMovements_EntryDto movementsEntryDto)
  registerUnregisteredVisitor(document: string, date: string, movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }
  

}
