import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User_AllowedInfoDto, Visitor } from '../../../models/visitors/VisitorsModels';
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
  RegisterAccess(visitor :User_AllowedInfoDto){
    // verificar si esta dentro de rango (fecha y hora)

    // mapeos

    //post en la URL

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
