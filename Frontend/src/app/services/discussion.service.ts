import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class DiscussionService {
    private readonly API = apiUrl('/discussions');

    constructor(private http: HttpClient) { }

    createThread(thread: any): Observable<any> {
        return this.http.post<any>(`${this.API}/thread`, thread);
    }

    getThreadsByCourse(courseId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/course/${courseId}`);
    }

    createPost(post: any): Observable<any> {
        return this.http.post<any>(`${this.API}/post`, post);
    }

    getPostsByThread(threadId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/thread/${threadId}/posts`);
    }
}
