import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestService } from '../../services/test.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-take-test',
    standalone: true,
    imports: [NavbarComponent, CommonModule, RouterLink, FormsModule],
    templateUrl: './take-test.component.html',
    styleUrls: ['./take-test.component.css']
})
export class TakeTestComponent implements OnInit {

    user: any;
    testId!: number;
    test: any = null;
    questions: any[] = [];
    answers: { [qId: number]: string } = {};
    attemptId: number | null = null;
    isInstructor = false;

    phase: 'loading' | 'start' | 'in-progress' | 'submitted' = 'loading';
    score: number | null = null;

    // Instructor: add question
    newQBody = '';
    newQType = 'MCQ';
    newQMarks = 2;
    newQCorrect = '';

    // Dynamic MCQ Options
    mcqOptions: string[] = ['', '', '', ''];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private testService: TestService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.isInstructor = this.authService.isInstructor();
        this.testId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadTest();
    }

    loadTest(): void {
        this.testService.getQuestions(this.testId).subscribe({
            next: (q) => {
                this.questions = q;
                this.phase = 'start';
            },
            error: () => { this.phase = 'start'; }
        });
    }

    startTest(): void {
        if (!this.user?.userId) return;
        this.testService.startAttempt({
            user: { userId: this.user.userId },
            test: { testId: this.testId }
        }).subscribe({
            next: (attempt) => {
                this.attemptId = attempt.attemptId;
                this.phase = 'in-progress';
            },
            error: (err) => { alert('Could not start test: ' + (err?.error || err?.message)); }
        });
    }

    submitTest(): void {
        if (!this.attemptId) return;

        // Submit each answer
        const submissions = Object.entries(this.answers).map(([qId, ans]) => {
            return this.testService.submitAnswer({
                attempt: { attemptId: this.attemptId },
                question: { questionId: Number(qId) },
                answerText: ans
            }).toPromise();
        });

        Promise.all(submissions).then(() => {
            // Complete the attempt
            this.testService.submitAttempt(this.attemptId!).subscribe({
                next: (result: any) => {
                    this.score = result?.score ?? null;
                    this.phase = 'submitted';
                },
                error: () => { this.phase = 'submitted'; }
            });
        });
    }

    // Instructor: add question
    addOption(): void {
        this.mcqOptions.push('');
    }

    removeOption(index: number): void {
        if (this.mcqOptions.length > 2) {
            this.mcqOptions.splice(index, 1);
        }
    }

    trackByIdx(index: number, obj: any): any {
        return index;
    }

    addQuestion(): void {
        if (!this.newQBody.trim()) return;
        const q: any = {
            test: { testId: this.testId },
            body: this.newQBody,
            questionType: this.newQType,
            marks: this.newQMarks,
            correctAnswer: this.newQCorrect
        };
        if (this.newQType === 'MCQ') {
            const opts = this.mcqOptions.map(o => o.trim()).filter(o => o !== '');
            if (opts.length < 2) {
                alert("Please provide at least 2 options for a Multiple Choice Question.");
                return;
            }
            q.extra = JSON.stringify({ options: opts });
            // If they didn't manually type the correct answer or selected an empty one, make sure it matches.
        }
        this.testService.addQuestion(q).subscribe({
            next: () => {
                this.newQBody = '';
                this.newQCorrect = '';
                this.mcqOptions = ['', '', '', ''];
                this.loadTest();
            }
        });
    }

    deleteQuestion(questionId: number): void {
        this.testService.deleteQuestion(questionId).subscribe({
            next: () => {
                this.loadTest();
            },
            error: (err) => {
                console.error('Delete question error:', err);
                alert('Error deleting question: ' + (err.message || err.error));
            }
        });
    }

    getOptions(q: any): string[] {
        try {
            const extra = typeof q.extra === 'string' ? JSON.parse(q.extra) : q.extra;
            return extra?.options || [];
        } catch { return []; }
    }

    goBack(): void {
        window.history.back();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
