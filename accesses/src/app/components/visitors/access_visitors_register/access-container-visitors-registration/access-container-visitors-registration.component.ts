import { Component } from '@angular/core';
import { AccessGridVisitorsRegistrationComponent } from '../access-grid-visitors-registration/access-grid-visitors-registration.component';
import { OnInit,ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AccessTimeRangeVisitorsRegistrationComponent } from '../access-time-range-visitors-registration/access-time-range-visitors-registration.component';

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

  
}
