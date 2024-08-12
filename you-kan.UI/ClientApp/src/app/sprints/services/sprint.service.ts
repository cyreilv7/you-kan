import { inject, Injectable } from '@angular/core';
import { Sprint } from '../models/sprint.model';
//import { User } from '../../user-management/models/user.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../user-management/services/auth.service';

@Injectable({ providedIn: 'root' })
export class SprintService {

  protected http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiRoot = 'http://localhost:8000/api/sprints';

  constructor() {}

  private addCsrfToken(headers: HttpHeaders = new HttpHeaders()): Observable<HttpHeaders> {
    return this.authService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return new Observable<HttpHeaders>(observer => {
          observer.next(headers.set('X-CSRF-Token', csrfToken));
          observer.complete();
        });
      })
    );
  }

    // get sprints by project id
    getSprints(projectId: number): Observable<Sprint[]> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<Sprint[]>(`${this.apiRoot}/project/${projectId}`, { headers, withCredentials: true }))) 
    }
  
    // create a new sprint
    createSprint(sprint: Sprint, projectId: number): Observable<Sprint> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.post<Sprint>(`${this.apiRoot}/project/${projectId}`, sprint, { headers, withCredentials: true })))
    }
  
    // update an existing sprint
    updateSprint(updateSprint: Sprint): Observable<Sprint> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.put<Sprint>(`${this.apiRoot}/${updateSprint.sprint_id}`, updateSprint, { headers, withCredentials: true })))
    }
  
    // remove a sprint
    deleteSprint(id: any): Observable<void> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.delete<void>(`${this.apiRoot}/${id}`, { headers, withCredentials: true })))
    }
}