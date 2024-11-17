import { inject, Injectable } from '@angular/core';
import { AccessUserReportService } from '../access_report/access_httpclient/access_usersApi/access-user-report.service';
import { map, Observable } from 'rxjs';
import { User } from '../../models/access-report/User';

@Injectable({
  providedIn: 'root'
})
export class AuthOwnerService {
  private readonly userService = inject(AccessUserReportService);

  constructor() { }

  getUser(): Observable<User> {
    return this.userService.getUsersByRole("Familiar Mayor").pipe(map(v => v[0]));
  }
}