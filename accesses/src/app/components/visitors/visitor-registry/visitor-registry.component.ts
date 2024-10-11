import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, SimpleChanges } from '@angular/core';
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

  // lista del QR con los Visitors
  // (visitors hardcodeados, hasta q se implemente la funcion de escanear QR)
  visitors: Visitor[] = [
    { name: 'John', lastName: 'Doe', document: '123456', phoneNumber: '555-1234', email: 'john.doe@example.com', hasVehicle: true, plate: 'ABC123', vehicleType: 'Car' },
    { name: 'Jane', lastName: 'Smith', document: '789012', phoneNumber: '555-5678', email: 'jane.smith@example.com', hasVehicle: false },
    { name: 'Alice', lastName: 'Johnson', document: '345678', phoneNumber: '555-8765', email: 'alice.johnson@example.com', hasVehicle: true, plate: 'XYZ987', vehicleType: 'Motorcycle' },
    { name: 'Bob', lastName: 'Brown', document: '901234', phoneNumber: '555-5432', email: 'bob.brown@example.com', hasVehicle: true, plate: 'LMN456', vehicleType: 'Truck' },
    { name: 'Charlie', lastName: 'White', document: '234567', phoneNumber: '555-6543', email: 'charlie.white@example.com', hasVehicle: false },
    { name: 'Eve', lastName: 'Green', document: '567890', phoneNumber: '555-7654', email: 'eve.green@example.com', hasVehicle: true, plate: 'JKL789', vehicleType: 'Car' },
    { name: 'Frank', lastName: 'Black', document: '678901', phoneNumber: '555-8765', email: 'frank.black@example.com', hasVehicle: false },
    { name: 'Grace', lastName: 'Silver', document: '789012', phoneNumber: '555-9876', email: 'grace.silver@example.com', hasVehicle: true, plate: 'QRS321', vehicleType: 'Bicycle' },
    { name: 'Hank', lastName: 'Gold', document: '890123', phoneNumber: '555-1098', email: 'hank.gold@example.com', hasVehicle: true, plate: 'TUV654', vehicleType: 'Scooter' },
    { name: 'Ivy', lastName: 'Blue', document: '012345', phoneNumber: '555-2109', email: 'ivy.blue@example.com', hasVehicle: false },
    { name: 'Jack', lastName: 'Orange', document: '567891', phoneNumber: '555-3210', email: 'jack.orange@example.com', hasVehicle: true, plate: 'WXY098', vehicleType: 'Van' }
  ];

  showVisitors = this.visitors;

// datos de búsqueda/filtrado
parameter: string | null = null;

// buscar visitantes por parámetro (Nombre o DNI)
Search(): void {
  console.log("el cambio: " + this.parameter);

  if (this.parameter != null && this.parameter.length > 2) {
    let param = this.parameter.toLowerCase();

    this.showVisitors = this.visitors.filter(v =>
      v.document.toLowerCase().includes(param) ||
      v.name.toLowerCase().includes(param) ||
      v.lastName.toLowerCase().includes(param)
    );
  } else {
    this.showVisitors = this.visitors;
  }
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
