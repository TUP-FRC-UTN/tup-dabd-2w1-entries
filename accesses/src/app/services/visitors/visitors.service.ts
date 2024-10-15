import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allowed_DaysDto, AuthRangeInfoDto, Document_TypeDto, NewAuthRangeDto, NewMovements_EntryDto, NewUserAllowedDto, NewVehicleDto, User_AllowedInfoDto, User_allowedTypeDto, VehicleTypeDto, Visitor } from '../../models/visitors/VisitorsModels';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors";
  private URL_POST_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  private readonly http: HttpClient = inject(HttpClient);

  constructor(private datePipe: DatePipe) {
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

  //post del registro de un visitor
    // mapeo de User_AllowedInfoDto a NewUserAllowedDto:
    mapUser_AllowedInfoDtoToNewUserAllowedDto(visitorInfoDto: User_AllowedInfoDto): NewUserAllowedDto {

      //NewVehicleDto vacio
      const emptyVehicleTypeDto: VehicleTypeDto = { description : "" };
      const emptyVehicleDto: NewVehicleDto = { plate: "", vehicle_Type: emptyVehicleTypeDto, insurance: ""}

      let visitorVehicle: NewVehicleDto | undefined ;

      //MOMENTANEO (en el futuro, el guardia debe poder seleccionar el vehiculo con el q entra el Visitor)
      //se verifica si el Visitor tiene un vehiculo
      if(visitorInfoDto.vehicles.length > 0){
        //si lo tiene se asigna
        visitorVehicle = visitorInfoDto.vehicles.at(0);
      } else {
        //si no se le asigna uno vacio
        visitorVehicle = emptyVehicleDto;
      }
      //MOMENTANEO 

      // se presuponen al ser un Visitor
      const typeDni: Document_TypeDto = { description : "DNI"};
      const allowedTypeVisitor: User_allowedTypeDto = { description : "Visitor"};

      //mapeo de los datos
      let newUserAllowedDto: NewUserAllowedDto = {
        document : visitorInfoDto.document,
        name : visitorInfoDto.name,
        last_name : visitorInfoDto.last_name,
        documentType: typeDni,
        user_allowed_Type: allowedTypeVisitor,
        vehicle: visitorVehicle,
        email: visitorInfoDto.email
      }
      console.log("obj q entra -> User_AllowedInfoDto: ", visitorInfoDto);
      console.log("obj q sale -> NewUserAllowedDto: ", newUserAllowedDto);
      return newUserAllowedDto;
    }
    // FIN mapeo de User_AllowedInfoDto a NewUserAllowedDto:

    // mapeo de AuthRangeInfoDto[] a NewAuthRangeDto
    mapAuthRangeInfoDtoToNewAuthRangeDto(listAuthRangeInfoDto: AuthRangeInfoDto[]): NewAuthRangeDto{

      console.log("mapAuthRangeInfoDtoToNewAuthRangeDto (en visitors.service)")
      console.log("list de AuthRangeInfoDto del Visitor", listAuthRangeInfoDto);

      //la idea es q nunca se usen (pq en el component ya se verifica si el Visitor puede entrar 
      // en base a sus AuthRanges, solo se llega a este metodo si el Visitor esta dentro del rango permitido)
      const allowedDaysEmpty: Allowed_DaysDto[] = [];
      const emptyAuth: NewAuthRangeDto = {
        neighbor_id: 0,
        init_date: "", 
        end_date: "", 
        allowedDaysDtos: allowedDaysEmpty
      };
      

      //agarra un AuthRange (del Visitor) q comprenda la fecha actual (pq tiene varios, entonces hay q agarrar el actual)
      let index = this.todayIsInRange(listAuthRangeInfoDto);
      // si hay uno valido index es mayor a -1 (index es el indice del Range valido, en el array de AuthRangeInfoDto)
      if(index >= 0){

        //fechas de inicio y fin del AuthRangeInfoDto valido
        let initDate = listAuthRangeInfoDto.at(index)?.init_date;
        let endDate = listAuthRangeInfoDto.at(index)?.end_date;
        //se pasa del objeto Date a un string (con el formato requerido por el endpoint)
        let stringInit_date: string | undefined = this.datePipe.transform( initDate,'yyyy-MM-dd')?.toString();
        let stringEnd_date: string | undefined = this.datePipe.transform( endDate,'yyyy-MM-dd')?.toString();

        //se mapea de AuthRangeInfoDto a NewAuthRangeDto
        let newAuthRangedto: NewAuthRangeDto = {
          neighbor_id: 0, //se asigna en el back
          init_date: stringInit_date || "", 
          end_date: stringEnd_date  || "", 
          allowedDaysDtos: listAuthRangeInfoDto.at(index)?.allowedDays || allowedDaysEmpty
        };
        console.log("FUNCIONAAAAAAAAA")
        console.log("array de objs q entra -> AuthRangeInfoDto[]: ", listAuthRangeInfoDto);
        console.log("obj q sale -> NewUserAllowedDto: ", newAuthRangedto);
        //devuelve un NewAuthRangeDto con los datos, de un AuthRange del Visitor, validos.
        return newAuthRangedto;
      }

      console.log("Algo malio sal...")
      console.log("array de objs q entra -> AuthRangeInfoDto[]: ", listAuthRangeInfoDto);
      console.log("obj (vacio) q sale -> NewAuthRangeDto: ", emptyAuth);
      //la idea es q nunca se use
      return emptyAuth;
    }
    // FIN mapeo de AuthRangeInfoDto a NewAuthRangeDto

    // creacion de NewMovements_EntryDto 
    createNewMovements_EntryDto(visitorInfo :User_AllowedInfoDto, 
      newUserAllowedDto: NewUserAllowedDto, 
      newAuthRangedto: NewAuthRangeDto): NewMovements_EntryDto{

        let newMovements_EntryDto: NewMovements_EntryDto = {
          movementDatetime: new Date, // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z"
          observations: visitorInfo.observations || "",
          newUserAllowedDto: newUserAllowedDto, //interface declarada mas abajo
          authRangesDto: newAuthRangedto, //interface declarada mas abajo
          vehiclesId: 0
        }

        console.log("createNewMovements_EntryDto (en visitors.service): ", newMovements_EntryDto);
        return newMovements_EntryDto;
    }
    // FIN creacion de User_AllowedInfoDto
  //FIN post del registro de un visitor



  //Llamadas a Metodos:
  // METODO: getAllUserAllowedVisitors(@PathVariable String visitor)
  getVisitorsData(): Observable<User_AllowedInfoDto[]> {
    return this.http.get<User_AllowedInfoDto[]>(`http://localhost:8090/user_Allowed/visitors/Visitor`);
  }

  // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
  postVisitor(movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_VisitorInList, movement, { headers });
  }

  //METODO: registerMovementEntryIfNotExists(
    // @RequestParam String documento,
    // @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate date,
    // @RequestBody(required = false) NewMovements_EntryDto movementsEntryDto) {
  postUnregisteredVisitor(document: string, date: string, movement: NewMovements_EntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }  


  // funciones para comparar FECHAS y HORAS 
  // verifica si la fecha actual esta dentro de alguno de los AuthRangeInfoDto del Visitor
  todayIsInRange(listAuthRangeInfoDto: AuthRangeInfoDto[]): number{
    for (var i = 0; i < listAuthRangeInfoDto.length; i++) {

      console.log("todayIsInRange (en visitors.service) | ciclo del for: ", i);
      //console.log("fechas del AuthRange: ", listAuthRangeInfoDto.at(i)?.init_date, " | ", listAuthRangeInfoDto.at(i)?.end_date)

      let initDate: Date | undefined = listAuthRangeInfoDto.at(i)?.init_date;
      let endDate: Date | undefined  = listAuthRangeInfoDto.at(i)?.end_date;
  
      //console.log("fechas asignadas para comparar: ", initDate, " | ", endDate)


      if(this.isDateBeforeToday(initDate) && this.isDateAfterToday(endDate)){
        console.log("(Visitor dentro del rango!) index del AuthRange valido: ", i);
        return i; // devuelve el indice donde esta el AuthRangeInfoDto valido
      }
    }
    return -1; // no hay rango q comprenda la fecha actual
  }
  

  isDateBeforeToday(date: Date | undefined): boolean {
    if (date == undefined) {
      // Si date es undefined, devolver false
      return false;
    }
  
    //fecha actual, para poder comparar
    let todayDate = new Date();
    //fecha a comparar
    let beforeDate = new Date(date);
    //console.log(beforeDate, " | hoy -> ", todayDate)

    return beforeDate <= todayDate;
  }

  isDateAfterToday(date: Date | undefined): boolean {
    if (date == undefined) {
      // Si date es undefined, devolver false
      return false;
    }

    //fecha actual, para poder comparar
    let todayDate = new Date();
    //fecha a comparar
    let afterDate = new Date(date);
    //console.log(afterDate, " | hoy -> ", todayDate)

    return afterDate >= todayDate;
  }
}
