import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class TestService {
    private readonly API = apiUrl('/tests');

    constructor(private http: HttpClient) { }

    createTest(test: any): Observable<any> {
        return this.http.post<any>(this.API, test);
    }

    getTestsByCourse(courseId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/course/${courseId}`);
    }

    addQuestion(question: any): Observable<any> {
        return this.http.post<any>(`${this.API}/question`, question);
    }

    getQuestions(testId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/${testId}/questions`);
    }

    deleteQuestion(questionId: number): Observable<any> {
        return this.http.delete(`${this.API}/question/${questionId}`, { responseType: 'text' });
    }

    startAttempt(attempt: any): Observable<any> {
        return this.http.post<any>(`${this.API}/attempt`, attempt);
    }

    submitAttempt(attemptId: number): Observable<any> {
        return this.http.put<any>(`${this.API}/attempt/${attemptId}/submit`, {});
    }

    submitAnswer(answer: any): Observable<any> {
        return this.http.post<any>(`${this.API}/answer`, answer);
    }

    getAttemptsByUser(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/attempts/user/${userId}`);
    }

    getAttemptsByTest(testId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/attempts/test/${testId}`);
    }
}
