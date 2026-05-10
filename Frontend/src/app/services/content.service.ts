import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class ContentService {
    private readonly API = apiUrl('/content');

    constructor(private http: HttpClient) { }

    createModule(module: any): Observable<any> {
        return this.http.post<any>(`${this.API}/module`, module);
    }

    getModulesByCourse(courseId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/module/course/${courseId}`);
    }

    createContent(content: any): Observable<any> {
        return this.http.post<any>(`${this.API}/item`, content);
    }

    getContentByModule(moduleId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/item/module/${moduleId}`);
    }
}
