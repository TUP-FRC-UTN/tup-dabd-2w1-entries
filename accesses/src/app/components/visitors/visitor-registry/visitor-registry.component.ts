import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User_AllowedInfoDto, Visitor } from '../../../models/visitors/VisitorsModels';
import Swal from 'sweetalert2';
import { VisitorsService } from '../../../services/visitors/visitors.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent implements OnInit {

  subscriptions = new Subscription();

  private readonly visitorService = inject(VisitorsService);
  constructor(){}

  //carga TODOS los invitados al iniciar la pantalla
  ngOnInit(): void {
    this.visitorService.getVisitorsData("Visitor").subscribe((data) => {
      this.visitors = data;
    });
  }

  // lista de Visitors
  visitors: User_AllowedInfoDto[] = [];
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
    const vehicleInfo = visitor.vehicles ? 
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

  }

  //registrar ingreso de un visitante
  RegisterAccess(visitor :User_AllowedInfoDto){

  }

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR(){

  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor(){

  }

  //volver a pantalla anterior
  Return(){
    
  }

}
