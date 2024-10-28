import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';
import { VisitorRegisterEntryComponent } from "./components/visitors/(no-hace-falta)visitor-register-entry/visitor-register-entry.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { RegisterEmergencyComponent } from './components/emergencies/register-emergency/register-emergency.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, VisitorRegistryComponent, VisitorRegisterEntryComponent, RegisterEmergencyComponent, CommonModule, DatePipe,NgxScannerQrcodeModule],
  providers: [DatePipe, CommonModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
 
  constructor(  private datePipe: DatePipe, private router: Router ) {}

  navigateToComponent(event: any) {
    const selectedValue = event.target.value;
    this.router.navigate([selectedValue]);
  }
  title = 'accesses';

  navigateToVisitor() {
    this.router.navigate(['/Visitor']);
  }
}
