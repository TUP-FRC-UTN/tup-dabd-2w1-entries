import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allowed_DaysDto, AuthRangeInfoDto, Document_TypeDto, NewAuthRangeDto, NewMovement_ExitDto, NewMovements_EntryDto, NewUserAllowedDto, NewVehicleDto, User_AllowedInfoDto, User_allowedTypeDto, VehicleTypeDto, Visitor } from '../../models/visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AccessVisitorHelperService } from './access-visitor-helper.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors";
  private URL_POST_ENTRY_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_EXIT_VisitorInList = "http://localhost:8090/movements_exit/register";

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
    return this.http.get<User_AllowedInfoDto[]>(`http://localhost:8090/user_Allowed/visitors/Visitor`);
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

  //METODO: registerMovementEntryIfNotExists(
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
            Swal.fire({
              icon: 'success',
              title: 'Egreso registrado!',
              text: `¡El Egreso de "${newMovement_ExitDto.newUserAllowedDto.name} ${newMovement_ExitDto.newUserAllowedDto.last_name}" fue registrado con éxito!`,
              confirmButtonColor: '#28a745',
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al registrar el Egreso. Inténtelo de nuevo.',
              confirmButtonText: 'Cerrar'        
            });
          }
        });

      } else {
        //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
        this.helperService.outOfAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
        return;

      }

    } else {
      //se dispara si el Visitor esta fuera de rango (fechas permitidas)
      this.helperService.outOfAuthorizedDateRange(visitor);
      return; // se termina la ejecucion del metodo (no se registra el ingreso)
    }
  }
  //FIN Registrar EGRESO de un visitante








  //Registrar INGRESO de un visitante
  RegisterAccess(visitor: User_AllowedInfoDto): void{
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
            Swal.fire({
              icon: 'success',
              title: 'Ingreso registrado!',
              text: `¡El Ingreso de "${newMovements_EntryDto.newUserAllowedDto.name} ${newMovements_EntryDto.newUserAllowedDto.last_name}" fue registrado con éxito!`,
              confirmButtonColor: '#28a745',
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al registrar el Ingreso. Inténtelo de nuevo.',
              confirmButtonText: 'Cerrar'        
            });
          }
        });

      } else {
        //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
        this.helperService.outOfAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
        return;

      }

    } else {
      //se dispara si el Visitor esta fuera de rango (fechas permitidas)
      this.helperService.outOfAuthorizedDateRange(visitor);
      return; // se termina la ejecucion del metodo (no se registra el ingreso)
    }

  }
  // FIN Registrar INGRESO de un visitante
  // FIN METODOS (para registrar Ingresos y Egresos)

}
