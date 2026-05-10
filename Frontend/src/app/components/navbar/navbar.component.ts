import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: any;
  isInstructor = false;
  isDark = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.isInstructor = this.authService.isInstructor();
    this.isDark = this.themeService.isDark();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.themeService.toggle();
    this.isDark = this.themeService.isDark();
  }
}
