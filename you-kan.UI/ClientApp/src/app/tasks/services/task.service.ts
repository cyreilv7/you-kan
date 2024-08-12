import { inject, Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../user-management/services/auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {

  protected http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiRoot = 'http://localhost:8000/api/tasks';

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

    // get all tasks for a project
    getTasksForProject(projectId: number): Observable<Task[]> {
      const params = new HttpParams().set('project_id', projectId.toString());
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<Task[]>(this.apiRoot, { headers, params, withCredentials: true })))
    }
  
    // get task by taskId
    getTask(id: number): Observable<Task> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<Task>(`${this.apiRoot}/${id}`, { headers, withCredentials: true })))
    }
  
    // create a new task
    createTask(task: Task): Observable<Task> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.post<Task>(this.apiRoot, task, { headers, withCredentials: true })))
    }
  
    // update an existing task
    updateTask(updateTask: Task): Observable<Task> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.put<Task>(`${this.apiRoot}/${updateTask.task_id}`, updateTask, { headers, withCredentials: true })))
    }
  
    // remove a task
    deleteTask(id: number | any): Observable<void> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.delete<void>(`${this.apiRoot}/${id}`, { headers, withCredentials: true })))
    }
}