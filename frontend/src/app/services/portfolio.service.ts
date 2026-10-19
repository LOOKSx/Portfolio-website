import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';
import { Teacher, Course, Work, DownloadItem } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);

  // Dynamic API URL: In production / Vercel, uses relative '/api' (HTTPS, zero CORS/Mixed-Content issues)
  // When running locally on Angular dev server port 4200, connects to local backend port 8080
  private getApiUrl(): string {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const port = window.location.port;
      if ((host === 'localhost' || host === '127.0.0.1') && port === '4200') {
        return 'http://localhost:8080/api';
      }
      return '/api';
    }
    return '/api';
  }

  public apiUrl = this.getApiUrl();

  // Signals for state
  public isDarkMode = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public isSecretAuthenticated = signal<boolean>(false);
  public isSecretUrlDetected = signal<boolean>(false);
  public isBackendOnline = signal<boolean>(false);
  public databaseType = signal<string>('TiDB Cloud');
  public isSaving = signal<boolean>(false);
  public lastSaveStatus = signal<string>('พร้อมใช้งาน');
  public lastSavedAt = signal<string>('');
  public lastVerifiedScore = signal<number>(100);

  // Secret Credentials as specified by user
  public readonly SECRET_KEY = 'phuttiphongF';
  public readonly SECRET_PIN = '119236';

  // Fallback initial data in case TiDB Cloud is cold or offline
  private fallbackTeacher: Teacher = {
    id: 1,
    name: 'นาย พุศิพงศ์ ราชรักษ์',
    fullName: 'นาย พุศิพงศ์ ราชรักษ์ (สทส2 เลขที่ 12)',
    position: 'นักศึกษา ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1',
    school: 'วิทยาลัยอาชีวศึกษา / วิทยาลัยเทคนิค (สังกัด สอศ.)',
    department: 'สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ',
    instructor: 'อาจารย์ผู้สอน: ครูอ๋อน',
    studentGroup: 'ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1',
    email: 'pusiphong.it@example.ac.th',
    phone: '08x-xxx-xxxx',
    lineId: '@pusiphong_it',
    avatar: '/pusiphong.jpg',
    bio: 'นักศึกษาหลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ มุ่งมั่นพัฒนาทักษะด้านการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ (Mobile Application) ทั้งระบบ Android/iOS ด้วย Flutter และการเชื่อมต่อ Web API ด้วย Golang & TiDB Database',
    teachingPhilosophy: 'เรียนรู้ด้วยการลงมือปฏิบัติจริง (Hands-on Practice) มุ่งมั่นพัฒนาซอฟต์แวร์เพื่อตอบโจทย์ผู้ใช้งานจริง',
    stats: [
      { label: 'ระดับชั้น/กลุ่ม', value: 'ปวส.2', unit: 'สทส2 เลขที่ 12' },
      { label: 'รหัสวิชาหลัก', value: '31901-2009', unit: 'โมบายแอป' },
      { label: 'โครงงานผลงาน', value: '4+', unit: 'ชิ้นงาน' },
      { label: 'อาจารย์ผู้สอน', value: 'ครูอ๋อน', unit: 'ที่ปรึกษา' }
    ],
    education: [
      { degree: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ', institution: 'ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ', year: 'ปัจจุบัน (2567)' },
      { degree: 'ประกาศนียบัตรวิชาชีพ (ปวช.) สาขาคอมพิวเตอร์/สารสนเทศ', institution: 'ผลการเรียนดีเด่น', year: '2565' }
    ],
    academicAchievements: [
      'ผู้พัฒนาโครงงานแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ รายวิชา 31901-2009 (อาจารย์ผู้สอน: ครูอ๋อน)',
      'ผ่านการฝึกปฏิบัติการเชื่อมต่อฐานข้อมูล TiDB / Distributed SQL และ REST API ด้วย Golang',
      'ผลการเรียนยอดเยี่ยมในกลุ่มวิชาการเขียนโปรแกรมและการพัฒนาซอฟต์แวร์'
    ]
  };

  private fallbackCourses: Course[] = [
    {
      id: 'course-31901-2009',
      code: '31901-2009',
      name: 'การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่',
      level: 'ระดับ ปวส.2 สาขาเทคโนโลยีสารสนเทศ',
      semester: 'ภาคเรียนที่ 1',
      credits: '3.0 หน่วยกิต (4 คาบ/สัปดาห์)',
      description: 'ศึกษาและปฏิบัติเกี่ยวกับหลักการพัฒนาซอฟต์แวร์บนอุปกรณ์เคลื่อนที่ สถาปัตยกรรมโมบาย การออกแบบ UI/UX การพัฒนาแอปพลิเคชันเชื่อมต่อ API และฐานข้อมูล TiDB Cloud ในประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ (อาจารย์ผู้สอน: ครูอ๋อน)',
      badgeColor: 'amber',
      icon: 'smartphone'
    }
  ];

  private fallbackWorks: Work[] = [
    {
      id: 'work-pusiphong',
      courseId: 'course-31901-2009',
      title: 'โครงงานแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ (Mobile Application Project)',
      category: 'student',
      categoryLabel: 'ผลงานนักเรียน',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2567',
      studentName: 'นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 (สาขาเทคโนโลยีสารสนเทศ)',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop',
      galleryImages: '["https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop"]',
      galleryList: [
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop'
      ],
      description: 'ผลงานการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ ในรายวิชา 31901-2009 โดย นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ ออกแบบ UI/UX โมบายที่ทันสมัยและเชื่อมต่อระบบฐานข้อมูล TiDB Cloud อย่างมีประสิทธิภาพ',
      link: '#',
      downloadText: 'ดูรายละเอียดโครงงานและผลงานแอป',
      tags: '31901-2009, ปวส.2, สทส2, เทคโนโลยีสารสนเทศ, อุตสาหกรรมดิจิทัล, Flutter, TiDB'
    },
    {
      id: 'work-mobile-api',
      courseId: 'course-31901-2009',
      title: 'ระบบเชื่อมต่อ Mobile API และฐานข้อมูล TiDB Cloud Serverless',
      category: 'media',
      categoryLabel: 'สื่อนวัตกรรมการสอน',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2567',
      studentName: 'นาย พุศิพงศ์ ราชรักษ์ (อาจารย์ผู้สอน: ครูอ๋อน)',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
      galleryImages: '["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"]',
      galleryList: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop'],
      description: 'การออกแบบและพัฒนา Backend RESTful API ด้วยภาษา Go (Golang) เพื่อรองรับการรับ-ส่งข้อมูลแบบ Real-time ระหว่างแอปพลิเคชันโมบายและฐานข้อมูล TiDB Cloud Serverless พร้อมระบบความปลอดภัย TLS Encryption',
      link: '#',
      downloadText: 'ดูโครงสร้าง API & Data Models',
      tags: 'Golang, REST API, TiDB Cloud, Distributed SQL, Backend'
    },
    {
      id: 'work-mobile-uiux',
      courseId: 'course-31901-2009',
      title: 'การออกแบบสถาปัตยกรรม UI/UX โมบายแอปพลิเคชัน (Mobile Prototype)',
      category: 'award',
      categoryLabel: 'รางวัล & ผลสัมฤทธิ์',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2567',
      studentName: 'นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop',
      galleryImages: '["https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop"]',
      galleryList: ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop'],
      description: 'การออกแบบ Wireframe, User Flow และ Interactive Prototype สำหรับแอปพลิเคชันบนสมาร์ตโฟน รองรับการทำงานแบบ Responsive ทั้งอุปกรณ์เคลื่อนที่ระบบ Android และ iOS',
      link: '#',
      downloadText: 'ดูตัวอย่าง Interactive Prototype',
      tags: 'UI/UX, Figma, Prototype, Mobile Design'
    },
    {
      id: 'work-mobile-plan',
      courseId: 'course-31901-2009',
      title: 'แผนการจัดการเรียนรู้มุ่งเน้นสมรรถนะ วิชา 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่',
      category: 'plan',
      categoryLabel: 'แผนการสอน & ใบงาน',
      date: 'มิถุนายน 2567',
      studentName: 'ผู้จัดทำ: ครูอ๋อน',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
      galleryImages: '["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"]',
      galleryList: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop'],
      description: 'แผนการจัดการเรียนรู้ Active Learning รายวิชา 31901-2009 สาขาเทคโนโลยีสารสนเทศ มุ่งเน้นการฝึกทักษะการปฏิบัติงานจริง การออกแบบสถาปัตยกรรมซอฟต์แวร์โมบาย และการทดสอบระบบ',
      link: '#',
      downloadText: 'ดูตัวอย่างแผนการสอน (PDF)',
      tags: 'แผนการสอน, 31901-2009, ปวส., Active Learning'
    }
  ];

  private fallbackDownloads: DownloadItem[] = [];

  constructor() {
    // Check saved theme
    const savedTheme = localStorage.getItem('kruaon_theme_pref');
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }

    // Check existing secret session
    if (sessionStorage.getItem('kruaon_secret_auth') === 'true') {
      this.isSecretAuthenticated.set(true);
      this.isEditMode.set(true);
    }

    // Inspect URL for secret parameter (supports /phuttiphongF, ?secret=phuttiphongF, etc.)
    if (typeof window !== 'undefined') {
      const fullHref = window.location.href.toLowerCase();
      const secretKeyLower = this.SECRET_KEY.toLowerCase();
      const hasSecret = fullHref.includes(secretKeyLower);

      if (hasSecret) {
        this.isSecretUrlDetected.set(true);
        if (window.location.href.includes(this.SECRET_PIN)) {
          this.authenticate(this.SECRET_KEY, this.SECRET_PIN);
        }
      }
    }

    this.checkHealth();
  }

  authenticate(key: string, pin: string): boolean {
    if (key.trim() === this.SECRET_KEY && pin.trim() === this.SECRET_PIN) {
      this.isSecretAuthenticated.set(true);
      this.isEditMode.set(true);
      sessionStorage.setItem('kruaon_secret_auth', 'true');
      return true;
    }
    return false;
  }

  logoutSecret(): void {
    this.isSecretAuthenticated.set(false);
    this.isEditMode.set(false);
    sessionStorage.removeItem('kruaon_secret_auth');
  }

  toggleTheme(): void {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    localStorage.setItem('kruaon_theme_pref', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleEditMode(): void {
    if (!this.isSecretAuthenticated()) {
      return;
    }
    this.isEditMode.update(v => !v);
  }

  checkHealth(): void {
    this.http.get<any>(`${this.apiUrl}/health`).subscribe({
      next: (res) => {
        this.isBackendOnline.set(true);
        this.databaseType.set(res.databaseType || 'TiDB Cloud Serverless');
      },
      error: () => {
        this.isBackendOnline.set(false);
        this.databaseType.set('Offline (Local Mock)');
      }
    });
  }

  // Helper storage methods for instant optimistic UI & persistence
  private getCache<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setCache(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Ignore if quota or private mode
    }
  }

  // --- Teacher / Student Profile ---
  getTeacher(): Observable<Teacher> {
    const cached = this.getCache<Teacher>('kruaon_tidb_teacher');
    const initial = cached || this.fallbackTeacher;

    return this.http.get<Teacher>(`${this.apiUrl}/teacher`).pipe(
      map(t => {
        const parsed = this.parseTeacherData(t);
        this.setCache('kruaon_tidb_teacher', parsed);
        this.fallbackTeacher = { ...parsed };
        return parsed;
      }),
      catchError(() => of(initial))
    );
  }

  updateTeacher(teacher: Teacher): Observable<Teacher> {
    this.isSaving.set(true);
    this.setCache('kruaon_tidb_teacher', teacher);
    this.fallbackTeacher = { ...teacher };

    return this.http.put<Teacher>(`${this.apiUrl}/teacher`, teacher).pipe(
      map(t => {
        const parsed = this.parseTeacherData(t);
        this.setCache('kruaon_tidb_teacher', parsed);
        this.isSaving.set(false);
        this.lastSaveStatus.set('ซิงก์เข้า TiDB Cloud สำเร็จ 100%');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
        return parsed;
      }),
      catchError(() => {
        this.isSaving.set(false);
        this.lastSaveStatus.set('บันทึกใน Local Cache เรียบร้อย');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
        return of(teacher);
      })
    );
  }

  private parseTeacherData(t: Teacher): Teacher {
    try {
      if (t.statsJson) t.stats = JSON.parse(t.statsJson);
      if (t.educationJson) t.education = JSON.parse(t.educationJson);
      if (t.achievementsJson) t.academicAchievements = JSON.parse(t.achievementsJson);
    } catch (e) {
      // fallback
    }
    if (!t.stats) t.stats = this.fallbackTeacher.stats;
    if (!t.education) t.education = this.fallbackTeacher.education;
    if (!t.academicAchievements) t.academicAchievements = this.fallbackTeacher.academicAchievements;
    return t;
  }

  // --- Courses ---
  getCourses(): Observable<Course[]> {
    const cached = this.getCache<Course[]>('kruaon_tidb_courses');
    const initial = cached && cached.length > 0 ? cached : this.fallbackCourses;

    return this.http.get<Course[]>(`${this.apiUrl}/courses`).pipe(
      map(courses => {
        if (courses && courses.length > 0) {
          this.setCache('kruaon_tidb_courses', courses);
          this.fallbackCourses = [...courses];
          return courses;
        }
        return initial;
      }),
      catchError(() => of(initial))
    );
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, course).pipe(
      tap(saved => {
        this.fallbackCourses.push(saved);
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
      }),
      catchError(() => {
        this.fallbackCourses.push(course);
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
        return of(course);
      })
    );
  }

  updateCourse(id: string, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/courses/${id}`, course).pipe(
      tap(saved => {
        const idx = this.fallbackCourses.findIndex(c => c.id === id);
        if (idx !== -1) this.fallbackCourses[idx] = { ...saved };
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
      }),
      catchError(() => {
        const idx = this.fallbackCourses.findIndex(c => c.id === id);
        if (idx !== -1) this.fallbackCourses[idx] = { ...course };
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
        return of(course);
      })
    );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`).pipe(
      tap(() => {
        this.fallbackCourses = this.fallbackCourses.filter(c => c.id !== id);
        this.fallbackWorks = this.fallbackWorks.filter(w => w.courseId !== id);
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
      }),
      catchError(() => {
        this.fallbackCourses = this.fallbackCourses.filter(c => c.id !== id);
        this.fallbackWorks = this.fallbackWorks.filter(w => w.courseId !== id);
        this.setCache('kruaon_tidb_courses', this.fallbackCourses);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        return of({ success: true });
      })
    );
  }

  // --- Works ---
  getWorks(courseId?: string, category?: string): Observable<Work[]> {
    let url = `${this.apiUrl}/works`;
    const params: string[] = [];
    if (courseId && courseId !== 'all') params.push(`courseId=${courseId}`);
    if (category && category !== 'all') params.push(`category=${category}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const cached = this.getCache<Work[]>('kruaon_tidb_works');
    const initial = cached && cached.length > 0 ? cached : this.fallbackWorks;

    return this.http.get<Work[]>(url).pipe(
      map(works => {
        const enriched = works.map(w => this.enrichWork(w));
        if (!courseId || courseId === 'all') {
          this.setCache('kruaon_tidb_works', enriched);
          this.fallbackWorks = [...enriched];
        }
        return enriched;
      }),
      catchError(() => {
        let filtered = [...initial];
        if (courseId && courseId !== 'all') filtered = filtered.filter(w => w.courseId === courseId);
        if (category && category !== 'all') filtered = filtered.filter(w => w.category === category);
        return of(filtered.map(w => this.enrichWork(w)));
      })
    );
  }

  private enrichWork(w: Work): Work {
    if (w.tags) {
      w.tagsList = w.tags.split(',').map(t => t.trim()).filter(Boolean);
    } else {
      w.tagsList = [];
    }

    if (w.galleryImages) {
      try {
        if (typeof w.galleryImages === 'string') {
          w.galleryList = JSON.parse(w.galleryImages);
        } else if (Array.isArray(w.galleryImages)) {
          w.galleryList = w.galleryImages;
        }
      } catch (e) {
        w.galleryList = [];
      }
    } else {
      w.galleryList = [];
    }

    return w;
  }

  createWork(work: Work): Observable<Work> {
    this.isSaving.set(true);
    return this.http.post<Work>(`${this.apiUrl}/works`, work).pipe(
      map(w => this.enrichWork(w)),
      tap(saved => {
        this.fallbackWorks.unshift(saved);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        this.isSaving.set(false);
        this.lastSaveStatus.set('ซิงก์เข้า TiDB Cloud สำเร็จ 100%');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
      }),
      catchError(() => {
        const enriched = this.enrichWork(work);
        this.fallbackWorks.unshift(enriched);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        this.isSaving.set(false);
        this.lastSaveStatus.set('บันทึกใน Local Cache เรียบร้อย');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
        return of(enriched);
      })
    );
  }

  updateWork(id: string, work: Work): Observable<Work> {
    this.isSaving.set(true);
    return this.http.put<Work>(`${this.apiUrl}/works/${id}`, work).pipe(
      map(w => this.enrichWork(w)),
      tap(saved => {
        const idx = this.fallbackWorks.findIndex(w => w.id === id);
        if (idx !== -1) this.fallbackWorks[idx] = { ...saved };
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        this.isSaving.set(false);
        this.lastSaveStatus.set('ซิงก์เข้า TiDB Cloud สำเร็จ 100%');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
      }),
      catchError(() => {
        const enriched = this.enrichWork(work);
        const idx = this.fallbackWorks.findIndex(w => w.id === id);
        if (idx !== -1) this.fallbackWorks[idx] = { ...enriched };
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        this.isSaving.set(false);
        this.lastSaveStatus.set('บันทึกใน Local Cache เรียบร้อย');
        this.lastSavedAt.set(new Date().toLocaleTimeString('th-TH'));
        return of(enriched);
      })
    );
  }

  // --- Live TiDB Cloud Diagnostic Check (100% Verification) ---
  runDatabaseDiagnostic(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/diagnostic`).pipe(
      tap(res => {
        if (res && res.score !== undefined) {
          this.lastVerifiedScore.set(res.score);
        }
      }),
      catchError(err => {
        return of({
          status: 'error',
          score: 0,
          operationalPercent: '0%',
          grade: 'ไม่สามารถเชื่อมต่อได้',
          error: err.message || 'Network error',
          checks: []
        });
      })
    );
  }

  deleteWork(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/works/${id}`).pipe(
      tap(() => {
        this.fallbackWorks = this.fallbackWorks.filter(w => w.id !== id);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
      }),
      catchError(() => {
        this.fallbackWorks = this.fallbackWorks.filter(w => w.id !== id);
        this.setCache('kruaon_tidb_works', this.fallbackWorks);
        return of({ success: true });
      })
    );
  }

  // --- Downloads ---
  getDownloads(): Observable<DownloadItem[]> {
    return of(this.fallbackDownloads);
  }

  createDownload(item: DownloadItem): Observable<DownloadItem> {
    return of(item);
  }

  updateDownload(id: string, item: DownloadItem): Observable<DownloadItem> {
    return of(item);
  }

  deleteDownload(id: string): Observable<any> {
    return of({ success: true });
  }
}
