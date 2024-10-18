import { Component } from '@angular/core';
import { AccessGridVisitorsRegistrationComponent } from '../access-grid-visitors-registration/access-grid-visitors-registration.component';
import { OnInit,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AccessTimeRangeVisitorsRegistrationComponent } from '../access-time-range-visitors-registration/access-time-range-visitors-registration.component';
import { Visitor } from '../../../../models/visitors/VisitorsModels';
import { AccessVisitorsRegisterServiceService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service/access-visitors-register-service.service';
import { AccessVisitorsRegisterServiceHttpClientService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service-http-client/access-visitors-register-service-http-client.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-access-container-visitors-registration',
  standalone: true,
  imports: [  CommonModule,
    FormsModule,
    AccessGridVisitorsRegistrationComponent,
    AccessTimeRangeVisitorsRegistrationComponent],
  templateUrl: './access-container-visitors-registration.component.html',
  styleUrl: './access-container-visitors-registration.component.css'
})
export class AccessContainerVisitorsRegistrationComponent implements OnInit {
  constructor(
    private visitorService: AccessVisitorsRegisterServiceService,
    private visitorHttpService: AccessVisitorsRegisterServiceHttpClientService,
  ) { }

  @ViewChild('visitorForm') visitorForm!: NgForm;
  ngOnInit(): void {
    this.loadVehicleTypes();
    
  }

  patentePattern = '^[A-Z]{1,3}\\d{3}[A-Z]{0,3}$';

  onLicensePlateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.visitant.licensePlate = input.value;
  }

  onlyNumbers(event: any) {
    const input = event.target;
    const value = input.value;
    input.value = value.replace(/[^0-9]/g, '');
  }

vehicleType: string[] = [];
loadVehicleTypes(): void {
  this.visitorHttpService.getVehicleTypes().subscribe({
    next: (types) => {
      this.vehicleType = types;
      console.log('Tipos de vehículos cargados:', types);
    },
    error: (error) => {
      console.error('Error al cargar tipos de vehículos:', error);
    }
  });
}

  visitant: Visitor = {
    firstName: '',
    lastName: '',
    document: '',
    phone:'',
    email: '',
    hasVehicle: false,
    licensePlate: '',
    vehicleType: ''
  };

  sendVisitorWithoutRH(visitant: NgForm) {
    if (visitant.valid) {
      const visitantData = visitant.value;
      this.visitant = {
        ...this.visitant,
        firstName: visitantData.nombre,
        lastName: visitantData.apellido,
        document: visitantData.documento,
        email: visitantData.email,
        phone: visitantData.telefono,
        hasVehicle: visitantData.tieneVehiculo
      };
      if (visitantData.tieneVehiculo) {
        this.visitant.licensePlate = visitantData.patente;
        this.visitant.vehicleType = visitantData.tipoVehiculo;
      } else {
        this.visitant.licensePlate = '';
        this.visitant.vehicleType = '';
      }
      this.visitorService.addVisitorsTemporalsSubject(this.visitant);
      this.resetForm();
    } else {
      console.log('El formulario no es válido');
    }
  }

  setFormData(visit: Visitor) {
    this.visitant = { ...visit };
    if (this.visitorForm) {
      const formValues: Visitor = {
        firstName: visit.firstName,
        lastName: visit.lastName,
        document: visit.document,
        phone: visit.phone,
        email: visit.email,
        hasVehicle: visit.hasVehicle
      };
  
      if (visit.hasVehicle) {
        formValues.licensePlate = visit.licensePlate || '';
        formValues.vehicleType = visit.vehicleType || '';
      }
  
      this.visitorForm.form.patchValue(formValues);
    }
  }

  updateVisitor(visit: Visitor) {
    console.log('Visitante recibido para editar:', visit);
    this.setFormData(visit);
  }
  
  resetForm(): void {
    this.visitant = {
      firstName: '',
      lastName: '',
      document: '',
      phone: '',
      email: '',
      hasVehicle: false,
      licensePlate: '',
      vehicleType: ''
    };
  } 


  private unsubscribe$ = new Subject<void>();
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  
}
