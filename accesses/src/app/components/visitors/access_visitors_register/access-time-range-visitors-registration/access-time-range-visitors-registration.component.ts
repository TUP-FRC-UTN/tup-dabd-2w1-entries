import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllowedDay, Day } from '../../../../models/visitors/VisitorsModels';
import { DayAllowed } from '../../../../models/visitors/interface/owner';
import { VisitorsService } from '../../../../services/visitors/visitors.service';
import { AccessVisitorsRegisterServiceService } from '../../../../services/visitors/access-visitors-register-service/access-visitors-register-service/access-visitors-register-service.service';
@Component({
  selector: 'app-access-time-range-visitors-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-time-range-visitors-registration.component.html',
  styleUrl: './access-time-range-visitors-registration.component.css'
})
export class AccessTimeRangeVisitorsRegistrationComponent {
  days: Day[] = [
    { name: 'Lun', value: false },
    { name: 'Mar', value: false },
    { name: 'Mié', value: false },
    { name: 'Jue', value: false },
    { name: 'Vie', value: false },
    { name: 'Sáb', value: false },
    { name: 'Dom', value: false }
  ];

  initHour: string = '';
  endHour: string = '';
  private _allowedDays: AllowedDay[] = [];
  orderDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  constructor(private visitorService: AccessVisitorsRegisterServiceService) {}

  ngOnInit(): void {
    this.visitorService.getAllowedDays().subscribe(days => {
      this._allowedDays = days;
      this.udpdateDaysSelected();
    });
  }


  udpdateDaysSelected(): void {
    this.days.forEach(day => {
      day.value = this._allowedDays.some(dayAllowed => dayAllowed.day.name === day.name);
    });
  }

  get allowedDays(): AllowedDay[] {
    return [...this._allowedDays].sort((a, b) => {
      const indexA = this.orderDays.indexOf(a.day.name);
      const indexB = this.orderDays.indexOf(b.day.name);
      return indexA - indexB;
    });
  }

  updateAllowedDays(): void {
    this.days.forEach(day => {
      day.value = this._allowedDays.some(allwedDay => allwedDay.day.name === day.name);
    });
  }
  validateHours(): boolean {
    if (!this.initHour || !this.endHour) {
      alert('Por favor, ingrese tanto la hora de inicio como la hora de fin.');
      return false;
    }
    return true;
  }

  agregarDiasPermitidos(): void {
    if (!this.validateHours()) return;

    const initHour = new Date(`1970-01-01T${this.initHour}:00`);
    const endHour = new Date(`1970-01-01T${this.endHour}:00`);
    const acrossMidnight = endHour <= initHour;


    const newDaysAlloweds: AllowedDay[] = this.days
      .filter(day => day.value && !this._allowedDays.some(dp => dp.day.name === day.name))
      .map(day => ({
        day: { ...day }, 
        startTime: initHour, 
        endTime: endHour, 
        crossesMidnight: acrossMidnight 
      })); 
    if (newDaysAlloweds.length === 0) {
      alert('Por favor, seleccione al menos un día nuevo para agregar.');
      return;
    }

    this._allowedDays = [...this._allowedDays, ...newDaysAlloweds];
    this.visitorService.updateAllowedDays(this._allowedDays);
    this.initHour = '';
    this.endHour = '';
    this.udpdateDaysSelected();
  }

  isAllowedDay(day: Day): boolean {
    return this._allowedDays.some(alloweDay => alloweDay.day.name === day.name);
  }

  deleteAllowedDay(alloweDay: AllowedDay): void {
    this._allowedDays = this._allowedDays.filter(dp => dp.day.name !== alloweDay.day.name);
    this.visitorService.updateAllowedDays(this._allowedDays);
    this.udpdateDaysSelected();
  }

  formatHour(schedule: AllowedDay): string {
    const formatHour = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const init = formatHour(schedule.startTime);
    const end = formatHour(schedule.endTime);
    return schedule.crossesMidnight ? `${init} - ${end} (1 Dia)` : `${init} - ${end}`;
  }
}
