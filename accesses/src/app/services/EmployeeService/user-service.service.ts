import { Injectable } from '@angular/core';
import { MovementEntryDto,SuppEmpDto } from '../../models/EmployeeAllowed/user-alowed';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private apiUrlPost = 'http://localhost:8090/movements_entry/registerEmpSupp';
  private apiUrl = 'http://localhost:8090/GetSuppliesAndEmployeers';

  constructor(private http: HttpClient) {
    this.loadSuppEmpData();
  }

 ListaUser : SuppEmpDto[] = []
  
  getSuppEmpData(): Observable<SuppEmpDto[]> {
    return this.http.get<SuppEmpDto[]>(this.apiUrl);
  }

  registerEmpSupp(movement: MovementEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrlPost, movement, { headers });
  }

  loadSuppEmpData(): void {
    this.getSuppEmpData().subscribe({
      next: (data: SuppEmpDto[]) => {
        this.ListaUser = data; // Asigna los datos una vez que se reciban
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      }
    });
  }

  GetList(): SuppEmpDto[]{
    return [...this.ListaUser]
  }

  getUserByDocument(document: string): SuppEmpDto[] {
    return this.ListaUser.filter(user => user.document === document);
  }

  getUserByName(name: string): SuppEmpDto[] {
    return this.ListaUser.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  getUserByDocumentAndNAme(document: string, name: string): SuppEmpDto[] {
    return this.ListaUser.filter(user => user.document === document && user.name === name);
  }

}
