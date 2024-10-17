import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { RegisterEmergencyComponent } from './components/emergencies/register-emergency/register-emergency.component';
import { VisitorRegisterEntryComponent } from './components/visitors/(no-hace-falta)visitor-register-entry/visitor-register-entry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, VisitorRegistryComponent, VisitorRegisterEntryComponent, RegisterEmergencyComponent],
  providers: [],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'accesses';
}
