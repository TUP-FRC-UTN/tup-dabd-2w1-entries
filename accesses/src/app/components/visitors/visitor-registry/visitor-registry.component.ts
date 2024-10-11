import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VisitorDto } from '../../../models/visitors/visitorDto';


@Component({
  selector: 'app-visitor-registry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-registry.component.html',
  styleUrl: './visitor-registry.component.css'
})
export class VisitorRegistryComponent {

  visitors: VisitorDto[] = [];
  document: string = ""
  name: string = ""

  Search(){

  }

  Return(){
    
  }

  MoreInfo(v : VisitorDto){

  }

}
