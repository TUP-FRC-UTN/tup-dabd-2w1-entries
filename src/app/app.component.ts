import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccesOwnerRentEntryViewComponent } from './acces-owner-rent-entry-view/acces-owner-rent-entry-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,AccesOwnerRentEntryViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'owner-renter';
}
