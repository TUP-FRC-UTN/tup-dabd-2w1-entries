import { Component, Input } from '@angular/core';
import { MovementEntryDto, SuppEmpDto } from '../../../models/EmployeeAllowed/user-alowed';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { UserServiceService } from '../../../services/EmployeeService/user-service.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-exit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-exit.component.html',
  styleUrl: './register-exit.component.css'
})
export class RegisterExitComponent {
  flag: boolean = false;
  @Input() user: SuppEmpDto | null = null;
  @Output() changeFlag = new EventEmitter()

  description: string = ""
 
  constructor(private movementEntryService: UserServiceService) {}

    movement: MovementEntryDto = {
      description: "",
      movementDatetime: new Date().toISOString(),
      vehiclesId: 0,
      document: ""
    }


   ChangeFlag(){
     this.flag = !this.flag
     this.changeFlag.emit(false)
   }
   Register(){
    this.registerMovement()
    this.changeFlag.emit(false)
   }

   registerMovement(): void {
    if (!this.user?.document) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error: El documento del usuario es undefined',
        confirmButtonColor: '#d33',
      });
      return;
    }
  
    this.movement.description = this.description;
    this.movement.document = this.user.document;
    this.movement.movementDatetime = new Date().toISOString();
  
    this.movementEntryService.registerEmpSuppExit(this.movement).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Movimiento registrado',
          text: `¡El usuario "${this.user?.name}" fue registrado con éxito!`,
          confirmButtonColor: '#28a745',
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Error al registrar el movimiento. Inténtelo de nuevo.',
          confirmButtonColor: '#d33',
        });
      }
    });
  }
}
