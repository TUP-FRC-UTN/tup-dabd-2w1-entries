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
      let index = this.todayIsInDateRange(listAuthRangeInfoDto);
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


// funciones para comparar FECHAS
  // verifica si la fecha actual esta dentro de alguno de los AuthRangeInfoDto del Visitor
  todayIsInDateRange(listAuthRangeInfoDto: AuthRangeInfoDto[]): number{
    for (var i = 0; i < listAuthRangeInfoDto.length; i++) {

      //console.log("todayIsInDateRange (en visitors.service) | ciclo del for: ", i);
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
// FIN funciones para comparar FECHAS

// funciones para comparar HORAS
    //devuelve el index del AllowedDayDto valido, dentro de la list authRangeInfoDto.allowedDays
    todayIsAllowedDay(authRangeInfoDto: AuthRangeInfoDto | undefined): number{

      if(authRangeInfoDto != undefined){
        for (var i = 0; i < authRangeInfoDto.allowedDays.length; i++) {
    
          console.log("todayIsInHourRange (en visitors.service) | ciclo del for: ", i);
    
          if(this.isTodayAnAllowedDay(authRangeInfoDto.allowedDays.at(i))){
            console.log("(Visitor dentro del rango horario!) index del AllowedDayDto valido: ", i);
            return i; // devuelve el indice donde esta el allowedDayDto valido
          }
        }
      }

      return -1; // no hay rango q comprenda el DIA y HORA actual
    }

    // verifica si el Visitor esta dentro de un DIA permitido, y dentro del rango HORARIO permitido
    isTodayAnAllowedDay(allowedDayDto: Allowed_DaysDto | undefined): boolean {
      console.log("Metodo isTodayAnAllowedDay...");
    
      // Verifica si los datos están definidos
      if (!allowedDayDto?.day || !allowedDayDto?.init_hour || !allowedDayDto?.end_hour) {
        console.log("AllowedDay es undefined");
        return false;
      }
    
      // Formato de día (yyyy-MM-dd)
      let dayWrongFormat = allowedDayDto.day;
      let day = dayWrongFormat.at(0)+ "-" + dayWrongFormat.at(1)+ "-" + dayWrongFormat.at(2) + "T";

      // 
      let initDateTimeString = this.stringToHour(day, allowedDayDto, true); // 
      let endDateTimeString = this.stringToHour(day, allowedDayDto, false);
      console.log("initDateTimeString: ", initDateTimeString);
      console.log("endDateTimeString: ", endDateTimeString);

      // crea el initHour y endHour en formato Date (para poder comparar)
      let initDate = new Date(initDateTimeString);
      let endDate = new Date(endDateTimeString);
    
      // valida q las fechas sean validas
      if (isNaN(initDate.getTime()) || isNaN(endDate.getTime())) {
        console.log("Fechas inválidas");
        return false;
      }
    
      // fecha y hora actual para comparar
      let todayDate = new Date();
      
      console.log("Fecha actual:", todayDate);
      console.log("AllowedDay inicio:", initDate);
      console.log("AllowedDay fin:", endDate);
    
      // compara si la fecha actual esta dentro del rango horario permitido
      return initDate <= todayDate && endDate >= todayDate;
    }
    

    //metodo q devuelve strings para crear objetos Date
    stringToHour(day: string, allowedDayDto: Allowed_DaysDto, x: boolean): string {
      let response = day;
      const hours = x ? allowedDayDto.init_hour : allowedDayDto.end_hour;
    
      // Función auxiliar para formatear la hora
      const formatHour = (hour: unknown): string => {
        if (typeof hour === 'string') {
          return hour.padStart(2, '0');
        } else if (typeof hour === 'number') {
          return hour.toString().padStart(2, '0');
        }
        return '00';
      };
    
      // Formatear horas y minutos
      const formattedHours = formatHour(hours?.[0]);
      const formattedMinutes = formatHour(hours?.[1]);
    
      // Construir la respuesta
      response += `${formattedHours}:${formattedMinutes}:00`;
    
      return response;
    }

// FIN funciones para comparar HORAS


//codigo ineficaz:
// isTodayAnAllowedDay(allowedDayDto: Allowed_DaysDto | undefined): boolean{

//   console.log("Metodo isTodayAnAllowedDay")

//   if(allowedDayDto?.day == undefined || allowedDayDto?.end_hour == undefined || allowedDayDto?.end_hour == undefined){
//     console.log("AllowedDay es undefined");
//     return false;
//   }

//   // dia en String (yyyy-MM-dd)
//   let day = allowedDayDto.day;
//   let dayString = day.at(0) + "-" + day.at(1) + "-" + day.at(2) + "T";

//   // hora y minuto del inicio y fin (del dia permitido / dayAllowedDto)
//   let initHour = allowedDayDto.init_hour;  
//   let endHour = allowedDayDto.end_hour;

//   // se crea el string (formato: "2024-10-10T14:30:00") para luego crear el objeto Date a comparar
//   // DIA permitido con la HORA de inicio //Ej: "2024-10-10"
//   let initHourString = dayString; 
//   // DIA permitido con la HORA de fin //Ej: "2024-10-10"
//   let endHourString = dayString;

//   for (var i = 0; i < initHour.length; i++) {
//     if(initHour.at(i) == "0"){
//       initHour += "00";
//     } else {
//       initHour += initHour.at(i);
//     }

//     if(i == 0 || i == 1){
//       initHour += ":";
//     }
//     if(i == 1){
//       initHour += "00";
//     }
//   }

//   for (var i = 0; i < endHour.length; i++) {
//     if(endHour.at(i) == "0"){
//       endHour += "00";
//     } else {
//       endHour += initHour.at(i);
//     }

//     if(i == 0 || i == 1){
//       endHour += ":";
//     }
//     if(i == 1){
//       endHour += "00";
//     }
//   }

//   console.log("alloweddayDto.init_hour = ", initHour);
//   console.log("alloweddayDto.end_hour = ", endHour);
//   console.log("////////////////////////////////////////////")


//   // console.log("Datos del AllowedDayDto...")
//   // console.log("dia en formato Date: ", day, " = yyyy-MM-dd");
//   // console.log("initHourString: ", initHourString);
//   // console.log("endHourString: ", endHourString);

//   console.log("////////////////////////////////////////////")
//   console.log("Datos procesados...")
//   // DIA y HORA actual
//   let todayDateAndHour = new Date();
//   console.log("fecha actual: ", todayDateAndHour);
//   // dia con hora inicio y con hora fin, en Date
//   // DIA permitido con la HORA de inicio (en formato Date para poder comparar)
//   let initDate: Date = new Date(initHourString);
//   console.log("AllowedDay inicio: ", initDate);
//   // DIA permitido con la HORA de fin (en formato Date para poder comparar)
//   let endDate: Date = new Date(endHourString);
//   console.log("AllowedDay fin: ", endDate);

//   return initDate <= todayDateAndHour && endDate >= todayDateAndHour;
// }
}
