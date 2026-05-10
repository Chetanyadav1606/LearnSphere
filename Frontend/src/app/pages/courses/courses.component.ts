import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { FeedbackService } from '../../services/feedback.service';

@Component({
    selector: 'app-courses',
    standalone: true,
    imports: [NavbarComponent, CommonModule, RouterLink, FormsModule],
    templateUrl: './courses.component.html',
    styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

    user: any;
    allCourses: any[] = [];
    filteredCourses: any[] = [];

    // Filters
    searchQuery = '';
    selectedDept = '';
    sortBy = 'title';

    // Departments extracted from courses
    departments: string[] = [];

    // Course ratings cache
    ratingsMap: { [courseId: number]: number } = {};

    constructor(
        private authService: AuthService,
        private courseService: CourseService,
        private feedbackService: FeedbackService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.courseService.getPublishedCourses().subscribe({
            next: (courses) => {
                this.allCourses = courses;
                this.filteredCourses = courses;

                // Extract unique departments
                const deptSet = new Set<string>();
                courses.forEach((c: any) => {
                    if (c.department?.name) deptSet.add(c.department.name);
                });
                this.departments = Array.from(deptSet).sort();

                // Load ratings for each course
                courses.forEach((c: any) => {
                    this.feedbackService.getFeedbackByCourse(c.courseId).subscribe({
                        next: (fb: any[]) => {
                            if (fb.length > 0) {
                                const avg = fb.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / fb.length;
                                this.ratingsMap[c.courseId] = Math.round(avg * 10) / 10;
                            }
                        }
                    });
                });

                this.applyFilters();
            }
        });
    }

    applyFilters(): void {
        let result = [...this.allCourses];

        // Search filter
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(c =>
                c.title?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.creator?.fullName?.toLowerCase().includes(q)
            );
        }

        // Department filter
        if (this.selectedDept) {
            result = result.filter(c => c.department?.name === this.selectedDept);
        }

        // Sort
        if (this.sortBy === 'title') {
            result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (this.sortBy === 'rating') {
            result.sort((a, b) => (this.ratingsMap[b.courseId] || 0) - (this.ratingsMap[a.courseId] || 0));
        } else if (this.sortBy === 'department') {
            result.sort((a, b) => (a.department?.name || '').localeCompare(b.department?.name || ''));
        }

        this.filteredCourses = result;
    }

    getRating(courseId: number): number {
        return this.ratingsMap[courseId] || 0;
    }

    getStars(courseId: number): string {
        const r = this.getRating(courseId);
        if (r === 0) return '';
        return ''.repeat(Math.round(r)) + ''.repeat(5 - Math.round(r));
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedDept = '';
        this.sortBy = 'title';
        this.applyFilters();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
