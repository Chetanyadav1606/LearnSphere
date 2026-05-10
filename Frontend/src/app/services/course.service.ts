import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly COURSES_API = apiUrl('/courses');
  private readonly CONTENT_API = apiUrl('/content');
  private readonly TESTS_API = apiUrl('/tests');

  constructor(private http: HttpClient) { }

  // =========================
  // COURSE APIs
  // =========================
  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.COURSES_API);
  }

  getPublishedCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.COURSES_API}/published`);
  }

  createCourse(course: any): Observable<any> {
    return this.http.post<any>(this.COURSES_API, course);
  }

  updateCourse(courseId: number, course: any): Observable<any> {
    return this.http.put<any>(`${this.COURSES_API}/${courseId}`, course);
  }

  getCourseById(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.COURSES_API}/${courseId}`);
  }

  // =========================
  // MODULE APIs
  // =========================
  createModule(module: any): Observable<any> {
    return this.http.post<any>(`${this.CONTENT_API}/module`, module);
  }

  getModulesByCourse(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.CONTENT_API}/module/course/${courseId}`);
  }

  // =========================
  // CONTENT APIs
  // =========================
  addContent(content: any): Observable<any> {
    return this.http.post<any>(`${this.CONTENT_API}/item`, content);
  }

  getContentByModule(moduleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.CONTENT_API}/item/module/${moduleId}`);
  }

  // =========================
  // TEST APIs
  // =========================
  createTest(test: any): Observable<any> {
    return this.http.post<any>(this.TESTS_API, test);
  }

  getTestsByCourse(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.TESTS_API}/course/${courseId}`);
  }

  // =========================
  // QUESTION APIs
  // =========================
  addQuestion(question: any): Observable<any> {
    return this.http.post<any>(`${this.TESTS_API}/question`, question);
  }

  getQuestions(testId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.TESTS_API}/${testId}/questions`);
  }

  // =========================
  // TEST ATTEMPT APIs
  // =========================
  startTestAttempt(attempt: any): Observable<any> {
    return this.http.post<any>(`${this.TESTS_API}/attempt`, attempt);
  }

  submitTestAttempt(attemptId: number): Observable<any> {
    return this.http.put<any>(`${this.TESTS_API}/attempt/${attemptId}/submit`, {});
  }

  // =========================
  // ANSWER APIs
  // =========================
  submitAnswer(answer: any): Observable<any> {
    return this.http.post<any>(`${this.TESTS_API}/answer`, answer);
  }

  // =========================
  // LEGACY/COMPATIBILITY METHODS
  // =========================
  // Added for component compatibility
  getInstructorCourses(instructorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.COURSES_API}?instructorId=${instructorId}`);
  }

  // Assignments are mapped to tests in this system
  getAssignments(moduleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.TESTS_API}/module/${moduleId}`);
  }

  createAssignment(assignment: any): Observable<any> {
    return this.http.post<any>(this.TESTS_API, assignment);
  }

  getStudentSubmission(assignmentId: number, studentId: number): Observable<any> {
    return this.http.get<any>(`${this.TESTS_API}/attempt/student/${studentId}/test/${assignmentId}`);
  }

  submitAssignment(submission: any): Observable<any> {
    return this.http.post<any>(`${this.TESTS_API}/attempt`, submission);
  }

  getSubmissions(assignmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.TESTS_API}/${assignmentId}/attempts`);
  }

  gradeSubmission(submissionId: number, gradeData: any): Observable<any> {
    return this.http.put<any>(`${this.TESTS_API}/attempt/${submissionId}/grade`, gradeData);
  }

  // Old method names for backward compatibility
  getModules(courseId: number): Observable<any[]> {
    return this.getModulesByCourse(courseId);
  }

  getContent(moduleId: number): Observable<any[]> {
    return this.getContentByModule(moduleId);
  }
}
