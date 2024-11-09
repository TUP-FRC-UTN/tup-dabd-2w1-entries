import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessAllowedDaysDto, AuthRangeInfoDto, AccessDocumentTypeDto, AccessLastEntryUserAllowedDto, AccessLastExitUserAllowedDto, AccessNewAuthRangeDto, AccessNewMovementExitDto, AccessNewMovementsEntryDto, AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto, AccessUserAllowedTypeDto, VehicleTypeDto, AccessVisitor } from '../../models/access-visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AccessVisitorHelperService } from './access-visitor-helper.service';
import Swal from 'sweetalert2';
import { error } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors/Visitor";
  private URL_POST_ENTRY_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_EXIT_VisitorInList = "http://localhost:8090/movements_exit/register";
  private URL_GET_LastEntryByDocument = "http://localhost:8090/movements_entry/last_entry_by_document?document=";
  private URL_GET_LastExitByDocument = "http://localhost:8090/movements_exit/last_exit_by_document?document=";
  private URL_GET_ALL_UserAllowed = "http://localhost:8090/user_Allowed/getAllUsersAllowed";

  private URL_POST_VALIDATE_QR = 'http://localhost:8090/visitor-qr';

  //URL para la pantalla (registrar invitado que no esta en la lista)
  private URL_POST_ENTRY_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  private readonly http: HttpClient = inject(HttpClient);
  private readonly helperService = inject(AccessVisitorHelperService);
  constructor() {
    this.loadVisitorsData();
  }

  //lista de Visitors
  visitorslist : AccessUserAllowedInfoDto[] = [];

  validateQrCode(qrCode: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.URL_POST_VALIDATE_QR}/validate`, { qrCode });
  }


  //trae TODOS los UserAllowed
  getAllUserAllowedData(): Observable<AccessUserAllowedInfoDto[]> {
    return this.http.get<AccessUserAllowedInfoDto[]>(this.URL_GET_ALL_UserAllowed);
  }

  loadVisitorsData(): void {

    this.getVisitorsData().subscribe({
      next: (data: AccessUserAllowedInfoDto[]) => {
        this.visitorslist = data; // Asigna los datos una vez que se reciban
        //console.log("data en el service: ", data);
        //console.log("visitorslist en el service: ", this.visitorslist);

      },
      error: (error) => {
        console.error('Error al cargar los datos de los Visitors:', error);
      }
    });
  }

  GetVisitorsList(): AccessUserAllowedInfoDto[]{
    return [...this.visitorslist]
  }

  //filtra la list de Visitors
  getVisitorByParam(parameter: string): AccessUserAllowedInfoDto[] {

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
  getVisitorsData(): Observable<AccessUserAllowedInfoDto[]> {
    return this.http.get<AccessUserAllowedInfoDto[]>(this.URL_GET_ALL_Visitors);
  }

  // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
  postVisitorEntry(movement: AccessNewMovementsEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_ENTRY_VisitorInList, movement, { headers });
  }

  // METODO: registerMovement_Exit(@RequestBody NewMovements_ExitDto movementsExitDto)
  postVisitorExit(movement: AccessNewMovementExitDto): Observable<any> {
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
  postUnregisteredVisitorEntry(document: string, date: string, movement: AccessNewMovementsEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_ENTRY_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }  



  //METODOS (para registrar Ingresos y Egresos)
  RegisterExit(visitor: AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean> {
    return new Observable<boolean>((observer) => {

          // proceso de registro
          if (visitor.observations == undefined) {
            visitor.observations = "";
          }
          const newUserAllowedDto = this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor, vehiclePlate);
          const newAuthRangeDto = this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);
          const newMovement_ExitDto = this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);


          let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
          if (indexAuthRange >= 0) {

            let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
            if (indexDayAllowed >= 0) {
              //Egreso en rangos autorizados (fecha y hora)
              this.postVisitorExit(newMovement_ExitDto).subscribe({
                next: (response) => {
                  console.log("RegisterExit response: ", response);
                  if(response.status !== 409){
                    this.helperService.registerExitSuccess(newMovement_ExitDto);
                    //return true;
                    observer.next(true);
                    observer.complete();
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                  
                },
                error: (error) => {
                  console.log("RegisterExit error: ", error);
                  if(error.status != 409){
                    this.helperService.registerExitError();
                    //return false;
                    observer.next(false);
                    observer.complete();
                    
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });

            } else {
              //Egreso en rango de fecha autorizado, pero NO en rango horario
              this.postVisitorExit(newMovement_ExitDto).subscribe({
                next: (response) => {
                  console.log("RegisterExit response: ", response);
                  if(response.status !== 409){
                    this.helperService.hourLateExitRegistered(visitor.authRanges.at(indexAuthRange));
                    //return true;
                    observer.next(true);
                    observer.complete();
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                  
                },
                error: (error) => {
                  console.log("RegisterExit error: ", error);
                  if(error.status != 409){
                    this.helperService.registerExitError();
                    //return false;
                    observer.next(false);
                    observer.complete();
                    
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });
            }

          } else {
              //Egreso en rangos NO autorizados (fecha y hora)
              this.postVisitorExit(newMovement_ExitDto).subscribe({
                next: (response) => {
                  console.log("RegisterExit response: ", response);
                  if(response.status !== 409){
                    this.helperService.dateLateExitRegistered(visitor);
                    //return true;
                    observer.next(true);
                    observer.complete();
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                  
                },
                error: (error) => {
                  console.log("RegisterExit error: ", error);
                  if(error.status != 409){
                    this.helperService.registerExitError();
                    //return false;
                    observer.next(false);
                    observer.complete();
                    
                  } else {
                    this.helperService.exitNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });
          }
    });
  }
  





  
RegisterAccess(visitor :AccessUserAllowedInfoDto, vehiclePlate: string): Observable<boolean> {
  return new Observable<boolean>((observer) => {

          // proceso de registro
          //verifica observations
          if(visitor.observations == undefined){
            visitor.observations = "";
          }
          // verifica si esta dentro de rango (fechas permitidas)
          let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
          if(indexAuthRange >= 0){

            // verifica si esta dentro de rango (dia y horario permitido)
            let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
            console.log("(registrando el ingreso) indexDayAllowed:", indexDayAllowed);
            if(indexDayAllowed >= 0){
              
              // mapeos
              const newUserAllowedDto: AccessNewUserAllowedDto = 
                this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor, vehiclePlate);
              const newAuthRangeDto: AccessNewAuthRangeDto = 
                this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);

              //se crea el objeto (q se va a pasar por el body en el post)
              const newMovements_EntryDto: AccessNewMovementsEntryDto = 
                this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

              //post en la URL
              this.postVisitorEntry(newMovements_EntryDto).subscribe({
                next: (response) => {
                  console.log("(access-visitors-service) -> Register Access response: ", response);
                  
                  if(response.status !== 409){
                    this.helperService.registerEntrySuccess(newMovements_EntryDto);
                    //return true;
                    observer.next(true);
                    observer.complete();   

                  } else {
                    this.helperService.entryNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                },
                error: (error) => {
                  console.log("(access-visitors-service) -> Register Access error: ", error);

                  if(error.status != 409){
                    this.helperService.registerEntryError();
                    //return false;
                    observer.next(false);
                    observer.complete();

                  } else {
                    this.helperService.entryNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });

            } else {
              //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
              this.helperService.entryOutOfAuthorizedHourRange(visitor.authRanges.at(indexAuthRange));
              //return false;
              observer.next(false);
              observer.complete();

            }

          } else {
            //se dispara si el Visitor esta fuera de rango (fechas permitidas)
            this.helperService.entryOutOfAuthorizedDateRange(visitor);
            //return false;
            observer.next(false);
            observer.complete();
          }
  });
}
  // FIN Registrar INGRESO de un visitante
// FIN METODOS (para registrar Ingresos y Egresos)
}
