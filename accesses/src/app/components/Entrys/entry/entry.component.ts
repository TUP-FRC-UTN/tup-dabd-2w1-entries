import { Component } from '@angular/core';
import { ConsultarComponent } from "../consultar/consultar.component";
@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [ConsultarComponent],
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class EntryComponent {
  title = 'Ingresos';
}
