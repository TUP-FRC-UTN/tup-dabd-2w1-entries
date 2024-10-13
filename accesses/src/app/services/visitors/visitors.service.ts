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

      //MOMENTANEO 
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

      //la idea es q nunca se use (pq en el component ya se verifica si el Visitor puede entrar, 
      // en base a sus AuthRanges, solo se llega a este metodo si el Visitor esta dentro del rango)
      const allowedDaysEmpty: Allowed_DaysDto[] = [];
      //la idea es q nunca se use
      const emptyAuth: NewAuthRangeDto = {
        neighbor_id: 0,
        init_date: "", //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
        end_date: "", //LocalDate (EJ: "2024-10-10" / "yyyy-MM-dd")
        allowedDaysDtos: allowedDaysEmpty
      };

      //fecha actual, para poder comparar
      let todayDate: Date = new Date();
      todayDate.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00
      
      //agarra un AuthRange (del Visitor) q comprenda la fecha actual
      for (var i = 0; i < listAuthRangeInfoDto.length; i++) {
        let initDate = listAuthRangeInfoDto.at(0)?.init_date;
        let endDate = listAuthRangeInfoDto.at(0)?.end_date;

        if(this.isDateBeforeToday(initDate, todayDate) && this.isDateAfterToday(endDate, todayDate)){
          //se pasa del objeto Date a un string (con el formato requerido por el endpoint)
          let stringInit_date: string | undefined = this.datePipe.transform( initDate,'yyyy-MM-dd')?.toString();
          let stringEnd_date: string | undefined = this.datePipe.transform( endDate,'yyyy-MM-dd')?.toString();

          //se mapea de AuthRangeInfoDto a NewAuthRangeDto
          let newAuthRangedto: NewAuthRangeDto = {
            neighbor_id: 0, //se asigna en el back
            init_date: stringInit_date || "", 
            end_date: stringEnd_date  || "", 
            allowedDaysDtos: listAuthRangeInfoDto.at(0)?.allowedDays || allowedDaysEmpty
          };

          console.log("array de objs q entra -> AuthRangeInfoDto[]: ", listAuthRangeInfoDto);
          console.log("obj q sale -> NewUserAllowedDto: ", newAuthRangedto);
          //devuelve un NewAuthRangeDto con los datos, de un AuthRange del Visitor, validos.
          return newAuthRangedto;
        }
      }
      console.log("Algo malio sal...")
      console.log("array de objs q entra -> AuthRangeInfoDto[]: ", listAuthRangeInfoDto);
      console.log("obj (vacio) q sale -> NewAuthRangeDto: ", emptyAuth);
      //la idea es q nunca se use
      return emptyAuth;
    }
    // FIN mapeo de AuthRangeInfoDto a NewAuthRangeDto
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


  //funciones para comparar fechas
  isDateBeforeToday(date: Date | undefined, todayDate: Date): boolean {
    if (!date) {
      // Si date es undefined, devolver false
      return false;
    }
  
    // Convertimos ambas fechas a tiempo en milisegundos para compararlas
    return date.getTime() < todayDate.getTime();
  }
  isDateAfterToday(date: Date | undefined, todayDate: Date): boolean {
    if (!date) {
      // Si date es undefined, devolver false
      return false;
    }
  
    // Convertimos ambas fechas a tiempo en milisegundos para compararlas
    return date.getTime() > todayDate.getTime();
  }
}
