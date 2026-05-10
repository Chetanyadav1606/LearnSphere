import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { apiUrl } from '../../core/config/api.config';
import { firstValueFrom } from 'rxjs';
import { TestService } from '../../services/test.service';

interface LeaderboardEntry {
    userId: number;
    fullName: string;
    totalScore: number;
    testsCompleted: number;
    avgScore: number;
    rank: number;
}

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [NavbarComponent, CommonModule, RouterLink],
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {

    user: any;
    entries: LeaderboardEntry[] = [];
    loading = true;
    myRank = 0;

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private testService: TestService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.loadLeaderboard();
    }

    loadLeaderboard(): void {
        this.http.get<any[]>(apiUrl('/users')).subscribe({
            next: (users) => {
                const requests = users.map((user) =>
                    firstValueFrom(this.testService.getAttemptsByUser(user.userId))
                        .then((attempts) => this.buildEntry(user, attempts))
                        .catch(() => null)
                );

                Promise.all(requests)
                    .then((entries) => {
                        const rankedEntries = entries
                            .filter((entry): entry is LeaderboardEntry => !!entry && entry.testsCompleted > 0)
                            .sort((a, b) => b.totalScore - a.totalScore);

                        rankedEntries.forEach((entry, index) => entry.rank = index + 1);
                        this.entries = rankedEntries;

                        const me = rankedEntries.find((entry) => entry.userId === this.user?.userId);
                        this.myRank = me ? me.rank : 0;
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    private buildEntry(user: any, attempts: any[]): LeaderboardEntry {
        const completed = (attempts || []).filter((attempt: any) => attempt.status === 'COMPLETED' && attempt.score != null);
        const maxScores = new Map<number, number>();

        completed.forEach((attempt: any) => {
            const testId = attempt.test?.testId;
            const score = Number(attempt.score);
            if (testId && !Number.isNaN(score)) {
                maxScores.set(testId, Math.max(maxScores.get(testId) || 0, score));
            }
        });

        const testsCompleted = maxScores.size;
        const totalScore = Array.from(maxScores.values()).reduce((sum, score) => sum + score, 0);
        const avgScore = testsCompleted > 0 ? Math.round(totalScore / testsCompleted * 10) / 10 : 0;

        return {
            userId: user.userId,
            fullName: user.fullName || user.email,
            totalScore,
            testsCompleted,
            avgScore,
            rank: 0
        };
    }

    getMedal(rank: number): string {
        if (rank === 1) return '1';
        if (rank === 2) return '2';
        if (rank === 3) return '3';
        return '' + rank;
    }

    isMe(entry: LeaderboardEntry): boolean {
        return entry.userId === this.user?.userId;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
