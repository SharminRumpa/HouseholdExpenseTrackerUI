// src/app/layout/sidebar/sidebar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  menuItems = this.authService.menuItems;

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}