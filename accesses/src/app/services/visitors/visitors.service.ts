import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewMovements_EntryDto, User_AllowedInfoDto, Visitor } from '../../models/visitors/VisitorsModels';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors";
  private URL_POST_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  private readonly http: HttpClient = inject(HttpClient);

  constructor() {
    this.loadVisitorsData();
    console.log(this.visitorslist);
  }

  //lista de Visitors
  visitorslist : User_AllowedInfoDto[] = []

  loadVisitorsData(): void {

    this.getVisitorsData("Visitor").subscribe({
      next: (data: User_AllowedInfoDto[]) => {
        this.visitorslist = data; // Asigna los datos una vez que se reciban
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  GetVisitorsList(): User_AllowedInfoDto[]{
    return [...this.visitorslist]
  }

  //filtra la list de Visitors
  getVisitorByParam(parameter: string): User_AllowedInfoDto[] {

    console.log("el cambio: " + parameter);

    if (parameter != null && parameter.length > 2) {
      let param = parameter.toLowerCase();

      return this.visitorslist.filter(v =>
        v.document.toLowerCase().includes(param) ||
        v.name.toLowerCase().includes(param) ||
        v.last_name.toLowerCase().includes(param)
      );
    } else {
      return this.visitorslist;
    }
  }


  //Llamadas a Metodos:
  // METODO: getAllUserAllowedVisitors(@PathVariable String visitor)
  getVisitorsData(visitorType: string): Observable<User_AllowedInfoDto[]> {
    console.log(`${this.URL_GET_ALL_Visitors}/${visitorType}`)
    return this.http.get<User_AllowedInfoDto[]>(`${this.URL_GET_ALL_Visitors}/${visitorType}`);
  }

  // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
  registerVisitor(movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_VisitorInList, movement, { headers });
  }

  //METODO registerMovementEntryIfNotExists(
    // @RequestParam String documento,
    // @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate date,
    // @RequestBody(required = false) NewMovements_EntryDto movementsEntryDto) {
  registerUnregisteredVisitor(document: string, date: string, movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }  

}
