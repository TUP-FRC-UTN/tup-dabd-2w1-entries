import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AccessNewVehicleDto } from '../../../models/access-visitors/access-VisitorsModels';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserAllowed, UserAllowedDto } from '../../../services/access_visitors/movement.interface';
import { Access_vehicleService } from '../../../services/access_vehicles/access_vehicle.service';
import { catchError, debounceTime, map, Observable, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { Access_userDocumentService } from '../../../services/access_user-document/access_user-document.service';
import { CommonModule } from '@angular/common';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../services/access_visitors/access-visitors-register/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { AccessUserAllowedInfoDto } from '../../../models/access-visitors/access-visitors-models';
import { valHooks } from 'jquery';
import { HttpErrorResponse } from '@angular/common/http';
import { translateMessage, translations } from '../../../models/access-visitors/interface/access_api-response-tranasalted';

@Component({
  selector: 'app-access-vehicles-view',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './access-vehicles-view.component.html',
  styleUrl: './access-vehicles-view.component.css'
})
export class AccessVehiclesViewComponent implements OnDestroy,OnInit {
  constructor(
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadVehicleTypes()
    this.formVehicle = this.fb.group({
      document: [
        '', 
        [Validators.required, this.ValidateCharacters], 
        [this.finUserByDni()] // Agregando la validación asincrónica aquí
      ],
      documentType: ['', Validators.required],
      vehicles: this.fb.array([])
    });

    // Actualizar validación de `document` cuando `documentType` cambie
    this.formVehicle.get('documentType')?.valueChanges.subscribe(() => {
      this.formVehicle.get('document')?.updateValueAndValidity();
    });
  }
  private suscription=new Subscription();
  patentePlate = '^[A-Z]{1,3}\\d{3}[A-Z]{0,3}$';
  ngOnDestroy(): void {
    this.suscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  private unsubscribe$ = new Subject<void>();
  vehicleTypes: string[] = ['Car', 'Motorbike', 'Truck', 'Van'];
  vehicleType: string[] = [];
  vehicleTypeMapping: { [key: string]: string } = {
    'Car': 'Auto',
    'Motorbike': 'Moto',
    'Truck': 'Camión',
    'Van': 'Camioneta'
  };
  vehicleOptions: { value: string, label: string }[] = [];
  vehiculos:AccessNewVehicleDto[]=[]
  isValidating: boolean = false;
  isUserFound: boolean = false;
  userAllowed:UserAllowedDto|null=null;
  userId=1
  private readonly httpUserAllowedVehicle=inject(Access_userDocumentService)
  private readonly httpVehicleService=inject(Access_vehicleService)
  private readonly visitorHttpService: AccessVisitorsRegisterServiceHttpClientService=inject(AccessVisitorsRegisterServiceHttpClientService)
  
  formVehicle:FormGroup=new FormGroup({
    document:new FormControl('',[Validators.required,this.ValidateCharacters,
      this.finUserByDni,Validators.minLength(8)]),
    documentType:new FormControl('',[Validators.required]),
    vehicles:new FormArray([])
  })
  
  private CreateVehicle():FormGroup{
    return this.fb.group({
      plate:new FormControl('',[Validators.required, Validators.pattern(this.patentePlate)]),
      vehicleType:new FormControl('',[Validators.required]),
      insurance:new FormControl('',[Validators.required]),
      isExistingVehicle: [false]
    })
  }
  get VehiclesArray():FormArray{
    return this.formVehicle.get('vehicles') as FormArray
  }
  removeVehicle(index:number):void{
    this.VehiclesArray.removeAt(index);
  }
  addVehicle():void{
    const vehicleGroup=this.CreateVehicle()
    this.VehiclesArray.push(vehicleGroup)
  }
  private ValidateCharacters(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.length < 8) {
      return { min: true };
    }
    return null;
  }
  getSelectedVehicles(): AccessNewVehicleDto[] {
    return this.VehiclesArray.controls.map((group: AbstractControl) => {
      const formGroup = group as FormGroup;
      return {
        plate: formGroup.get('plate')?.value || '',
        vehicle_Type: {
          description: formGroup.get('vehicleType')?.value || ''
        },
        insurance: formGroup.get('insurance')?.value || ''
      };
    });
  }


finUserByDni(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const document = control.value;
    const documentType = this.formVehicle.get('documentType')?.value;

    if (!document || !documentType) {
      return of(null);  // Si no hay documento o tipo de documento, no se valida
    }

    return this.httpUserAllowedVehicle.getUserByDniAndDocument(document, documentType).pipe(
      map((data: UserAllowedDto | null) => {
        if (data) {
          // El documento existe
          this.userAllowed=data
          this.isUserFound=true;
          console.log(this.userAllowed)
          return null;
        } else {
          // El documento no existe
          return { userNotFound: true };
        }
      }),
      catchError((error) => {
        console.error(error);
        return of({ apiError: true });  // Si hay un error en la API
      })
    );
  };
}



  onSubmit():void{
    if(this.formVehicle.valid){
      const formValue=this.formVehicle.value;
      const bodyData={
        dni:formValue.document,
        documentType:formValue.documentType,
        vehicleDtos:this.getSelectedVehicles()
      };
      const sub=this.httpVehicleService.addVehicle(bodyData.vehicleDtos,bodyData.dni,bodyData.documentType)
      .subscribe({
        next:(response)=>{
          if(response.success){
            alert("Vehiculos añadido con exito");
            console.log(bodyData.vehicleDtos)
            this.userAllowed?.vehicles?.push(bodyData.vehicleDtos)
          }
        },
       error: (error: HttpErrorResponse) => {
      // Verificamos si la respuesta contiene un mensaje que se pueda traducir
        if (error.error && error.error.message) {
    // Traducimos el mensaje de error usando translateMessage
       const translatedMessage = translateMessage(error.error.message);

         console.log('API Response Error:', error.error);
        alert(`Error: ${translatedMessage}`);
       } else {
        // Si no se puede traducir el mensaje, mostramos uno genérico
        console.error('Error en la solicitud:', error);
         alert(`Error: ${error.message || error.statusText}`);
        }
        }
      });
      this.suscription.add(sub);
    }
  }
  loadVehicleTypes(): void {
    this.visitorHttpService.getVehicleTypes().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (types) => {
        this.vehicleOptions = types.map(type => ({
          value: type,
          label: this.vehicleTypeMapping[type] || type
        }));
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículos:', error);
      }
    });
  }
  logicDownVehicle(plate:string,userId:number):void{
    console.log(plate)
    const sub=this.httpVehicleService.logicDown(plate,userId).subscribe({
      next:(response)=>{
        if(response.success){
          alert("Vehiculos dado de baja con exito");
         let index= this.userAllowed?.vehicles?.findIndex(vehicle=> vehicle.plate===plate)
         if(index!==-1 && index!==undefined)
         this.userAllowed?.vehicles?.splice(index,1)
        
        }
        else{
          if(response.message==='The vehicle not exist'){
          alert('El vehiculo no existe')}
        }
    },
    error:(error)=>{
      console.log(error)
    }});
    this.suscription.add(sub)
  }
  get documentControl() {
    return this.formVehicle.get('document');
  }
  updateValidation() {
    if (this.isValidating) return; // Evitar que se ejecute si ya se está validando
    const document = this.formVehicle.get('document')?.value;
    const documentType = this.formVehicle.get('documentType')?.value;

    if (document && documentType) {
      this.isValidating = true; // Marcar como validando
      this.formVehicle.get('document')?.updateValueAndValidity();
    }
  }
 
  
}
