import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allowed_DaysDto, AuthRangeInfoDto, Document_TypeDto, LastEntryUserAllowedDto, LastExitUserAllowedDto, NewAuthRangeDto, NewMovement_ExitDto, NewMovements_EntryDto, NewUserAllowedDto, NewVehicleDto, User_AllowedInfoDto, User_allowedTypeDto, VehicleTypeDto, Visitor } from '../../models/visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AccessVisitorHelperService } from './access-visitor-helper.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors/Visitor";
  private URL_POST_ENTRY_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_EXIT_VisitorInList = "http://localhost:8090/movements_exit/register";
  private URL_GET_LastEntryByDocument = "http://localhost:8090/movements_entry/last_entry_by_document?document=";
  private URL_GET_LastExitByDocument = "http://localhost:8090/movements_exit/last_exit_by_document?document=";

  //URL para la pantalla (registrar invitado que no esta en la lista)
  private URL_POST_ENTRY_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  private readonly http: HttpClient = inject(HttpClient);
  private readonly helperService = inject(AccessVisitorHelperService);
  constructor() {
    this.loadVisitorsData();
  }

  //lista de Visitors
  visitorslist : User_AllowedInfoDto[] = [];

  loadVisitorsData(): void {

    this.getVisitorsData().subscribe({
      next: (data: User_AllowedInfoDto[]) => {
        this.visitorslist = data; // Asigna los datos una vez que se reciban
        //console.log("data en el service: ", data);
        //console.log("visitorslist en el service: ", this.visitorslist);

      },
      error: (error) => {
        console.error('Error al cargar los datos de los Visitors:', error);
      }
    });
  }

  GetVisitorsList(): User_AllowedInfoDto[]{
    return [...this.visitorslist]
  }

  //filtra la list de Visitors
  getVisitorByParam(parameter: string): User_AllowedInfoDto[] {

    //console.log("el cambio: " + parameter);

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

  //Llamadas a Endpoints de la API:
  // METODO: getAllUserAllowedVisitors(@PathVariable String visitor)
  getVisitorsData(): Observable<User_AllowedInfoDto[]> {
    return this.http.get<User_AllowedInfoDto[]>(this.URL_GET_ALL_Visitors);
  }

  // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
  postVisitorEntry(movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_ENTRY_VisitorInList, movement, { headers });
  }

  // METODO: registerMovement_Exit(@RequestBody NewMovements_ExitDto movementsExitDto)
  postVisitorExit(movement: NewMovement_ExitDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_EXIT_VisitorInList, movement, { headers });
  }

  // METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)
  getVisitorLastEntry(document: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.URL_GET_LastEntryByDocument}${encodeURIComponent(document)}`;
    return this.http.get<any>(url, { headers });
  }

    // METODO: getUserAllowedLastExitByDocument(@RequestParam String document)
    getVisitorLastExit(document: string): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const url = `${this.URL_GET_LastExitByDocument}${encodeURIComponent(document)}`;
      return this.http.get<any>(url, { headers });
    }


  // METODO: registerMovementEntryIfNotExists(
    // @RequestParam String documento,
    // @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate date,
    // @RequestBody(required = false) NewMovements_EntryDto movementsEntryDto) {
  postUnregisteredVisitorEntry(document: string, date: string, movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_ENTRY_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }  



  //METODOS (para registrar Ingresos y Egresos)

  //Registrar EGRESO de un visitante
  RegisterExit(visitor :User_AllowedInfoDto): void{

    //verifica si su ultimo movimiento fue Ingreso (para poder Egresar correctamente)
    //post en la URL
    this.getVisitorLastEntry(visitor.document).subscribe({
      next: (response) => {
          //si la API devolvio la info correctamente, sigue el proceso
          console.log("response de getVisitorLastEntry(): ", response);
          const lastEntry: LastEntryUserAllowedDto = response;

          this.getVisitorLastExit(visitor.document).subscribe({
            next: (response) => {
                //si la API devolvio la info correctamente, sigue el proceso
                console.log("response de getVisitorLastExit(): ", response);
                const lastExit: LastExitUserAllowedDto = response;
      
                //si alguna de las fechas es null (en caso de q no haya un Ingreso y/o Egreso del Visitor), 
                // se le asigna una nueva fecha de ingreso/egreso, asegurando q el ultimo Egreso es mayor,
                // fallando la 2da condicion a proposito. (todo esto pq el atributo movementDatetime puede ser Date o null)

                console.log("lastExitAux: ");
                const lastExitAux: Date | null = this.helperService.processDate(lastExit.movementDatetime);
                console.log("lastEntryAux: ");
                const lastEntryAux: Date | null = this.helperService.processDate(lastEntry.movementDatetime);

                const lastExitDateTime: Date = lastExitAux || new Date("2001-12-15");
                const lastEntryDateTime: Date = lastEntryAux || new Date("2000-10-12");

                const isFirstEntry: boolean = lastEntry.firstEntry;
                const isFirstExit: boolean = lastExit.firstExit;

                //1ra condicion: si isFirstEntry es false, ya tiene un ingreso previo, y si isFirstExit es true, es la 1ra vez q 
                // egresa, por ende tiene permitido el egreso.
                //2da condicion: si la fecha y hora del ultimo Ingreso es mayor a la del ultimo Egreso, puede salir.
                if((!isFirstEntry && isFirstExit) 
                    || (lastEntryDateTime > lastExitDateTime)){

                    console.log("Egreso permitido (paso el if de los movements)");

                    //verifica observations
                    if(visitor.observations == undefined){
                      visitor.observations = "";
                    }
            
                    // verifica si esta dentro de rango (fechas permitidas)
                    let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
                    if(indexAuthRange >= 0){
                
                      // verifica si esta dentro de rango (dia y horario permitido)
                      let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
                      if(indexDayAllowed >= 0){
                        
                        // mapeos
                        const newUserAllowedDto: NewUserAllowedDto = 
                          this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
                        const newAuthRangeDto: NewAuthRangeDto = 
                          this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);
                
                        //se crea el objeto (q se va a pasar por el body en el post)
                        const newMovement_ExitDto: NewMovement_ExitDto = 
                          this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);
                
                        //post en la URL
                        this.postVisitorExit(newMovement_ExitDto).subscribe({
                          next: (response) => {
                            this.helperService.registerExitSuccess(newMovement_ExitDto);
                          },
                          error: (error) => {
                            this.helperService.registerExitError();
                            console.log(error);
                          }
                        });
                
                      } else {
                        //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
                        this.helperService.exitLaterThanAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
                        return;
                
                      }
                
                    } else {
                      //se dispara si el Visitor esta fuera de rango (fechas permitidas)
                      this.helperService.exitLaterThanAuthorizedDateRange(visitor);
                      return; // se termina la ejecucion del metodo (no se registra el ingreso)
                    }
                } else {

                  this.helperService.exitNotAllowed();
                  return;
                }
      
              },
            error: (error) => {
                this.helperService.getlastExitError();
                console.log(error);
              }
          });
        },
      error: (error) => {
          this.helperService.getLastEntryError();
          console.log(error);
        }
    });

  }
  //FIN Registrar EGRESO de un visitante








 //Registrar INGRESO de un visitante
 RegisterAccess(visitor :User_AllowedInfoDto): void{

  //verifica si su ultimo movimiento fue Ingreso (para poder Egresar correctamente)
  //post en la URL
  this.getVisitorLastEntry(visitor.document).subscribe({
    next: (response) => {
        //si la API devolvio la info correctamente, sigue el proceso
        console.log("response de getVisitorLastEntry(): ", response);
        const lastEntry: LastEntryUserAllowedDto = response;

        this.getVisitorLastExit(visitor.document).subscribe({
          next: (response) => {
              //si la API devolvio la info correctamente, sigue el proceso
              console.log("response de getVisitorLastExit(): ", response);
              const lastExit: LastExitUserAllowedDto = response;
    
              //si alguna de las fechas es null (en caso de q no haya un Ingreso y/o Egreso del Visitor), 
              // se le asigna una nueva fecha de ingreso/egreso, asegurando q el ultimo Egreso es mayor,
              // fallando la 2da condicion a proposito. (todo esto pq el atributo movementDatetime puede ser Date o null)

              console.log("lastExitAux: ");
              const lastExitAux: Date | null = this.helperService.processDate(lastExit.movementDatetime);
              console.log("lastEntryAux: ");
              const lastEntryAux: Date | null = this.helperService.processDate(lastEntry.movementDatetime);

              const lastExitDateTime: Date = lastExitAux || new Date("2001-12-15");
              const lastEntryDateTime: Date = lastEntryAux || new Date("2000-10-12");

              const isFirstEntry: boolean = lastEntry.firstEntry;
              const isFirstExit: boolean = lastExit.firstExit;

              //1ra condicion: si isFirstEntry es true, osea es su 1er ingreso, y si isFirstExit es true, osea q todavia no tiene 
              // ningun egreso regsitrado, se puede registrar el ingreso.
              //2da condicion: si la fecha y hora del ultimo Egreso es mayor a la del ultimo Ingreso, puede entrar.
              if((isFirstEntry && isFirstExit) || (lastEntryDateTime < lastExitDateTime)){

                //verifica observations
                if(visitor.observations == undefined){
                  visitor.observations = "";
                }

                // verifica si esta dentro de rango (fechas permitidas)
                let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
                if(indexAuthRange >= 0){

                  // verifica si esta dentro de rango (dia y horario permitido)
                  let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
                  if(indexDayAllowed >= 0){
                    
                    // mapeos
                    const newUserAllowedDto: NewUserAllowedDto = 
                      this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
                    const newAuthRangeDto: NewAuthRangeDto = 
                      this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);

                    //se crea el objeto (q se va a pasar por el body en el post)
                    const newMovements_EntryDto: NewMovements_EntryDto = 
                      this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

                    //post en la URL
                    this.postVisitorEntry(newMovements_EntryDto).subscribe({
                      next: (response) => {
                        this.helperService.registerEntrySuccess(newMovements_EntryDto);
                      },
                      error: (error) => {
                        this.helperService.registerEntryError();
                      }
                    });

                  } else {
                    //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
                    this.helperService.entryOutOfAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
                    return;

                  }

                } else {
                  //se dispara si el Visitor esta fuera de rango (fechas permitidas)
                  this.helperService.entryOutOfAuthorizedDateRange(visitor);
                  return; 
                }

                    
              } else {

                this.helperService.entryNotAllowed();
                return;
              }
    
            },
          error: (error) => {
              this.helperService.getlastExitError();
              console.log(error);
            }
        });
      },
    error: (error) => {
        this.helperService.getLastEntryError();
        console.log(error);
      }
  });

}
// FIN Registrar INGRESO de un visitante
  // FIN METODOS (para registrar Ingresos y Egresos)

}
