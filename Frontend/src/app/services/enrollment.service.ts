import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private readonly API = apiUrl('/enrollments');

    constructor(private http: HttpClient) { }

    enroll(enrollment: any): Observable<any> {
        return this.http.post<any>(this.API, enrollment);
    }

    getByUser(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/user/${userId}`);
    }

    getByCourse(courseId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/course/${courseId}`);
    }
}
