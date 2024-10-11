import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Visitor } from '../../../models/visitors/VisitorsModels';

@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent {

  // para mostrar visitantes en tabla
  visitors: Visitor[] = [];

  //datos de busqueda/filtrado
  param: string | null = null;

  //buscar vistantes por parametro (Nombre y/o DNI)
  Search(param: string | null): Visitor[] {

    if(param != null && param?.length > 2){
      return this.visitors.filter(v => (v.document === param || 
        v.name === param || 
        v.lastName === param) 
      );
    }

    return this.visitors;
  }

  //volver a pantalla anterior
  Return(){
    
  }

  //mostrar mas info de un visitante
  MoreInfo(v : Visitor){

  }

  //registrar egreso de un visitante
  RegisterExit(v :Visitor){

  }

  //registrar ingreso de un visitante
  RegisterAccess(v :Visitor){

  }

  // escanear QR de un visitante, guardar la lista de visitantes en el front para registrar Ingreso/Egreso
  ScanQR(){

  }

  // agregar un visitante que no esta en una lista, pero tiene autorizacion del Propietario/Inquilino
  AddVisitor(){

  }

}
