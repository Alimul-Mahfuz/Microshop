import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, UserDto } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/identity';

  currentUser = signal<UserDto | null>(this.getStoredUser());
  token = signal<string | null>(localStorage.getItem('microshop_token'));

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  register(userData: { email: string; password: string; firstName: string; lastName: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('microshop_token');
    localStorage.removeItem('microshop_user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  private setSession(token: string, user: UserDto | null): void {
    localStorage.setItem('microshop_token', token);
    this.token.set(token);
    if (user) {
      localStorage.setItem('microshop_user', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  private getStoredUser(): UserDto | null {
    const userJson = localStorage.getItem('microshop_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
