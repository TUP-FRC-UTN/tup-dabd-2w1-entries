import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VisitorDto } from '../../../models/visitors/VisitorDto';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent {

  // para mostrar visitantes en tabla
  visitors: VisitorDto[] = [];

  //datos de busqueda/filtrado
  param: string | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  //buscar vistantes por parametro (Nombre y/o DNI)
  Search(){

  }

  //volver a pantalla anterior
  Return(){
    
  }

  //mostrar mas info de un visitante
  MoreInfo(v : VisitorDto){

  }

  //registrar egreso de un visitante
  RegisterExit(v :VisitorDto){

  }

  //registrar ingreso de un visitante
  RegisterAccess(v :VisitorDto){

  }

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR(){

  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor(){

  }

}
