import { Component } from '@angular/core';
import { Visitor } from '../../../models/visitors/VisitorsModels';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visitor-register-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-register-entry.component.html',
  styleUrl: './visitor-register-entry.component.css'
})
export class VisitorRegisterEntryComponent {

  // visitor: Visitor = { name: 'John', lastName: 'Doe', document: '123456', phoneNumber: '555-1234', 
  //                      email: 'john.doe@example.com', hasVehicle: true, plate: 'ABC123', vehicleType: 'Car' };
  
  // observation = "";

  // ChangeFlag(){

  // }

  // Register(){

  // }
}
