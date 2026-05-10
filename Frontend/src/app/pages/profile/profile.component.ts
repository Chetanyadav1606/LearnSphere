import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { TestService } from '../../services/test.service';
import { FeedbackService } from '../../services/feedback.service';
import { DiscussionService } from '../../services/discussion.service';
import { CourseService } from '../../services/course.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [NavbarComponent, CommonModule, RouterLink],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

    user: any;
    isInstructor = false;

    // Stats
    enrolledCourses: any[] = [];
    testAttempts: any[] = [];
    allCourses: any[] = [];
    allFeedbacks: any[] = [];

    // Computed stats
    totalEnrollments = 0;
    completedTests = 0;
    avgScore = 0;
    totalCourses = 0;

    // Instructor stats
    coursesCreated = 0;
    totalStudents = 0;

    loading = true;

    constructor(
        private authService: AuthService,
        private enrollmentService: EnrollmentService,
        private testService: TestService,
        private feedbackService: FeedbackService,
        private discussionService: DiscussionService,
        private courseService: CourseService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.isInstructor = this.authService.isInstructor();
        if (!this.user) { this.router.navigate(['/login']); return; }
        this.loadStats();
    }

    loadStats(): void {
        const userId = this.user.userId;

        // Enrollments
        this.enrollmentService.getByUser(userId).subscribe({
            next: (e) => {
                this.enrolledCourses = e;
                this.totalEnrollments = e.length;
            }
        });

        // Test attempts
        this.testService.getAttemptsByUser(userId).subscribe({
            next: (a) => {
                // Group by test ID and keep only the attempt with max score
                const maxAttempts = new Map<number, any>();
                a.forEach((t: any) => {
                    const tId = t.test?.testId;
                    if (tId) {
                        const existing = maxAttempts.get(tId);
                        if (!existing || (t.score || 0) > (existing.score || 0)) {
                            maxAttempts.set(tId, t);
                        }
                    }
                });

                this.testAttempts = Array.from(maxAttempts.values());
                this.completedTests = this.testAttempts.filter((t: any) => t.status === 'COMPLETED').length;
                const scored = this.testAttempts.filter((t: any) => t.score != null && t.score > 0);
                this.avgScore = scored.length > 0
                    ? Math.round(scored.reduce((sum: number, t: any) => sum + t.score, 0) / scored.length * 10) / 10
                    : 0;
            }
        });

        // All courses (for instructor stats)
        this.courseService.getAllCourses().subscribe({
            next: (c) => {
                this.allCourses = c;
                this.totalCourses = c.length;
                if (this.isInstructor) {
                    this.coursesCreated = c.filter((crs: any) => crs.creator?.userId === userId).length;
                }
                this.loading = false;
            }
        });
    }

    getCreatedCourses(): any[] {
        return this.allCourses.filter(c => c.creator?.userId === this.user?.userId);
    }

    getInitials(): string {
        const name = this.user?.fullName || this.user?.email || '?';
        return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    }

    getMemberSince(): string {
        // Approximate from user data
        return 'February 2026';
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
