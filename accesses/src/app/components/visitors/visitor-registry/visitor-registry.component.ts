import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthRangeInfoDto, NewAuthRangeDto, NewMovements_EntryDto, NewUserAllowedDto, User_AllowedInfoDto, Visitor } from '../../../models/visitors/VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/visitors/visitors.service';
import { Subscription } from 'rxjs';
import { AutoSizeTextAreaDirective } from '../../../directives/auto-size-text-area.directive';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoSizeTextAreaDirective],
  providers: [DatePipe, VisitorsService],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent implements OnInit {

  subscriptions = new Subscription();

  private readonly visitorService = inject(VisitorsService);
  constructor(){}


  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    this.loadVisitorsList();
  }

  loadVisitorsList(){
    const subscriptionAll=this.visitorService.getVisitorsData().subscribe({
      next:(data)=>{
        this.visitors = data;
        this.showVisitors = this.visitors;
        //console.log("data en el component: ", data);
        console.log("visitors en el component: ", this.visitors);
      }
    })
    this.subscriptions.add(subscriptionAll);
  }

  // lista de Visitors
  visitors: User_AllowedInfoDto[] | null = null;
  // lista de Visitors que se muestran en pantalla
  showVisitors = this.visitors;

  // datos de búsqueda/filtrado
  parameter: string = "";

  // buscar visitantes por parámetro (Nombre o DNI)
  Search(param: string): void {
    this.showVisitors = this.visitorService.getVisitorByParam(param);
  }

  // mostrar más info de un visitante
  MoreInfo(visitor: User_AllowedInfoDto) {
    const vehicleInfo = visitor.vehicles && visitor.vehicles.length > 0 ? 
      `<strong>Patente del vehículo: </strong>${visitor.vehicles[0].plate}` : 
      '<strong>No tiene vehículo</strong>';

    Swal.fire({
      title: 'Información del Visitante',
      html: `
        <strong>Nombre:</strong> ${visitor.name} ${visitor.last_name}<br>
        <strong>Documento:</strong> ${visitor.document}<br>
        <strong>Email:</strong> ${visitor.email}<br>
        ${vehicleInfo}
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  //registrar egreso de un visitante
  RegisterExit(visitor :User_AllowedInfoDto){
    Swal.fire({
      title: 'Función en desarrollo!',
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  //registrar ingreso de un visitante
  RegisterAccess(visitor :User_AllowedInfoDto): void{
    //verificar observations
    if(visitor.observations == undefined){
      visitor.observations = "";
    }

    // verificar si esta dentro de rango (fecha y hora)
    if(this.visitorService.todayIsInRange(visitor.authRanges) >= 0){

      // mapeos
      const newUserAllowedDto: NewUserAllowedDto = 
        this.visitorService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
      const newAuthRangeDto: NewAuthRangeDto = 
        this.visitorService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges);

      //se crea el objeto (q se va a pasar por el body en el post)
      const newMovements_EntryDto: NewMovements_EntryDto = 
        this.visitorService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

      //post en la URL
      this.visitorService.postVisitor(newMovements_EntryDto).subscribe({
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
      this.visitorIsOutOfAuthorizedRange(visitor);
      return; // se termina la ejecucion del metodo (no se registra el ingreso)
    }

  }

  // muestra un modal avisando q el Visitor esta fuera del AuthRange
  visitorIsOutOfAuthorizedRange(visitor: User_AllowedInfoDto){
    console.log("metodo RegisterAccess (en visitor-registry.component): el Visitor esta fuera de rango autorizado");

      // Generar HTML dinámicamente
    let rangesHtml = '';
    for (const range of visitor.authRanges) {

      console.log(range);

      rangesHtml += `
        <p>
          <strong>Fecha de inicio: </strong> ${range.init_date}<br>
          <strong>Fecha de fin: </strong> ${range.end_date}
        </p>
      `;
    }

    Swal.fire({
      title: 'Denegar ingreso!',
      html: `
        <strong>El Visitante está fuera de rango!</strong>
        ${rangesHtml}
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR(){
    Swal.fire({
      title: 'Función en desarrollo!',
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor(){

  }

  //volver a pantalla anterior
  Return(){
    
  }

}
