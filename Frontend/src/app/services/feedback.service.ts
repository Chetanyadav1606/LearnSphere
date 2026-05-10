import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private readonly API = apiUrl('/feedback');

    constructor(private http: HttpClient) { }

    submitFeedback(feedback: any): Observable<any> {
        return this.http.post<any>(this.API, feedback);
    }

    updateFeedback(feedbackId: number, feedback: any): Observable<any> {
        return this.http.put<any>(`${this.API}/${feedbackId}`, feedback);
    }

    getFeedbackByCourse(courseId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/course/${courseId}`);
    }
}
