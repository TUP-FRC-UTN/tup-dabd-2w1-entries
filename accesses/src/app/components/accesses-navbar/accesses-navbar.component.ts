import { Component } from '@angular/core';
import { SideButton } from '../../models/navbar/SideButton';
import { Router } from '@angular/router';
import { AccessesSideButtonComponent } from '../accesses-side-button/accesses-side-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accesses-navbar',
  standalone: true,
  imports: [AccessesSideButtonComponent, CommonModule],
  templateUrl: './accesses-navbar.component.html',
  styleUrl: './accesses-navbar.component.css'
})
export class AccessesNavbarComponent {
 //Expande el side
 expand: boolean = false;
 pageTitle: string = "Página Principal"

 constructor(private router: Router) { }
 // private readonly authService = inject(AuthService);

 // userRoles: string[] =  this.authService.getUser().roles!; 
 userRoles: string[] = ["Gerente", "Propietario"]

 //Traer con el authService
 actualRole : string = "Gerente"
 //Lista de botones
 buttonsList: SideButton[] = [];

 // setName(){
 //   return this.authService.getUser().name + " " + this.authService.getUser().lastname;
 // }

 async ngOnInit(): Promise<void> {
   this.buttonsList = [
     // {
     //   icon: "bi-person",
     //   title: "Perfil",
     //   route: "home/profile",
     //   roles: ["SuperAdmin", "Admin", "Security", "Owner", "Spouse", "FamilyOld", "FamilyYoung", "Tenant"] //ver
     // },
     {
       icon: "bi bi-shield-fill-exclamation",
       title: "Accesos",
       roles: ["SuperAdmin", "Gerente","Propietario"],
       childButtons: [
         {
           icon: "bi bi-person-lines-fill",
           title: "Registro de Ingreso/Egreso",
           route: "visitors",
           roles: ["SuperAdmin", "Gerente","Security"]
         },
         {
           icon: "bi bi-list-check",
           title: "Informe de ingresos/egresos mensuales",
           route: "reports",
           roles: ["SuperAdmin", "Gerente"]
         },
         {
           icon: "bi bi-door-open-fill",
           title: "Añadir visitante",
           route: "visitor/register",
           roles: ["SuperAdmin", "Gerente","Propietario","Security"]
         },
         {
           icon: "bi bi-pencil-square",
           title: "Editar visitante",
           route: "edit",
           roles: ["SuperAdmin", "Gerente","Propietario"]
         },
         {
          icon: "bi bi-car-front-fill",
          title: "Registro de vehículos",
          route: "vehicleAdd",
          roles: ["SuperAdmin", "Gerente","Security"]
         },
       ]
     },

     


   ];
 }

 //Expandir y contraer el sidebar
 changeState() {
   this.expand = !this.expand;
 }

 redirect(path: string) {
   // if(path === '/login'){
   //   this.authService.logOut();
   //   this.router.navigate([path]);
   // }
   // else{
   //   this.router.navigate([path]);
   // }
   this.router.navigate([path]);
 }

 setTitle(title: string) {
   this.pageTitle = title;
 }

 selectRole(role : string){
   this.actualRole = role;
 }



//Pära ir al dashboard provisorio
redirectToDashboard(): void {
  this.router.navigate(['/dashboards']);  // Redirige al componente de dashboard
}


}
