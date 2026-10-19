import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';
import { Teacher, Course, Work, DownloadItem } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // Signals for state
  public isDarkMode = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public isSecretAuthenticated = signal<boolean>(false);
  public isSecretUrlDetected = signal<boolean>(false);
  public isBackendOnline = signal<boolean>(false);
  public databaseType = signal<string>('Connecting...');

  // Secret Credentials as specified by user
  public readonly SECRET_KEY = 'phuttiphongF';
  public readonly SECRET_PIN = '119236';

  // Fallback initial data in case backend is offline
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    bio: 'นักศึกษาหลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ มุ่งมั่นพัฒนาทักษะด้านการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ (Mobile Application) ทั้งระบบ Android/iOS ด้วย Flutter และการเชื่อมต่อ Web API ด้วย Golang & TiDB Database',
    teachingPhilosophy: 'เรียนรู้ด้วยการลงมือปฏิบัติจริง (Hands-on Practice) มุ่งมั่นพัฒนาซอฟต์แวร์เพื่อตอบโจทย์ผู้ใช้งานจริง',
    stats: [
      { label: 'ระดับชั้น/กลุ่ม', value: 'ปวส.2', unit: 'สทส2 เลขที่ 12' },
      { label: 'รหัสวิชาหลัก', value: '31901-2009', unit: 'โมบายแอป' },
      { label: 'โครงงานผลงาน', value: '6+', unit: 'ชิ้นงาน' },
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
        // If PIN is also in URL (e.g. /phuttiphongF/119236 or ?secret=phuttiphongF&pin=119236)
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
      // Must be authenticated to enter edit mode
      return;
    }
    this.isEditMode.update(v => !v);
  }

  checkHealth(): void {
    this.http.get<any>(`${this.apiUrl}/health`).subscribe({
      next: (res) => {
        this.isBackendOnline.set(true);
        this.databaseType.set(res.databaseType || 'TiDB');
      },
      error: () => {
        this.isBackendOnline.set(false);
        this.databaseType.set('Offline (Local Mock)');
      }
    });
  }

  // --- Teacher ---
  getTeacher(): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/teacher`).pipe(
      map(t => this.parseTeacherData(t)),
      catchError(() => of(this.fallbackTeacher))
    );
  }

  updateTeacher(teacher: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/teacher`, teacher).pipe(
      map(t => this.parseTeacherData(t)),
      catchError(() => {
        this.fallbackTeacher = { ...teacher };
        return of(this.fallbackTeacher);
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
    return this.http.get<Course[]>(`${this.apiUrl}/courses`).pipe(
      catchError(() => of(this.fallbackCourses))
    );
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, course).pipe(
      catchError(() => {
        this.fallbackCourses.push(course);
        return of(course);
      })
    );
  }

  updateCourse(id: string, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/courses/${id}`, course).pipe(
      catchError(() => {
        const idx = this.fallbackCourses.findIndex(c => c.id === id);
        if (idx !== -1) this.fallbackCourses[idx] = { ...course };
        return of(course);
      })
    );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`).pipe(
      catchError(() => {
        this.fallbackCourses = this.fallbackCourses.filter(c => c.id !== id);
        this.fallbackWorks = this.fallbackWorks.filter(w => w.courseId !== id);
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

    return this.http.get<Work[]>(url).pipe(
      map(works => works.map(w => this.enrichWork(w))),
      catchError(() => {
        let filtered = [...this.fallbackWorks];
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

    // Parse galleryImages (ภาพข้างใน)
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
    return this.http.post<Work>(`${this.apiUrl}/works`, work).pipe(
      map(w => this.enrichWork(w)),
      catchError(() => {
        this.fallbackWorks.unshift(work);
        return of(this.enrichWork(work));
      })
    );
  }

  updateWork(id: string, work: Work): Observable<Work> {
    return this.http.put<Work>(`${this.apiUrl}/works/${id}`, work).pipe(
      map(w => this.enrichWork(w)),
      catchError(() => {
        const idx = this.fallbackWorks.findIndex(w => w.id === id);
        if (idx !== -1) this.fallbackWorks[idx] = { ...work };
        return of(this.enrichWork(work));
      })
    );
  }

  deleteWork(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/works/${id}`).pipe(
      catchError(() => {
        this.fallbackWorks = this.fallbackWorks.filter(w => w.id !== id);
        return of({ success: true });
      })
    );
  }

  // --- Downloads ---
  getDownloads(): Observable<DownloadItem[]> {
    return this.http.get<DownloadItem[]>(`${this.apiUrl}/downloads`).pipe(
      catchError(() => of(this.fallbackDownloads))
    );
  }

  createDownload(item: DownloadItem): Observable<DownloadItem> {
    return this.http.post<DownloadItem>(`${this.apiUrl}/downloads`, item).pipe(
      catchError(() => {
        this.fallbackDownloads.push(item);
        return of(item);
      })
    );
  }

  updateDownload(id: string, item: DownloadItem): Observable<DownloadItem> {
    return this.http.put<DownloadItem>(`${this.apiUrl}/downloads/${id}`, item).pipe(
      catchError(() => {
        const idx = this.fallbackDownloads.findIndex(d => d.id === id);
        if (idx !== -1) this.fallbackDownloads[idx] = { ...item };
        return of(item);
      })
    );
  }

  deleteDownload(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/downloads/${id}`).pipe(
      catchError(() => {
        this.fallbackDownloads = this.fallbackDownloads.filter(d => d.id !== id);
        return of({ success: true });
      })
    );
  }
}

