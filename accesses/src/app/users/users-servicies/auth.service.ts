import { inject, Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { UserGet } from '../users-models/users/UserGet';
import { KJUR } from 'jsrsasign';
import { UserLoged } from '../users-models/users/UserLoged';

@Injectable({
  providedIn: 'root',
})
export class AuthService {



  //Obtiene el token y genera un UserLoged
  getUser(): UserLoged{
    var user = new UserLoged();
      
      user.id = 1;
      user.roles = ['SuperAdmin'];
      user.name = 'Test User';
      user.lastname = 'Test Lastname';
      user.plotId =  [1];
      
      return user;
  }



 




  // Método para obtener el rolSelected desde el JWT en el localStorage
  getActualRole(): string | null {
  
    return 'SuperAdmin';
  }

}
