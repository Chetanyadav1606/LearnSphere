import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { ContentService } from '../../services/content.service';
import { DiscussionService } from '../../services/discussion.service';
import { TestService } from '../../services/test.service';
import { FeedbackService } from '../../services/feedback.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { ProgressService } from '../../services/progress.service';

@Component({
    selector: 'app-course-detail',
    standalone: true,
    imports: [NavbarComponent, CommonModule, RouterLink, FormsModule],
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {

    user: any;
    courseId!: number;
    course: any = null;
    activeTab = 'content';
    isInstructor = false;

    // Content & Assignments
    modules: any[] = [];
    expandedModule: number | null = null;
    moduleContents: { [key: number]: any[] } = {};
    moduleAssignments: { [key: number]: any[] } = {};

    // Submissions
    assignmentSubmission: { [key: number]: string } = {};
    pastSubmissions: { [key: number]: any } = {};

    // Instructor: create course content
    newCourseName = '';
    newCourseDesc = '';

    // Discussions
    threads: any[] = [];
    newThreadTitle = '';
    newThreadContent = '';
    expandedThread: number | null = null;
    threadPosts: { [key: number]: any[] } = {};
    newPostBody: { [key: number]: string } = {};

    // Tests
    tests: any[] = [];

    // Feedback
    feedbacks: any[] = [];
    newRating = 5;
    newFeedbackMsg = '';
    myFeedback: any = null;
    editingFeedback = false;

    // Progress
    completedContentIds = new Set<number>();
    progressPercent = 0;
    progressTotal = 0;
    progressDone = 0;

    loading = true;
    enrolled = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private courseService: CourseService,
        private contentService: ContentService,
        private discussionService: DiscussionService,
        private testService: TestService,
        private feedbackService: FeedbackService,
        private enrollmentService: EnrollmentService,
        private progressService: ProgressService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.isInstructor = this.authService.isInstructor();
        this.courseId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadCourse();
    }

    loadCourse(): void {
        this.courseService.getAllCourses().subscribe({
            next: (courses) => {
                this.course = courses.find((c: any) => c.courseId === this.courseId);
                this.loading = false;
                this.loadModules();
                this.loadThreads();
                this.loadTests();
                this.loadFeedback();
                this.checkEnrollment();
            },
            error: () => { this.loading = false; }
        });
    }

    // --- Enrollment ---
    checkEnrollment(): void {
        if (!this.user?.userId) return;
        this.enrollmentService.getByUser(this.user.userId).subscribe({
            next: (enrollments) => {
                this.enrolled = enrollments.some((e: any) => e.course?.courseId === this.courseId);
                if (this.enrolled && !this.isInstructor) {
                    this.loadProgress();
                }
            }
        });
    }

    loadProgress(): void {
        this.progressService.getCourseProgress(this.courseId, this.user.userId).subscribe({
            next: (p) => {
                this.progressPercent = p.percent;
                this.progressTotal = p.totalItems;
                this.progressDone = p.completedItems;
                this.completedContentIds = new Set<number>(p.completedContentIds);
            }
        });
    }

    toggleComplete(contentId: number): void {
        if (!this.user?.userId) return;
        if (this.completedContentIds.has(contentId)) {
            this.progressService.unmarkComplete(this.user.userId, contentId).subscribe({
                next: () => this.loadProgress()
            });
        } else {
            this.progressService.markComplete(this.user.userId, contentId).subscribe({
                next: () => this.loadProgress()
            });
        }
    }

    enrollInCourse(): void {
        if (!this.user?.userId) return;
        const enrollment = {
            user: { userId: this.user.userId },
            course: { courseId: this.courseId },
            role: 'STUDENT'
        };
        this.enrollmentService.enroll(enrollment).subscribe({
            next: () => { this.enrolled = true; }
        });
    }

    // --- Content ---
    loadModules(): void {
        this.contentService.getModulesByCourse(this.courseId).subscribe({
            next: (m: any[]) => { this.modules = m; }
        });
    }

    toggleModule(moduleId: number): void {
        if (this.expandedModule === moduleId) {
            this.expandedModule = null;
            return;
        }
        this.expandedModule = moduleId;
        if (!this.moduleContents[moduleId]) {
            this.contentService.getContentByModule(moduleId).subscribe({
                next: (c: any[]) => { this.moduleContents[moduleId] = c; }
            });
            // Load assignments for module
            this.courseService.getAssignments(moduleId).subscribe({
                next: (a: any[]) => {
                    this.moduleAssignments[moduleId] = a;
                    if (!this.isInstructor && this.enrolled && this.user?.userId) {
                        a.forEach((assign: any) => {
                            this.courseService.getStudentSubmission(assign.assignmentId, this.user.userId).subscribe({
                                next: (sub: any) => {
                                    if (sub) {
                                        this.pastSubmissions[assign.assignmentId] = sub;
                                    }
                                }
                            });
                        });
                    }
                }
            });
        }
    }

    submitAssignment(assignmentId: number): void {
        const text = this.assignmentSubmission[assignmentId];
        if (!text || !text.trim() || !this.user?.userId) return;

        const submission = {
            assignment: { assignmentId },
            student: { userId: this.user.userId },
            submissionText: text
        };

        this.courseService.submitAssignment(submission).subscribe({
            next: (res: any) => {
                alert('Assignment submitted successfully!');
                this.assignmentSubmission[assignmentId] = '';
                this.pastSubmissions[assignmentId] = res;
            }
        });
    }



    // --- Discussions ---
    loadThreads(): void {
        this.discussionService.getThreadsByCourse(this.courseId).subscribe({
            next: (t: any[]) => { this.threads = t; }
        });
    }

    createThread(): void {
        if (!this.newThreadTitle.trim() || !this.user?.userId) return;
        const thread = {
            course: { courseId: this.courseId },
            user: { userId: this.user.userId },
            title: this.newThreadTitle,
            content: this.newThreadContent
        };
        this.discussionService.createThread(thread).subscribe({
            next: () => {
                this.newThreadTitle = '';
                this.newThreadContent = '';
                this.loadThreads();
            }
        });
    }

    toggleThread(threadId: number): void {
        if (this.expandedThread === threadId) {
            this.expandedThread = null;
            return;
        }
        this.expandedThread = threadId;
        this.discussionService.getPostsByThread(threadId).subscribe({
            next: (p: any[]) => { this.threadPosts[threadId] = p; }
        });
    }

    replyToThread(threadId: number): void {
        const body = this.newPostBody[threadId];
        if (!body?.trim() || !this.user?.userId) return;
        const post = {
            thread: { threadId },
            user: { userId: this.user.userId },
            body
        };
        this.discussionService.createPost(post).subscribe({
            next: () => {
                this.newPostBody[threadId] = '';
                this.expandedThread = null;
                setTimeout(() => this.toggleThread(threadId), 100);
            }
        });
    }

    // --- Tests ---
    loadTests(): void {
        this.testService.getTestsByCourse(this.courseId).subscribe({
            next: (t: any[]) => { this.tests = t; }
        });
    }

    // --- Feedback ---
    loadFeedback(): void {
        this.feedbackService.getFeedbackByCourse(this.courseId).subscribe({
            next: (f: any[]) => {
                this.feedbacks = f;
                this.myFeedback = f.find((fb: any) => fb.user?.userId === this.user?.userId) || null;
                if (this.myFeedback) {
                    this.newRating = this.myFeedback.rating;
                    this.newFeedbackMsg = this.myFeedback.message;
                    this.editingFeedback = true;
                }
            }
        });
    }

    submitFeedback(): void {
        if (!this.newFeedbackMsg.trim() || !this.user?.userId) return;
        const payload = {
            user: { userId: this.user.userId },
            course: { courseId: this.courseId },
            rating: this.newRating,
            message: this.newFeedbackMsg
        };
        if (this.editingFeedback && this.myFeedback?.feedbackId) {
            this.feedbackService.updateFeedback(this.myFeedback.feedbackId, payload).subscribe({
                next: () => this.loadFeedback()
            });
        } else {
            this.feedbackService.submitFeedback(payload).subscribe({
                next: () => { this.newFeedbackMsg = ''; this.newRating = 5; this.loadFeedback(); }
            });
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
