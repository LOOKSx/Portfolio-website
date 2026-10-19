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
      description: 'ศึกษาและปฏิบัติเกี่ยวกับหลักการพัฒนาซอฟต์แวร์บนอุปกรณ์เคลื่อนที่ สถาปัตยกรรมโมบาย การออกแบบ UI/UX การพัฒนาแอปพลิเคชันเชื่อมต่อ API และฐานข้อมูล TiDB/Cloud ในประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ',
      badgeColor: 'amber',
      icon: 'smartphone'
    },
    {
      id: 'course-2',
      code: 'ว30281',
      name: 'การออกแบบและพัฒนาเว็บไซต์สมัยใหม่',
      level: 'ระดับ ปวส. / มัธยมศึกษาตอนปลาย',
      semester: 'ภาคเรียนที่ 2',
      credits: '1.5 หน่วยกิต (3 คาบ/สัปดาห์)',
      description: 'พื้นฐานโครงสร้าง HTML5, CSS3, TypeScript การออกแบบ UI/UX ตามหลักสากล และการพัฒนา Web Application เชื่อมต่อ Backend Golang และฐานข้อมูล',
      badgeColor: 'brown',
      icon: 'globe'
    },
    {
      id: 'course-3',
      code: 'ว22104',
      name: 'การออกแบบและเทคโนโลยี',
      level: 'ระดับ ปวช. / มัธยมศึกษา',
      semester: 'ภาคเรียนที่ 2',
      credits: '1.0 หน่วยกิต (2 คาบ/สัปดาห์)',
      description: 'กระบวนการออกแบบเชิงวิศวกรรม การเลือกใช้วัสดุ อุปกรณ์ กลไกไฟฟ้าอิเล็กทรอนิกส์ และการแก้ปัญหาในชีวิตประจำวัน',
      badgeColor: 'stone',
      icon: 'cpu'
    },
    {
      id: 'course-4',
      code: 'ว23102',
      name: 'นวัตกรรมและโครงงานดิจิทัล',
      level: 'ระดับ ปวส.1 / มัธยมศึกษา',
      semester: 'ภาคเรียนที่ 1',
      credits: '1.5 หน่วยกิต (3 คาบ/สัปดาห์)',
      description: 'การพัฒนาโครงงานซอฟต์แวร์ การศึกษาปัญหาในชุมชนและภาคอุตสาหกรรม การบูรณาการเทคโนโลยี และการนำเสนอผลงานสู่สาธารณชน',
      badgeColor: 'orange',
      icon: 'lightbulb'
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
      description: 'ผลงานการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ ในรายวิชา 31901-2009 โดย นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ ออกแบบ UI/UX โมบายที่ทันสมัยและเชื่อมต่อระบบฐานข้อมูลอย่างมีประสิทธิภาพ',
      link: '#',
      downloadText: 'ดูรายละเอียดโครงงานและผลงานแอป',
      tags: '31901-2009, ปวส.2, สทส2, เทคโนโลยีสารสนเทศ, อุตสาหกรรมดิจิทัล'
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
      description: 'แผนการจัดการเรียนรู้ Active Learning รายวิชา 31901-2009 สาขาเทคโนโลยีสารสนเทศ มุ่งเน้นการฝึกทักษะการปฏิบัติงานจริง การออกแบบสถาปัตยกรรมซอฟต์แวร์โมบาย และการทดสอบระบบ',
      link: '#',
      downloadText: 'ดาวน์โหลดแผนการสอน (PDF)',
      tags: 'แผนการสอน, 31901-2009, ปวส., Active Learning'
    },
    {
      id: 'work-1',
      courseId: 'course-2',
      title: 'เว็บไซต์ประชาสัมพันธ์การท่องเที่ยวชุมชนเชิงวัฒนธรรม',
      category: 'student',
      categoryLabel: 'ผลงานนักเรียน',
      date: 'มกราคม 2567',
      studentName: 'กลุ่มต้นกล้าไอที (นายภานุวัฒน์ และคณะ ม.5/2)',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      description: 'ผลงานโครงงานกลุ่มวิชาพัฒนาเว็บไซต์ ออกแบบ UI สไตล์มินิมอล มีระบบค้นหาสถานที่ท่องเที่ยวในชุมชน และสามารถรองรับการแสดงผลบนสมาร์ตโฟนได้อย่างสมบูรณ์',
      link: '#',
      downloadText: 'ดูตัวอย่างผลงานเว็บไซต์',
      tags: 'HTML/CSS, Responsive, UI/UX, โครงงาน'
    },
    {
      id: 'work-2',
      courseId: 'course-1',
      title: 'ชุดสื่อการเรียนรู้อัลกอริทึมด้วยบอร์ดเกม ภารกิจพิชิตเขาวงกต',
      category: 'media',
      categoryLabel: 'สื่อนวัตกรรมการสอน',
      date: 'กันยายน 2566',
      studentName: 'จัดทำโดย: ครูอ๋อน',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      description: 'สื่อนวัตกรรม Unplugged Coding สำหรับฝึกฝนแนวคิดเชิงคำนวณและอัลกอริทึม โดยไม่ต้องใช้อุปกรณ์คอมพิวเตอร์ ช่วยให้นักเรียนเข้าใจกระบวนการแตกปัญหาย่อย ได้อย่างสนุกสนาน',
      link: '#',
      downloadText: 'ดาวน์โหลดคู่มือและสื่อการสอน (PDF)',
      tags: 'Unplugged, Active Learning, นวัตกรรมครู'
    },
    {
      id: 'work-3',
      courseId: 'course-1',
      title: 'แผนการจัดการเรียนรู้ Active Learning หน่วย แนวคิดเชิงคำนวณ',
      category: 'plan',
      categoryLabel: 'แผนการสอน & ใบงาน',
      date: 'มิถุนายน 2566',
      studentName: 'ผู้จัดทำ: ครูอ๋อน',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
      description: 'แผนการจัดการเรียนรู้ 8 คาบ เน้นกระบวนการสืบเสาะหาความรู้และกิจกรรมกลุ่ม พร้อมใบกิจกรรม เกณฑ์การวัดและประเมินผลตามสภาพจริง (Rubric Assessment)',
      link: '#',
      downloadText: 'ดาวน์โหลดแผนการสอนฉบับเต็ม (PDF)',
      tags: 'แผนการสอน, ว.PA, Rubrics'
    },
    {
      id: 'work-4',
      courseId: 'course-3',
      title: 'แบบจำลองเครื่องคัดแยกขยะอัจฉริยะระบบเซนเซอร์',
      category: 'student',
      categoryLabel: 'ผลงานนักเรียน',
      date: 'กุมภาพันธ์ 2567',
      studentName: 'ด.ญ.กัญญาณัฐ และ ด.ช.วีรภัทร ม.2/1',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      description: 'ผลงานการประยุกต์ใช้กระบวนการออกแบบเชิงวิศวกรรม ผสานบอร์ดไมโครคอนโทรลเลอร์ตรวจจับขยะรีไซเคิล ช่วยสร้างความตระหนักเรื่องสิ่งแวดล้อมในโรงเรียน',
      link: '#',
      downloadText: 'รายงานสรุปโครงงาน (PDF)',
      tags: 'STEM, สิ่งประดิษฐ์, ไมโครคอนโทรลเลอร์'
    },
    {
      id: 'work-5',
      courseId: 'course-4',
      title: 'รางวัลเหรียญทอง การแข่งขันโครงงานคอมพิวเตอร์ประเภทซอฟต์แวร์',
      category: 'award',
      categoryLabel: 'รางวัล & ผลสัมฤทธิ์',
      date: 'สิงหาคม 2566',
      studentName: 'ครูผู้ฝึกสอน: ครูอ๋อน / นักเรียนทีม AI Clean',
      image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=800&auto=format&fit=crop',
      description: 'นำนักเรียนเข้าร่วมแข่งขันงานมหกรรมวิชาการระดับเขตพื้นที่การศึกษา ได้รับรางวัลเหรียญทองอันดับ 1 จากผลงานแอปพลิเคชันคัดแยกขยะด้วย Machine Learning',
      link: '#',
      downloadText: 'เกียรติบัตรและเอกสารรับรอง',
      tags: 'รางวัลเหรียญทอง, การแข่งขันวิชาการ, งานเขตพื้นที่'
    },
    {
      id: 'work-6',
      courseId: 'course-2',
      title: 'ชุดวิดีโอคลิปการสอนย้อนหลัง Web Dev 101 สำหรับเยาวชน',
      category: 'media',
      categoryLabel: 'สื่อนวัตกรรมการสอน',
      date: 'พฤศจิกายน 2566',
      studentName: 'ผู้จัดทำ: ครูอ๋อน',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      description: 'คลิปวิดีโอสั้นประกอบการสอน (Micro-learning) ความยาวตอนละ 5-8 นาที ให้นักเรียนสามารถทบทวนการเขียนโค้ดได้ทุกที่ทุกเวลาบนแพลตฟอร์มออนไลน์',
      link: '#',
      downloadText: 'เปิดดูเพลย์ลิสต์บทเรียน',
      tags: 'สื่อออนไลน์, Microlearning, Flipped Classroom'
    }
  ];

  private fallbackDownloads: DownloadItem[] = [
    {
      id: 'dl-1',
      title: 'เอกสารประมวลรายวิชา (Course Syllabus) รหัสวิชา 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่',
      course: 'วิชา 31901-2009',
      format: 'PDF',
      size: '2.4 MB',
      url: '#'
    },
    {
      id: 'dl-2',
      title: 'รายงานสรุปผลโครงงาน Mobile Application (Flutter + TiDB) - นาย พุศิพงศ์ ราชรักษ์',
      course: 'โครงงาน ปวส.2 สทส2',
      format: 'PDF',
      size: '4.8 MB',
      url: '#'
    },
    {
      id: 'dl-3',
      title: 'คู่มือการเชื่อมต่อ Golang REST API และฐานข้อมูล TiDB Distributed SQL',
      course: 'เอกสารทางเทคนิค (Tech Guide)',
      format: 'PDF',
      size: '1.5 MB',
      url: '#'
    }
  ];

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

    // Inspect URL for secret parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasSecret = params.get('secret') === this.SECRET_KEY || 
                        params.get('key') === this.SECRET_KEY || 
                        params.has(this.SECRET_KEY) || 
                        window.location.hash.includes(this.SECRET_KEY);

      if (hasSecret) {
        this.isSecretUrlDetected.set(true);
        // If PIN is also in URL (e.g. ?secret=phuttiphongF&pin=119236)
        if (params.get('pin') === this.SECRET_PIN) {
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

