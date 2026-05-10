import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: any;
  courses: any[] = [];
  isInstructor = false;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.isInstructor = this.authService.isInstructor();

    if (this.isInstructor) {
      this.courseService.getInstructorCourses(this.user.userId).subscribe({
        next: (c: any[]) => { this.courses = c; }
      });
    } else {
      this.courseService.getPublishedCourses().subscribe({
        next: (c: any[]) => { this.courses = c; }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
