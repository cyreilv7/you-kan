import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../user-management/services/auth.service';

@Injectable({ providedIn: 'root' })
export class CommentService {

  protected http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiRoot = 'https://you-kan-api.vercel.app/api/comments';

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

    // get comments for task
    getCommentsForTask(taskId: any): Observable<any[]> {
      const params = new HttpParams().set('task_id', taskId);
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<any[]>(this.apiRoot, { headers, params, withCredentials: true })))
    }

    getCommentById(id: any): Observable<Comment> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<Comment>(`${this.apiRoot}/${id}`, { headers, withCredentials: true })))
    }

    // create a new task
    createComment(comment: any): Observable<any> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.post<any>(this.apiRoot, comment, { headers, withCredentials: true })))
    }
  
    // remove a task
    deleteComment(id: number | any): Observable<void> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.delete<void>(`${this.apiRoot}/${id}`, { headers, withCredentials: true })))
    }
}