import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { TestService } from '../../services/test.service';
import { firstValueFrom } from 'rxjs';

interface CourseTestHistory {
  testId: number;
  title: string;
  attemptsCount: number;
  completedCount: number;
  averageScore: number;
  topScore: number;
  latestAttemptAt: string | null;
}

@Component({
  selector: 'app-manage-course',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-course.component.html',
  styleUrls: ['./manage-course.component.css']
})
export class ManageCourseComponent implements OnInit {

  user: any;
  courseId: number | null = null;
  mode: 'create' | 'edit' = 'create';

  // Tabs
  activeTab: 'details' | 'modules' | 'tests' | 'history' | 'grading' = 'details';

  // Details
  courseTitle = '';
  courseDescription = '';
  courseDepartmentId = 1;
  courseImageUrl = '';
  isPublished = false;

  // Modules & Materials
  modules: any[] = [];
  newModuleTitle = '';

  newContentTitle = '';
  newContentType = 'LINK';
  newContentFilePath = '';
  selectedModuleIdForContent: number | null = null;

  // Assignments
  assignments: any[] = [];
  newAssignmentTitle = '';
  newAssignmentDesc = '';
  newAssignmentMarks = 100;
  newAssignmentDueDate = '';
  selectedModuleIdForAssignment: number | null = null;

  // Grading
  submissions: any[] = [];
  gradingSubmissionId: number | null = null;
  gradingFeedback = '';
  gradingMarks = 0;

  // Tests
  tests: any[] = [];
  testHistory: CourseTestHistory[] = [];
  selectedHistoryTestId: number | null = null;
  selectedHistorySummary: CourseTestHistory | null = null;
  selectedTestAttempts: any[] = [];
  newTestTitle = '';
  newTestDuration = 30;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private testService: TestService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.authService.isInstructor()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.courseId = Number(idParam);
      this.mode = 'edit';
      this.loadCourseData();
    }
  }

  loadCourseData(): void {
    if (!this.courseId) return;

    // Quick load basic modules first. For simplicity, just load modules
    this.reloadModules();
    this.loadTests();
    this.loadTestHistory();

    // In a real app we'd fetch course details by ID too. For now we assume the user just clicks a course from dashboard.
  }

  reloadModules(): void {
    if (!this.courseId) return;
    this.courseService.getModules(this.courseId).subscribe((m: any[]) => {
      this.modules = m;
      this.modules.forEach(mod => {
        this.courseService.getContent(mod.moduleId).subscribe((c: any[]) => mod.contents = c);
        this.courseService.getAssignments(mod.moduleId).subscribe((a: any[]) => mod.assignments = a);
      });
    });
  }

  saveCourse(): void {
    if (!this.user?.userId) {
      alert("Error: Your login session is stale. Please completely log out and log back in to get a fresh token with your User ID!");
      return;
    }

    const payload = {
      title: this.courseTitle,
      description: this.courseDescription,
      imageUrl: this.courseImageUrl,
      isPublished: this.isPublished,
      department: { departmentId: this.courseDepartmentId },
      creator: { userId: this.user.userId }
    };

    if (this.mode === 'create') {
      this.courseService.createCourse(payload).subscribe({
        next: (res) => {
          this.courseId = res.courseId;
          this.mode = 'edit';
          this.activeTab = 'modules';
          alert('Course created successfully!');
        },
        error: (err) => {
          console.error("Course creation failed", err);
          alert('Failed to create course: ' + (err?.error?.message || err.message));
        }
      });
    } else {
      // Setup edit course logic later if needed
      alert('Course updated settings (Mocked).');
    }
  }

  // Modules
  addModule(): void {
    if (!this.newModuleTitle.trim() || !this.courseId) return;
    this.courseService.createModule({
      course: { courseId: this.courseId },
      title: this.newModuleTitle
    }).subscribe(() => {
      this.newModuleTitle = '';
      this.reloadModules();
    });
  }

  // Materials
  addContent(): void {
    if (!this.newContentTitle.trim() || !this.selectedModuleIdForContent) return;
    this.courseService.addContent({
      module: { moduleId: this.selectedModuleIdForContent },
      title: this.newContentTitle,
      contentType: this.newContentType,
      filePath: this.newContentFilePath
    }).subscribe(() => {
      this.newContentTitle = '';
      this.newContentFilePath = '';
      this.reloadModules();
    });
  }

  // Assignments
  addAssignment(): void {
    if (!this.newAssignmentTitle.trim() || !this.selectedModuleIdForAssignment) return;
    this.courseService.createAssignment({
      module: { moduleId: this.selectedModuleIdForAssignment },
      title: this.newAssignmentTitle,
      description: this.newAssignmentDesc,
      maxMarks: this.newAssignmentMarks,
      dueDate: this.newAssignmentDueDate ? new Date(this.newAssignmentDueDate).toISOString() : null
    }).subscribe(() => {
      this.newAssignmentTitle = '';
      this.newAssignmentDesc = '';
      this.reloadModules();
    });
  }

  // Load submissions for grading tab
  loadSubmissionsForAssignment(assignmentId: number): void {
    this.courseService.getSubmissions(assignmentId).subscribe(s => {
      this.submissions = s;
    });
  }

  startGrading(sub: any): void {
    this.gradingSubmissionId = sub.submissionId;
    this.gradingMarks = sub.marksAwarded || 0;
    this.gradingFeedback = sub.feedback || '';
  }

  saveGrade(sub: any): void {
    this.courseService.gradeSubmission(sub.submissionId, {
      marksAwarded: this.gradingMarks,
      feedback: this.gradingFeedback
    }).subscribe(() => {
      sub.marksAwarded = this.gradingMarks;
      sub.feedback = this.gradingFeedback;
      this.gradingSubmissionId = null;
    });
  }

  cancelGrading(): void {
    this.gradingSubmissionId = null;
  }

  // Tests
  loadTests(): void {
    if (!this.courseId) return;
    this.testService.getTestsByCourse(this.courseId).subscribe(t => {
      this.tests = t;
      this.loadTestHistoryFromTests(t || []);
    });
  }

  createTest(): void {
    if (!this.newTestTitle.trim() || !this.courseId) return;
    const test = {
      course: { courseId: this.courseId },
      title: this.newTestTitle,
      durationMinutes: this.newTestDuration,
      securityPolicy: 'STANDARD'
    };
    this.testService.createTest(test).subscribe(() => {
      this.newTestTitle = '';
      this.newTestDuration = 30;
      this.loadTests();
    });
  }

  loadTestHistory(): void {
    if (!this.courseId) return;
    this.testService.getTestsByCourse(this.courseId).subscribe(tests => {
      this.loadTestHistoryFromTests(tests || []);
    });
  }

  private loadTestHistoryFromTests(tests: any[]): void {
    if (!tests.length) {
      this.testHistory = [];
      this.selectedHistoryTestId = null;
      this.selectedHistorySummary = null;
      this.selectedTestAttempts = [];
      return;
    }

    const requests = tests.map((test) =>
      firstValueFrom(this.testService.getAttemptsByTest(test.testId))
        .then((attempts) => this.buildTestHistory(test, attempts || []))
        .catch(() => null)
    );

    Promise.all(requests).then((history) => {
      this.testHistory = history
        .filter((item): item is CourseTestHistory => !!item)
        .sort((a, b) => {
          const aTime = a.latestAttemptAt ? new Date(a.latestAttemptAt).getTime() : 0;
          const bTime = b.latestAttemptAt ? new Date(b.latestAttemptAt).getTime() : 0;
          return bTime - aTime;
        });

      const preferredTestId = this.selectedHistoryTestId ?? this.testHistory[0]?.testId ?? null;
      if (preferredTestId) {
        this.onHistoryTestChange(preferredTestId);
      }
    });
  }

  onHistoryTestChange(testId: number | string | null): void {
    const normalizedTestId = Number(testId);
    if (!normalizedTestId) {
      this.selectedHistoryTestId = null;
      this.selectedHistorySummary = null;
      this.selectedTestAttempts = [];
      return;
    }

    this.selectedHistoryTestId = normalizedTestId;
    this.selectedHistorySummary = this.testHistory.find((item) => item.testId === normalizedTestId) || null;

    this.testService.getAttemptsByTest(normalizedTestId).subscribe((attempts) => {
      this.selectedTestAttempts = (attempts || [])
        .filter((attempt: any) => attempt.status === 'COMPLETED')
        .sort((a: any, b: any) => {
          const aTime = new Date(a.completedAt || a.startedAt || 0).getTime();
          const bTime = new Date(b.completedAt || b.startedAt || 0).getTime();
          return bTime - aTime;
        });
    });
  }

  private buildTestHistory(test: any, attempts: any[]): CourseTestHistory {
    const completedAttempts = attempts.filter((attempt: any) => attempt.status === 'COMPLETED' && attempt.score != null);
    const scores = completedAttempts
      .map((attempt: any) => Number(attempt.score))
      .filter((score: number) => !Number.isNaN(score));

    const latestAttemptAt = attempts
      .map((attempt: any) => attempt.completedAt || attempt.startedAt)
      .filter((value: string | null | undefined) => !!value)
      .sort()
      .reverse()[0] ?? null;

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = scores.length > 0 ? Math.round((totalScore / scores.length) * 10) / 10 : 0;
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      testId: test.testId,
      title: test.title,
      attemptsCount: attempts.length,
      completedCount: completedAttempts.length,
      averageScore,
      topScore,
      latestAttemptAt
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
