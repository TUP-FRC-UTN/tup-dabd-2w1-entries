import { NgClass } from '@angular/common';
import { AfterViewChecked, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmergenciesService } from '../../../services/emergencies/emergencies.service';
import { NewEmergencyDto } from '../../../models/emergencies/NewEmergecyDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-emergency',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register-emergency.component.html',
  styleUrl: './register-emergency.component.css'
})
export class RegisterEmergencyComponent implements OnInit, OnDestroy, AfterViewChecked{
  private emergenciesService: EmergenciesService = inject(EmergenciesService);
  private personAdded: boolean = false;
  subscription = new Subscription();

  form = new FormGroup({
    people: new FormArray<FormGroup>([]),
    vehicle: new FormGroup({
      type: new FormControl(),
      plate: new FormControl('')
    }),
    observations: new FormControl()
  });
  requestStatus: RequestStatus = RequestStatus.None;
  

  public get RequestStatus(): typeof RequestStatus {
    return RequestStatus;
  }

  ngOnInit(): void {
    const modal = document.getElementById('emergencyModal');
    modal!.addEventListener('show.bs.modal', event => {
      this.requestStatus = RequestStatus.None;
      this.form.reset();
      this.form.controls.vehicle.controls.type.setValue('');
      this.form.controls.people.clear();
      this.addPersonForm();
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.personAdded){
      const modalDialog = document.getElementById('emergencyModalBody');
      modalDialog!.scrollTop = modalDialog!.scrollHeight;
      this.personAdded = false;
    }
  }
  registerEntry() {
    this.requestStatus = RequestStatus.Loading;
    const emergency: NewEmergencyDto = this.getFormAsDto();
    const newSubscription = this.emergenciesService.registerEmergencyEntry(emergency).subscribe({
    next: nv => {
      this.requestStatus = RequestStatus.Success;
    },
    error: e => {
      this.requestStatus = RequestStatus.Error;
    }});

    this.subscription.add(newSubscription);
  }
  
  registerExit() {
    this.requestStatus = RequestStatus.Loading;
    const emergency: NewEmergencyDto = this.getFormAsDto();

    const newSubscription = this.emergenciesService.registerEmergencyEntry(emergency).subscribe({
    next: nv => {
      this.requestStatus = RequestStatus.Success;
    },
    error: e => {
      this.requestStatus = RequestStatus.Error;
    }});

    this.subscription.add(newSubscription);
  }
  
  addPersonForm() {
    const peopleFormArray = this.form.controls.people;
    const personForm = new FormGroup({
      documentType: new FormControl('', [Validators.required]),
      documentNumber: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required])
    });
    peopleFormArray.push(personForm);
    this.personAdded = true;
  }

  removePersonForm(index: number) {
    this.form.controls.people.removeAt(index);
  }

  vehicleTypeChanged() {
    const plateControl = this.form.controls.vehicle.controls.plate;
    if (this.form.value.vehicle?.type != '') {
      setTimeout(() => {
        plateControl.setValidators([Validators.required]);
        plateControl.updateValueAndValidity();
      }, 1);
    }
    else {
      setTimeout(() => {
        plateControl.setValidators([]);
        plateControl.updateValueAndValidity();
      }, 1);
    }
  }

  getFormAsDto(): NewEmergencyDto {
    const formValue = this.form.value;

    const emergencyDto: NewEmergencyDto = {
      people: formValue.people ?? [],
      vehicle: {
        vehicleType: {
          description: formValue.vehicle?.type ?? null
        },
        plate: formValue.vehicle?.plate ?? null
      },
      observations: formValue.observations
    };
    return emergencyDto;
  }
}

enum RequestStatus {
  None,
  Loading,
  Error,
  Success
}