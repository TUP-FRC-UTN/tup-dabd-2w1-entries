import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxScannerQrcodeModule } from 'ngx-scanner-qrcode';
import { CommonModule, DatePipe } from '@angular/common';
import { AccessVisitorRegistryComponent } from './components/access_visitors/access-visitor-registry/access-visitor-registry.component';
import { AccessRegisterEmergencyComponent } from './components/access-register-emergency/access-register-emergency.component';
import { AccessesNavbarComponent } from "./components/accesses-navbar/accesses-navbar.component";
import { AccesesVisitorsTempComponent } from './components/access_visitors/acceses-visitors-temp/acceses-visitors-temp.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, AccessVisitorRegistryComponent, AccessVisitorRegistryComponent, AccessRegisterEmergencyComponent, CommonModule, DatePipe, NgxScannerQrcodeModule, AccessesNavbarComponent,AccesesVisitorsTempComponent],
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