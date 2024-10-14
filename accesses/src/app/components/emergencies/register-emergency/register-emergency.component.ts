import { NgClass } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EmergenciesService } from '../../../services/emergencies/emergencies.service';
import { NewEmergencyDto } from '../../../models/emergencies/NewEmergecyDto';

@Component({
  selector: 'app-register-emergency',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './register-emergency.component.html',
  styleUrl: './register-emergency.component.css'
})
export class RegisterEmergencyComponent implements OnInit{
  private emergenciesService: EmergenciesService = inject(EmergenciesService);

  @ViewChild('form') form!: NgForm;
  requestStatus: RequestStatus = RequestStatus.None;
  

  public get RequestStatus(): typeof RequestStatus {
    return RequestStatus;
  }

  ngOnInit(): void {
    const modal = document.getElementById('emergencyModal');
    modal!.addEventListener('show.bs.modal', event => {
      this.form.reset();
      this.requestStatus = RequestStatus.None;
    });
  }
  
  registerEntry(form: NgForm) {
    this.requestStatus = RequestStatus.Loading;
    console.log(form.value);
    let emergency: NewEmergencyDto = {
      dni: form.value.dni,
      name: form.value.name,
      lastName: form.value.lastName,
      observations: form.value.observations,
      vehicle: {
        plate: form.value.plate,
        vehicle_Type: {
          description: form.value.vehicleType
        }
      }
    }

    this.emergenciesService.registerEmergency(emergency).subscribe({
    next: nv => {
      console.log(nv);
      this.requestStatus = RequestStatus.Success;
    },
    error: e => {
      console.log(e);
      this.requestStatus = RequestStatus.Error;
    }});
  }
  
  registerExit(form: NgForm) {
    this.requestStatus = RequestStatus.Loading;
    alert('Esta funcionalidad todavía no está implementada.');
  }
  
}

enum RequestStatus {
  None,
  Loading,
  Error,
  Success
}