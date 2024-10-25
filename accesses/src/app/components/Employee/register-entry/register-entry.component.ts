import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MovementEntryDto,SuppEmpDto } from '../../../models/EmployeeAllowed/user-alowed';
import { FormsModule } from '@angular/forms';
import { UserServiceService } from '../../../services/EmployeeService/user-service.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-entry',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-entry.component.html',
  styleUrl: './register-entry.component.css'
})
export class RegisterEntryComponent {
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
  
    this.movementEntryService.registerEmpSuppEntry(this.movement).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Movimiento registrado',
          text: `¡El usuario "${this.user?.name}" fue registrado con éxito!`,
          confirmButtonColor: '#28a745',
        });
      },
      error: (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error?.message || 'Error al guardar el movimiento',
          confirmButtonColor: '#d33',
        });
        console.error("Error en la solicitud POST:", error); // Para depuración
      }
    });
  }
}