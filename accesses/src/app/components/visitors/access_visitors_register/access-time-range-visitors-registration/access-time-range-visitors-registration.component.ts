import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AllowedDay, Day, AuthRange } from '../../../../models/visitors/VisitorsModels';
import { AccessVisitorsRegisterServiceService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service/access-visitors-register-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-access-time-range-visitors-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './access-time-range-visitors-registration.component.html',
  styleUrls: ['./access-time-range-visitors-registration.component.css']
})
export class AccessTimeRangeVisitorsRegistrationComponent implements OnInit {
  days: Day[] = [
    { name: 'Lun', value: false },
    { name: 'Mar', value: false },
    { name: 'Mié', value: false },
    { name: 'Jue', value: false },
    { name: 'Vie', value: false },
    { name: 'Sáb', value: false },
    { name: 'Dom', value: false },
  ];

  form: FormGroup;

  private _allowedDays: AllowedDay[] = [];

  orderDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(private visitorService: AccessVisitorsRegisterServiceService, private fb: FormBuilder) {
      this.form = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      initHour: ['', Validators.required],
      endHour: ['', Validators.required],
      Lun: [{ value: false, disabled: true }],
      Mar: [{ value: false, disabled: true }],
      Mié: [{ value: false, disabled: true }],
      Jue: [{ value: false, disabled: true }],
      Vie: [{ value: false, disabled: true }],
      Sáb: [{ value: false, disabled: true }],
      Dom: [{ value: false, disabled: true }],
    });


    this.form.get('startDate')?.valueChanges.subscribe(() => this.updateAvailableDays());
    this.form.get('endDate')?.valueChanges.subscribe(() => this.updateAvailableDays());
  }

  updateAvailableDays(): void {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;
    
    // Deshabilitar todos los días si no hay fechas seleccionadas
    if (!startDate || !endDate) {
      this.orderDays.forEach(day => {
        this.form.get(day)?.disable();
      });
      return;
    }
    //SOLUCION POSIBLE:
    // Crear fechas con la hora correcta
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    
    // Obtener los días disponibles
    const availableDays = this.getDaysBetweenDates(start, end);

    // Primero deshabilitar todos los días
    this.orderDays.forEach(day => {
      const control = this.form.get(day);
      control?.disable();
      control?.setValue(false);
    });

    // Luego habilitar solo los días dentro del rango
    availableDays.forEach(day => {
      const control = this.form.get(day);
      if (control) {
        control.enable();
      }
    });

    console.log('Días disponibles:', availableDays);
  }

  getDaysBetweenDates(start: Date, end: Date): string[] {

    const spanishDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];    
    const startDate = new Date(start);
    const endDate = new Date(end);
    

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const days = new Set<string>();
    const currentDate = new Date(startDate);
    

    while (currentDate <= endDate) {
        const dayName = spanishDays[currentDate.getDay()];
        days.add(dayName);
        
        
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        currentDate.setTime(nextDate.getTime());
    }
    
    return Array.from(days);
}
  


  get areDatesDisabled(): boolean {
    return this._allowedDays.length > 0;
  }
  get areDatesReadonly(): boolean {
    return this._allowedDays.length > 0;
  }
 disableDateInputs: boolean = false;


  ngOnInit(): void {
    this.visitorService.getAllowedDays().subscribe(days => {
      this._allowedDays = days;
      this.updateDaysSelected();
    });
    this.updateDateFieldsState();
  }


  agregarAuthRange(): void {
    console.log('Iniciando agregarAuthRange');
    console.log('Valores del formulario:', this.form.value);
    
    if (!this.validateDates()) {
      return;
    }

    if (this._allowedDays.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, agregue al menos un día permitido.',
      });
      return;
    }

    const startDate = new Date(this.form.value.startDate);
    const endDate = new Date(this.form.value.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las fechas proporcionadas no son válidas.',
      });
      return;
    }

    const authRange: AuthRange = {
      initDate: startDate,
      endDate: endDate,
      allowedDays: this._allowedDays,
    };

    try {
      this.visitorService.setAuthRange(authRange);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Rango de autorización agregado correctamente.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el rango de autorización.',
      });
    }
  }

  updateDaysSelected(): void {
    this.days.forEach(day => {
      day.value = this._allowedDays.some(dayAllowed => dayAllowed.day.name === day.name);
      this.form.controls[day.name].setValue(day.value);
    });
  }

  get allowedDays(): AllowedDay[] {
    return [...this._allowedDays].sort((a, b) => {
      const indexA = this.orderDays.indexOf(a.day.name);
      const indexB = this.orderDays.indexOf(b.day.name);
      return indexA - indexB;
    });
  }

  validateHours(): boolean {
    if (!this.form.value.initHour || !this.form.value.endHour) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese tanto la hora de inicio como la hora de fin.',
      });
      return false;
    }
    return true;
  }
  private updateDateFieldsState(): void {
    if (this._allowedDays.length > 0) {
      this.form.controls['startDate'].disable();
      this.form.controls['endDate'].disable();
    } else {
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
    }
  }
  agregarDiasPermitidos(): void {
    if (!this.validateHours()) return;
    if (!this.validateDates()) return;

    const initHour = new Date(`1970-01-01T${this.form.value.initHour}:00`);
    const endHour = new Date(`1970-01-01T${this.form.value.endHour}:00`);

    const crossesMidnight = endHour <= initHour;

    const newDaysAlloweds: AllowedDay[] = this.days
      .filter(day => this.form.controls[day.name].value && !this._allowedDays.some(dp => dp.day.name === day.name))
      .map(day => ({
        day: { ...day },
        startTime: initHour,
        endTime: endHour,
        crossesMidnight: crossesMidnight,
      }));

    if (newDaysAlloweds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, seleccione al menos un día nuevo para agregar.',
      });
      return;
    }
    this._allowedDays = [...this._allowedDays, ...newDaysAlloweds];
    this.visitorService.updateAllowedDays(this._allowedDays);
    this.form.controls['initHour'].setValue('');
    this.form.controls['endHour'].setValue('');
    this.updateDaysSelected();
  }
  isAllowedDay(day: Day): boolean {
  
    return this._allowedDays.some(allowedDay => allowedDay.day.name === day.name);
  }

  deleteAllowedDay(allowedDay: AllowedDay): void {
    this._allowedDays = this._allowedDays.filter(dp => dp.day.name !== allowedDay.day.name);
    this.visitorService.updateAllowedDays(this._allowedDays);
    this.updateDaysSelected();
  }

  formatHour(schedule: AllowedDay): string {
    const formatHour = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const init = formatHour(schedule.startTime);
    const end = formatHour(schedule.endTime);
    return schedule.crossesMidnight ? `${init} - ${end}` : `${init} - ${end}`;
  }
  validateDates(): boolean {
    console.log('Validando fechas');
    console.log('Valor de startDate:', this.form.value.startDate);
    console.log('Valor de endDate:', this.form.value.endDate);
  

    if (!this.form.value.startDate || !this.form.value.endDate) {
      console.log('Fechas no proporcionadas');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'Por favor, ingrese ambas fechas.',
      });
      return false;
    }
  

    const startDate = new Date(this.form.value.startDate + 'T00:00:00');
    const endDate = new Date(this.form.value.endDate + 'T00:00:00');
  
    console.log('Fechas parseadas:', {
      startDate,
      endDate,
      isStartDateValid: !isNaN(startDate.getTime()),
      isEndDateValid: !isNaN(endDate.getTime())
    });
  
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  

    if (startDate < currentDate) {
      console.log('Fecha de inicio anterior a la fecha actual');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de inicio no puede ser anterior a la fecha actual.',
      });
      return false;
    }
  
    if (endDate < currentDate) {
      console.log('Fecha de fin anterior a la fecha actual');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de fin no puede ser anterior a la fecha actual.',
      });
      return false;
    }
  
    if (endDate < startDate) {
      console.log('Fecha de fin anterior a fecha de inicio');
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
      });
      return false;
    }
  
    console.log('Validación de fechas exitosa');
    return true;
  }

}
