import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VisitorRegistryComponent } from './components/visitors/visitor-registry/visitor-registry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VisitorRegistryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'accesses';
}
