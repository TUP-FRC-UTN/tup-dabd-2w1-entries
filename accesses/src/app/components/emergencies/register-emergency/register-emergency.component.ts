import { NgClass } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NumbersOnlyDirective } from '../../../directives/numbers-only.directive';
import { EmergenciesService } from '../../../services/emergencies/emergencies.service';

@Component({
  selector: 'app-register-emergency',
  standalone: true,
  imports: [FormsModule, NgClass, NumbersOnlyDirective],
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
    modal!.addEventListener('hidden.bs.modal', event => {
      this.form.reset();
      this.requestStatus = RequestStatus.None;
    });
  }
  
  registerEntry(form: NgForm) {
    this.requestStatus = RequestStatus.Loading;
    this.emergenciesService.registerEmergency(form.value).subscribe({
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