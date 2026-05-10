import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class ProgressService {
    private readonly API = apiUrl('/progress');

    constructor(private http: HttpClient) { }

    markComplete(userId: number, contentId: number): Observable<any> {
        return this.http.post<any>(`${this.API}/complete`, { userId, contentId });
    }

    unmarkComplete(userId: number, contentId: number): Observable<any> {
        return this.http.delete(`${this.API}/complete`, { params: { userId, contentId } });
    }

    getCourseProgress(courseId: number, userId: number): Observable<any> {
        return this.http.get<any>(`${this.API}/course/${courseId}/user/${userId}`);
    }
}
