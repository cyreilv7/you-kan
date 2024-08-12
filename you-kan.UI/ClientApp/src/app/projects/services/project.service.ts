import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Project } from '../models/project.model';
import { AuthService } from '../../user-management/services/auth.service';
import { User } from '../../user-management/models/user.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  protected http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiRoot = 'https://you-kan-api.vercel.app/api/projects';

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

  // Get all projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiRoot, { withCredentials: true })
  }

  // Get all projects by user
  getProjectsForUser(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiRoot, { withCredentials: true })
  }

  // Get project by projectId
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiRoot}/${id}`, { withCredentials: true })
  }

  // Create a new project
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiRoot, { project_name: project.project_name }, { withCredentials: true })
  }

  // Update an existing project
  updateProject(updateProject: any): Observable<Project> {
    return this.http.put<Project>(`${this.apiRoot}/${updateProject.project_id}`, updateProject, { withCredentials: true })
  }

  // Remove a project
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRoot}/${id}`, { withCredentials: true })
  }

  addProjectUser(projectId: number, userId: number): Observable<any> {
      const params = new HttpParams().set('user_id', userId);
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.post<any>(`${this.apiRoot}/collaborators/${projectId}`, {}, { headers, params, withCredentials: true }))
      );
    }

  removeProjectUser(projectId: number, userId: number): Observable<void> {
      const params = new HttpParams().set('user_id', userId);
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.delete<void>(`${this.apiRoot}/collaborators/${projectId}`, { headers, params, withCredentials: true }))
      );
    }

  getProjectCollaborators(projectId: number): Observable<User[]> {
    return this.addCsrfToken().pipe(
      switchMap(headers => this.http.get<User[]>(`${this.apiRoot}/collaborators/${projectId}`, { headers, withCredentials: true }))
    );
  }
}