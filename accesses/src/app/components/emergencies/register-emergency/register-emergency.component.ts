import { NgClass } from '@angular/common';
import { AfterViewChecked, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EmergenciesService } from '../../../services/emergencies/emergencies.service';
import { NewEmergencyDto } from '../../../models/emergencies/NewEmergecyDto';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-register-emergency',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register-emergency.component.html',
  styleUrl: './register-emergency.component.css'
})
export class RegisterEmergencyComponent implements OnInit, OnDestroy, AfterViewChecked{
  private readonly emergenciesService: EmergenciesService = inject(EmergenciesService);
  private readonly subscription = new Subscription();
  private readonly personUpdated = new Subject<void>();
  
  private peopleSubscriptionsArray: Subscription[] = [];
  private personAdded: boolean = false;

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
    this.subscription.add(this.personUpdated);
    const modal = document.getElementById('emergencyModal');
    modal!.addEventListener('show.bs.modal', event => {
      this.requestStatus = RequestStatus.None;
      this.form.reset();
      this.form.controls.vehicle.controls.type.setValue('');
      this.form.controls.people.clear();
      this.peopleSubscriptionsArray.forEach(s => s.unsubscribe());
      this.peopleSubscriptionsArray = [];
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
    const documentTypeControl = new FormControl('', [Validators.required]);
    const documentNumberControl = new FormControl('', [Validators.required]);
    const subscriptions = new Subscription();

    documentNumberControl.addValidators(this.documentUniqueValidator(documentTypeControl));

    const documentTypeSubscription = documentTypeControl.valueChanges.subscribe({
      next: () => {
        this.personUpdated.next();
      }
    });
    const personUpdatedSubscription = this.personUpdated.subscribe({
      next: () => {
        documentNumberControl.updateValueAndValidity();
      }
    });

    subscriptions.add(documentTypeSubscription);
    subscriptions.add(personUpdatedSubscription);

    this.peopleSubscriptionsArray.push(subscriptions);

    const personForm = new FormGroup({
      documentType: documentTypeControl,
      documentNumber: documentNumberControl,
      name: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required])
    });

    peopleFormArray.push(personForm);
    this.personAdded = true;
  }
  private documentUniqueValidator(documentTypeControl: FormControl): ValidatorFn {
    return (documentNumberControl: AbstractControl): ValidationErrors | null => {
      const peopleControlsArray = this.form.controls.people.controls;
      const peopleSameDocument = peopleControlsArray.filter(
        p => p.controls['documentType'].value == documentTypeControl.value && p.controls['documentNumber'].value == documentNumberControl.value);
      if (peopleSameDocument.length <= 1)
        return null;
      else 
        return {
          'unique': true
      };
    } 
  }
  removePersonForm(index: number) {
    this.form.controls.people.removeAt(index);
    const subscriptions = this.peopleSubscriptionsArray.splice(index, 1);
    subscriptions[0].unsubscribe();
    this.personUpdated.next();
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