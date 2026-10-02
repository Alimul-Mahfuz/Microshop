import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">admin_panel_settings</mat-icon>
      Sign In to Microshop
    </h2>

    <mat-dialog-content>
      <!-- Quick Demo Sign-In Chips -->
      <div class="quick-demo-section">
        <span class="quick-label">Quick Sign-In (Demo):</span>
        <div class="chip-group">
          <button type="button" mat-stroked-button class="demo-chip superadmin" (click)="fillDemo('superadmin@microshop.com', 'SuperAdmin123!')">
            <mat-icon>verified_user</mat-icon> SuperAdmin
          </button>
          <button type="button" mat-stroked-button class="demo-chip admin" (click)="fillDemo('admin@microshop.com', 'Admin123!')">
            <mat-icon>shield</mat-icon> Admin
          </button>
          <button type="button" mat-stroked-button class="demo-chip user" (click)="fillDemo('user@microshop.com', 'User123!')">
            <mat-icon>person</mat-icon> Customer
          </button>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms">
        <!-- SIGN IN TAB -->
        <mat-tab label="Sign In">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="superadmin@microshop.com" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" />
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div *ngIf="loginError" class="error-banner">
              {{ loginError }}
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading" class="submit-btn">
              Sign In
            </button>
          </form>
        </mat-tab>

        <!-- CREATE ACCOUNT TAB -->
        <mat-tab label="Create Account">
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Alex" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Morgan" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="alex@example.com" />
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password (min 6 chars)</mat-label>
              <input matInput formControlName="password" type="password" />
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div *ngIf="registerError" class="error-banner">
              {{ registerError }}
            </div>

            <button mat-raised-button color="accent" type="submit" [disabled]="registerForm.invalid || loading" class="submit-btn">
              Register Account
            </button>
          </form>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #0078d4;
    }
    .quick-demo-section {
      background: #f3f2f1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
      border: 1px solid #e1dfdd;
    }
    .quick-label {
      font-size: 12px;
      font-weight: 600;
      color: #605e5c;
      display: block;
      margin-bottom: 6px;
    }
    .chip-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .demo-chip {
      font-size: 12px;
      border-radius: 16px;
      line-height: 28px;
    }
    .superadmin {
      color: #107c41;
      border-color: #107c41;
    }
    .admin {
      color: #0078d4;
      border-color: #0078d4;
    }
    .user {
      color: #5c2d91;
      border-color: #5c2d91;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 12px;
      min-width: 360px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .half-width {
      flex: 1;
    }
    .submit-btn {
      height: 44px;
      font-size: 15px;
      margin-top: 4px;
      border-radius: 4px;
    }
    .error-banner {
      color: #a80000;
      background: #fde7e9;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
    }
  `]
})
export class AuthDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<AuthDialogComponent>);

  loginForm: FormGroup = this.fb.group({
    email: ['superadmin@microshop.com', [Validators.required, Validators.email]],
    password: ['SuperAdmin123!', Validators.required]
  });

  registerForm: FormGroup = this.fb.group({
    firstName: ['Alex', Validators.required],
    lastName: ['Morgan', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loginError = '';
  registerError = '';
  loading = false;

  fillDemo(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.loginError = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.snackBar.open(`Signed in as ${res.user?.firstName || 'User'}!`, 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        } else {
          this.loginError = res.errors?.join(', ') || 'Login failed';
        }
      },
      error: () => {
        this.loading = false;
        this.loginError = 'Invalid email or password.';
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.registerError = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.snackBar.open('Account created and signed in!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        } else {
          this.registerError = res.errors?.join(', ') || 'Registration failed';
        }
      },
      error: () => {
        this.loading = false;
        this.registerError = 'Registration failed. Check user details.';
      }
    });
  }
}
