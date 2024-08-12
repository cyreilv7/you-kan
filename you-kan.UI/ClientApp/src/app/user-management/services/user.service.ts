import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {

  protected http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiRoot = 'https://you-kan-api.vercel.app/api/users';

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

    // get all users
    getUsers(): Observable<any> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<any>(this.apiRoot, { headers, withCredentials: true })))
    }

    // get user by userID
    getUser(user_id: number): Observable<User> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.get<User>(`${this.apiRoot}/${user_id}`, { headers, withCredentials: true })))
    }
  
    // create a new user
    createUser(user: User): Observable<User> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.post<User>(this.apiRoot, user, { headers, withCredentials: true })))
    }
  
    // update an existing user
    updateUser(updateUser: User): Observable<User> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.put<User>(`${this.apiRoot}/${updateUser.user_id}`, updateUser, { headers, withCredentials: true })))
    }
  
    // remove a user
    deleteUser(user_id: number): Observable<void> {
      return this.addCsrfToken().pipe(
        switchMap(headers => this.http.delete<void>(`${this.apiRoot}/${user_id}`, { headers, withCredentials: true })))
    }
}