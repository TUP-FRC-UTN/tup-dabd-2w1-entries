import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SuppEmpDto } from '../../../models/EmployeeAllowed/user-alowed';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-more-information',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './more-information.component.html',
  styleUrl: './more-information.component.css'
})
export class MoreInformationComponent {

  flag: boolean = false;
 @Input() user: SuppEmpDto | null = null;
 @Output() changeFlag = new EventEmitter()

  ChangeFlag(){
    this.flag = !this.flag
    this.changeFlag.emit(false)
  }
}
