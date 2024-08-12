import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // Update with server URL

  private csrfToken: string | null = null;
  private sessionId: string | null = null;


  // observable for toggling dashboard nav/toolbar
  isLoggedIn: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  currentUserId: ReplaySubject<number> = new ReplaySubject<number>(1);
  userProfile: ReplaySubject<{first_name: string, last_name: string, email: string}> = new ReplaySubject<{first_name: string, last_name: string, email: string}>(1);

  constructor(private http: HttpClient) { this.isAuthenticated().subscribe();
    this.currentUserId.next(-1);
   }

  // Get CSRF token from the server
  private fetchCsrfToken(): Observable<string> {
    return this.http.get<{ csrfToken: string }>(`${this.apiUrl}/csrf-token`, { withCredentials: true }).pipe(
      tap((response) => {
        this.csrfToken = response.csrfToken;
      }),
      switchMap((response) => of(response.csrfToken))
    );
  }

  // Get stored CSRF token or fetch a new one if not available
  getCsrfToken(): Observable<string> {
    if (this.csrfToken) {
      return of(this.csrfToken);
    } else {
      return this.fetchCsrfToken();
    }
  }

  // Login method with CSRF token
  login(email: string, password: string): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''  // Provide an empty string if csrfToken is null
        });
        return this.http.post<any>(`${this.apiUrl}/login/password`, { email, password }, { headers, withCredentials: true }).pipe(
          tap((response: any) => {
            this.currentUserId.next(response.user.user_id);
            this.userProfile.next({first_name: response.user.first_name, last_name: response.user.last_name, email: response.user.email});
            this.isLoggedIn.next(true);
            this.sessionId = response.sessionId; // Assume the session ID is returned in the response
          })
        );
      })
    );
  }

  // Register method with CSRF token
  register(user: any): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''  // Provide an empty string if csrfToken is null
        });
        return this.http.post<any>(`${this.apiUrl}/register`, user, { headers, withCredentials: true }).pipe(
          tap((response: any) => {
            this.currentUserId.next(response.user.user_id);
            this.userProfile.next({first_name: response.user.first_name, last_name: response.user.last_name, email: response.user.email});
            this.isLoggedIn.next(true);
          })
        );
      })
    );
  }

  // Logout method with CSRF token
  logout(): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''  // Provide an empty string if csrfToken is null
        });
        return this.http.post<any>(`${this.apiUrl}/logout`, {}, { headers, withCredentials: true }).pipe(
          tap(() => {
            this.csrfToken = null; // Clear CSRF token on logout
            this.sessionId = null; // Clear session ID on logout
            this.isLoggedIn.next(false);
          })
        );
      })
    );
  }

 // Implement the logic to check if the user is authenticated
 isAuthenticated(): Observable<boolean> {
  return this.http.get<boolean>(`${this.apiUrl}/is-authenticated`, { withCredentials: true }).pipe(
    catchError((error) => {
      this.isLoggedIn.next(false);
      throw error
    }),
    tap((response: any) => {
      this.isLoggedIn.next(true);
      this.currentUserId.next(response.user_id);
      this.userProfile.next({first_name: response.first_name, last_name: response.last_name, email: response.email});
    })
  );
}

// Helper to get the session ID if needed
getSessionId(): string | null {
  return this.sessionId;
}
}
