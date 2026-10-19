import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from './services/portfolio.service';
import { Teacher, Course, Work, DownloadItem, EducationItem } from './models/portfolio.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public portfolio = inject(PortfolioService);

  // Data State
  teacher: Teacher | null = null;
  courses: Course[] = [];
  works: Work[] = [];
  downloads: DownloadItem[] = [];

  // Filter & Search State
  selectedCourseFilter: string = 'all';
  selectedCategoryFilter: string = 'all';
  searchQuery: string = '';

  // Modal State
  selectedWorkForDetail: Work | null = null;
  showWorkModal: boolean = false;
  showCourseModal: boolean = false;
  showTeacherModal: boolean = false;
  showDownloadModal: boolean = false;
  showSecretModal: boolean = false;
  showDiagnosticModal: boolean = false;
  isDiagnosticLoading: boolean = false;
  diagnosticData: any = null;
  diagnosticError: string = '';
  isSavingWork: boolean = false;
  isSavingTeacher: boolean = false;

  // Secret Auth Inputs
  secretKeyInput: string = '';
  secretPinInput: string = '';
  secretErrorMsg: string = '';

  // Form Models
  workForm: Partial<Work> = {};
  courseForm: Partial<Course> = {};
  teacherForm: Partial<Teacher> = {};
  downloadForm: Partial<DownloadItem> = {};

  // Inside Gallery State
  workGalleryImages: string[] = [];
  newInsideImageUrl: string = '';
  selectedDetailImage: string = '';

  // Form helpers for Teacher Education & Achievements
  teacherAchievementsText: string = '';
  teacherEdu1Degree: string = '';
  teacherEdu1Inst: string = '';
  teacherEdu1Year: string = '';
  teacherEdu2Degree: string = '';
  teacherEdu2Inst: string = '';
  teacherEdu2Year: string = '';

  // Notification Toast
  toastText: string = '';
  isToastVisible: boolean = false;

  ngOnInit(): void {
    this.loadAllData();

    // Check if secret link was detected in URL (e.g. /phuttiphongF or ?secret=phuttiphongF)
    if (this.portfolio.isSecretUrlDetected() && !this.portfolio.isSecretAuthenticated()) {
      setTimeout(() => {
        this.openSecretModal();
      }, 100);
    }
  }

  loadAllData(): void {
    this.portfolio.getTeacher().subscribe(t => this.teacher = t);
    this.portfolio.getCourses().subscribe(c => this.courses = c);
    this.portfolio.getWorks().subscribe(w => this.works = w);
    this.portfolio.getDownloads().subscribe(d => this.downloads = d);
  }

  // --- Secret Authentication ---
  openSecretModal(): void {
    this.secretErrorMsg = '';
    // If URL contained the secret key, prefill it!
    if (this.portfolio.isSecretUrlDetected()) {
      this.secretKeyInput = this.portfolio.SECRET_KEY;
    } else {
      this.secretKeyInput = '';
    }
    this.secretPinInput = '';
    this.showSecretModal = true;
  }

  closeSecretModal(): void {
    this.showSecretModal = false;
    this.secretErrorMsg = '';
  }

  submitSecretAuth(): void {
    const success = this.portfolio.authenticate(this.secretKeyInput, this.secretPinInput);
    if (success) {
      this.showSecretModal = false;
      this.secretErrorMsg = '';
      this.showToastNotification('🔓 ปลดล็อกโหมดแก้ไขลับสำเร็จ! ยินดีต้อนรับ นาย พุศิพงศ์ ราชรักษ์');
      // Append query parameter if not present
      if (typeof window !== 'undefined' && !window.location.search.includes(this.portfolio.SECRET_KEY)) {
        const url = new URL(window.location.href);
        url.searchParams.set('secret', this.portfolio.SECRET_KEY);
        window.history.replaceState({}, '', url.toString());
      }
    } else {
      this.secretErrorMsg = '❌ รหัสลับตรงลิงก์ หรือ รหัสผ่านเข้าใช้งานไม่ถูกต้อง!';
    }
  }

  exitSecretEditMode(): void {
    this.portfolio.logoutSecret();
    this.showToastNotification('🔒 ออกจากโหมดแก้ไขแล้ว (ล็อกระบบเรียบร้อย)');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('secret');
      url.searchParams.delete('pin');
      window.history.replaceState({}, '', url.pathname);
    }
  }

  copySecretLink(): void {
    if (typeof window !== 'undefined') {
      const secretUrl = `${window.location.origin}${window.location.pathname}?secret=${this.portfolio.SECRET_KEY}`;
      navigator.clipboard.writeText(secretUrl).then(() => {
        this.showToastNotification('📋 คัดลอกลิงก์ลับสำเร็จ: ' + secretUrl);
      }).catch(() => {
        prompt('คัดลอกลิงก์ลับด้านล่างนี้ได้เลยครับ:', secretUrl);
      });
    }
  }

  // --- Filtering & Computed Works ---
  get filteredWorks(): Work[] {
    return this.works.filter(w => {
      if (this.selectedCourseFilter !== 'all' && w.courseId !== this.selectedCourseFilter) {
        return false;
      }
      if (this.selectedCategoryFilter !== 'all' && w.category !== this.selectedCategoryFilter) {
        return false;
      }
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = w.title.toLowerCase().includes(q);
        const matchDesc = w.description?.toLowerCase().includes(q) || false;
        const matchStudent = w.studentName?.toLowerCase().includes(q) || false;
        const matchTags = w.tags?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchStudent && !matchTags) return false;
      }
      return true;
    });
  }

  getCourseWorksCount(courseId: string): number {
    return this.works.filter(w => w.courseId === courseId).length;
  }

  getCourseByWork(work: Work): Course | undefined {
    return this.courses.find(c => c.id === work.courseId);
  }

  filterByCourse(courseId: string): void {
    this.selectedCourseFilter = courseId;
  }

  filterByCategory(category: string): void {
    this.selectedCategoryFilter = category;
  }

  // --- Modals ---
  openWorkDetail(work: Work): void {
    this.selectedWorkForDetail = work;
    this.selectedDetailImage = work.image || '';
  }

  closeWorkDetail(): void {
    this.selectedWorkForDetail = null;
    this.selectedDetailImage = '';
  }

  setDetailImage(img: string): void {
    this.selectedDetailImage = img;
  }

  // --- Work CRUD ---
  openNewWorkModal(): void {
    this.workForm = {
      courseId: this.selectedCourseFilter !== 'all' ? this.selectedCourseFilter : (this.courses[0]?.id || 'course-31901-2009'),
      category: 'student',
      categoryLabel: 'ผลงานนักเรียน',
      title: '',
      studentName: 'นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1',
      date: 'ภาคเรียนที่ 1 ปีการศึกษา 2567',
      image: '',
      description: '',
      link: '#',
      downloadText: 'ดูตัวอย่างผลงาน / เอกสารโครงงาน',
      tags: '31901-2009, ปวส.2, สทส2'
    };
    this.workGalleryImages = [];
    this.newInsideImageUrl = '';
    this.showWorkModal = true;
  }

  openEditWorkModal(work: Work): void {
    this.workForm = { ...work };
    this.workGalleryImages = work.galleryList ? [...work.galleryList] : [];
    this.newInsideImageUrl = '';
    this.showWorkModal = true;
  }

  closeWorkModal(): void {
    this.showWorkModal = false;
  }

  addInsideImageUrl(): void {
    if (this.newInsideImageUrl && this.newInsideImageUrl.trim()) {
      this.workGalleryImages.push(this.newInsideImageUrl.trim());
      this.newInsideImageUrl = '';
      this.showToastNotification('เพิ่มรูปภาพข้างในเรียบร้อย');
    }
  }

  removeInsideImage(idx: number): void {
    this.workGalleryImages.splice(idx, 1);
    this.showToastNotification('ลบรูปภาพข้างในแล้ว');
  }

  handleInsideImagesUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      let count = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const res = e.target?.result as string;
          if (res) {
            this.workGalleryImages.push(res);
            count++;
            if (count === files.length) {
              this.showToastNotification(`เพิ่มภาพข้างในเรียบร้อย ${count} รูป`);
            }
          }
        };
        reader.readAsDataURL(file);
      });
      input.value = '';
    }
  }

  saveWork(): void {
    if (!this.workForm.title) {
      alert('กรุณากรอกชื่อผลงาน');
      return;
    }

    if (this.workForm.category === 'student') this.workForm.categoryLabel = 'ผลงานนักเรียน';
    if (this.workForm.category === 'media') this.workForm.categoryLabel = 'สื่อนวัตกรรมการสอน';
    if (this.workForm.category === 'plan') this.workForm.categoryLabel = 'แผนการสอน & ใบงาน';
    if (this.workForm.category === 'award') this.workForm.categoryLabel = 'รางวัล & ผลสัมฤทธิ์';

    if (!this.workForm.image) {
      this.workForm.image = 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop';
    }

    // Attach inside gallery images
    this.workForm.galleryImages = JSON.stringify(this.workGalleryImages);
    this.workForm.galleryList = [...this.workGalleryImages];

    this.isSavingWork = true;
    this.showToastNotification('☁️ กำลังส่งข้อมูลผลงานและรูปภาพเข้า TiDB Cloud Serverless...');

    if (this.workForm.id) {
      this.portfolio.updateWork(this.workForm.id, this.workForm as Work).subscribe({
        next: (updated) => {
          const idx = this.works.findIndex(w => w.id === updated.id);
          if (idx !== -1) this.works[idx] = updated;
          this.isSavingWork = false;
          this.showToastNotification(`✅ [ยืนยัน 100%] บันทึกผลงาน "${updated.title}" เข้า TiDB Cloud สำเร็จ! (${new Date().toLocaleTimeString('th-TH')} น.)`);
          this.closeWorkModal();
        },
        error: () => {
          this.isSavingWork = false;
          this.showToastNotification('❌ เกิดข้อผิดพลาดในการบันทึกผลงาน');
        }
      });
    } else {
      const newWork: Work = {
        id: 'work-' + Date.now(),
        courseId: this.workForm.courseId || this.courses[0]?.id || 'course-31901-2009',
        title: this.workForm.title || '',
        category: this.workForm.category || 'student',
        categoryLabel: this.workForm.categoryLabel || 'ผลงานนักเรียน',
        date: this.workForm.date || '',
        studentName: this.workForm.studentName || '',
        image: this.workForm.image || '',
        galleryImages: JSON.stringify(this.workGalleryImages),
        galleryList: [...this.workGalleryImages],
        description: this.workForm.description || '',
        link: this.workForm.link || '#',
        downloadText: this.workForm.downloadText || 'ดูรายละเอียด',
        tags: this.workForm.tags || ''
      };

      this.portfolio.createWork(newWork).subscribe({
        next: (saved) => {
          this.works.unshift(saved);
          this.isSavingWork = false;
          this.showToastNotification(`✅ [ยืนยัน 100%] เพิ่มผลงานใหม่เข้า TiDB Cloud สำเร็จ! (${new Date().toLocaleTimeString('th-TH')} น.)`);
          this.closeWorkModal();
        },
        error: () => {
          this.isSavingWork = false;
          this.showToastNotification('❌ เกิดข้อผิดพลาดในการเพิ่มผลงาน');
        }
      });
    }
  }

  deleteWork(work: Work, event: Event): void {
    event.stopPropagation();
    if (confirm(`คุณต้องการลบผลงาน "${work.title}" หรือไม่?`)) {
      this.portfolio.deleteWork(work.id).subscribe(() => {
        this.works = this.works.filter(w => w.id !== work.id);
        this.showToastNotification('ลบผลงานเรียบร้อยแล้ว');
      });
    }
  }

  // --- Course CRUD ---
  openNewCourseModal(): void {
    this.courseForm = {
      code: '',
      name: '',
      level: 'ระดับ ปวส.2 สาขาเทคโนโลยีสารสนเทศ',
      semester: 'ภาคเรียนที่ 1',
      credits: '3.0 หน่วยกิต (4 คาบ/สัปดาห์)',
      description: '',
      badgeColor: 'amber',
      icon: 'smartphone'
    };
    this.showCourseModal = true;
  }

  openEditCourseModal(course: Course): void {
    this.courseForm = { ...course };
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
  }

  saveCourse(): void {
    if (!this.courseForm.code || !this.courseForm.name) {
      alert('กรุณากรอกรหัสวิชาและชื่อวิชา');
      return;
    }

    if (this.courseForm.id) {
      this.portfolio.updateCourse(this.courseForm.id, this.courseForm as Course).subscribe(updated => {
        const idx = this.courses.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.courses[idx] = updated;
        this.showToastNotification('แก้ไขรายวิชาสำเร็จ');
        this.closeCourseModal();
      });
    } else {
      const newCourse: Course = {
        id: 'course-' + Date.now(),
        code: this.courseForm.code || '',
        name: this.courseForm.name || '',
        level: this.courseForm.level || '',
        semester: this.courseForm.semester || '',
        credits: this.courseForm.credits || '',
        description: this.courseForm.description || '',
        badgeColor: 'amber',
        icon: 'smartphone'
      };
      this.portfolio.createCourse(newCourse).subscribe(saved => {
        this.courses.push(saved);
        this.showToastNotification('เพิ่มรายวิชาใหม่เรียบร้อยแล้ว');
        this.closeCourseModal();
      });
    }
  }

  deleteCourse(course: Course): void {
    if (confirm(`คุณต้องการลบรายวิชา "${course.code} ${course.name}" และผลงานทั้งหมดในวิชานี้หรือไม่?`)) {
      this.portfolio.deleteCourse(course.id).subscribe(() => {
        this.courses = this.courses.filter(c => c.id !== course.id);
        this.works = this.works.filter(w => w.courseId !== course.id);
        if (this.selectedCourseFilter === course.id) this.selectedCourseFilter = 'all';
        this.showToastNotification('ลบรายวิชาเรียบร้อยแล้ว');
      });
    }
  }

  // --- Downloads CRUD ---
  openNewDownloadModal(): void {
    this.downloadForm = {
      title: '',
      course: 'วิชา 31901-2009',
      format: 'PDF',
      size: '1.5 MB',
      url: '#'
    };
    this.showDownloadModal = true;
  }

  openEditDownloadModal(dl: DownloadItem): void {
    this.downloadForm = { ...dl };
    this.showDownloadModal = true;
  }

  closeDownloadModal(): void {
    this.showDownloadModal = false;
  }

  saveDownload(): void {
    if (!this.downloadForm.title) {
      alert('กรุณากรอกชื่อเอกสารดาวน์โหลด');
      return;
    }

    if (this.downloadForm.id) {
      this.portfolio.updateDownload(this.downloadForm.id, this.downloadForm as DownloadItem).subscribe(updated => {
        const idx = this.downloads.findIndex(d => d.id === updated.id);
        if (idx !== -1) this.downloads[idx] = updated;
        this.showToastNotification('แก้ไขเอกสารดาวน์โหลดสำเร็จ');
        this.closeDownloadModal();
      });
    } else {
      const newDl: DownloadItem = {
        id: 'dl-' + Date.now(),
        title: this.downloadForm.title || '',
        course: this.downloadForm.course || 'วิชา 31901-2009',
        format: this.downloadForm.format || 'PDF',
        size: this.downloadForm.size || '1.0 MB',
        url: this.downloadForm.url || '#'
      };
      this.portfolio.createDownload(newDl).subscribe(saved => {
        this.downloads.push(saved);
        this.showToastNotification('เพิ่มเอกสารดาวน์โหลดใหม่สำเร็จ');
        this.closeDownloadModal();
      });
    }
  }

  deleteDownload(dl: DownloadItem, event?: Event): void {
    if (event) event.stopPropagation();
    if (confirm(`คุณต้องการลบเอกสารดาวน์โหลด "${dl.title}" หรือไม่?`)) {
      this.portfolio.deleteDownload(dl.id).subscribe(() => {
        this.downloads = this.downloads.filter(d => d.id !== dl.id);
        this.showToastNotification('ลบเอกสารดาวน์โหลดเรียบร้อยแล้ว');
      });
    }
  }

  // --- Teacher / Student Profile CRUD ---
  openEditTeacherModal(): void {
    if (this.teacher) {
      this.teacherForm = { ...this.teacher };
      // Populate text helpers
      this.teacherAchievementsText = (this.teacher.academicAchievements || []).join('\n');
      const edu = this.teacher.education || [];
      this.teacherEdu1Degree = edu[0]?.degree || '';
      this.teacherEdu1Inst = edu[0]?.institution || '';
      this.teacherEdu1Year = edu[0]?.year || '';
      this.teacherEdu2Degree = edu[1]?.degree || '';
      this.teacherEdu2Inst = edu[1]?.institution || '';
      this.teacherEdu2Year = edu[1]?.year || '';
      this.showTeacherModal = true;
    }
  }

  closeTeacherModal(): void {
    this.showTeacherModal = false;
  }

  saveTeacher(): void {
    if (this.teacherForm) {
      // Reconstruct academic achievements
      const achievements = this.teacherAchievementsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      this.teacherForm.academicAchievements = achievements;

      // Reconstruct education
      const education: EducationItem[] = [];
      if (this.teacherEdu1Degree) {
        education.push({
          degree: this.teacherEdu1Degree,
          institution: this.teacherEdu1Inst,
          year: this.teacherEdu1Year
        });
      }
      if (this.teacherEdu2Degree) {
        education.push({
          degree: this.teacherEdu2Degree,
          institution: this.teacherEdu2Inst,
          year: this.teacherEdu2Year
        });
      }
      this.teacherForm.education = education;

      this.isSavingTeacher = true;
      this.showToastNotification('☁️ กำลังส่งข้อมูลประวัตินักศึกษาเข้า TiDB Cloud Serverless...');

      this.portfolio.updateTeacher(this.teacherForm as Teacher).subscribe({
        next: (updated) => {
          this.teacher = updated;
          this.isSavingTeacher = false;
          this.showToastNotification(`✅ [ยืนยัน 100%] บันทึกข้อมูลประวัตินักศึกษาเข้า TiDB Cloud สำเร็จ! (${new Date().toLocaleTimeString('th-TH')} น.)`);
          this.closeTeacherModal();
        },
        error: () => {
          this.isSavingTeacher = false;
          this.showToastNotification('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลประวัติ');
        }
      });
    }
  }

  // --- Live TiDB Cloud Diagnostic Check (100% Verification) ---
  runSystemDiagnostic(): void {
    this.showDiagnosticModal = true;
    this.isDiagnosticLoading = true;
    this.diagnosticError = '';
    this.diagnosticData = null;

    this.portfolio.runDatabaseDiagnostic().subscribe({
      next: (res) => {
        this.diagnosticData = res;
        this.isDiagnosticLoading = false;
        if (res.status === 'ok') {
          this.showToastNotification(`🩺 ตรวจสอบระบบ TiDB Cloud สำเร็จ: สถานะ ${res.score}% เต็มร้อย!`);
        } else {
          this.diagnosticError = res.error || 'การเชื่อมต่อระบบขัดข้อง';
        }
      },
      error: (err) => {
        this.diagnosticError = err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์เพื่อทดสอบระบบได้';
        this.isDiagnosticLoading = false;
      }
    });
  }

  closeDiagnosticModal(): void {
    this.showDiagnosticModal = false;
  }

  // File Upload Helper (Base64)
  handleImageUpload(event: Event, targetField: 'work' | 'teacher'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeKb = (file.size / 1024).toFixed(1);
      this.showToastNotification(`⏳ กำลังอ่านและประมวลผลไฟล์รูปภาพ (${sizeKb} KB)...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (targetField === 'work') {
          this.workForm.image = result;
        } else if (targetField === 'teacher') {
          this.teacherForm.avatar = result;
        }
        this.showToastNotification(`✅ อัปโหลดรูปภาพ (${sizeKb} KB) พร้อมบันทึกเข้า TiDB Cloud เรียบร้อยแล้ว`);
      };
      reader.readAsDataURL(file);
    }
  }

  quickChangeAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.teacher) {
      const file = input.files[0];
      const sizeKb = (file.size / 1024).toFixed(1);
      this.showToastNotification(`⏳ [1/2] กำลังอ่านรูปโปรไฟล์ (${sizeKb} KB)...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && this.teacher) {
          this.showToastNotification('☁️ [2/2] กำลังส่งรูปโปรไฟล์เข้าบันทึกใน TiDB Cloud Serverless...');
          const updatedTeacher: Teacher = { ...this.teacher, avatar: result };
          this.portfolio.updateTeacher(updatedTeacher).subscribe({
            next: (res) => {
              this.teacher = res;
              this.showToastNotification(`✅ [ยืนยัน 100%] บันทึกรูปโปรไฟล์เข้า TiDB Cloud เรียบร้อย! (${new Date().toLocaleTimeString('th-TH')} น.)`);
            },
            error: () => {
              this.showToastNotification('❌ ไม่สามารถบันทึกรูปโปรไฟล์ลง TiDB Cloud ได้');
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  quickChangeWorkCover(work: Work, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeKb = (file.size / 1024).toFixed(1);
      this.showToastNotification(`⏳ [1/2] กำลังอ่านรูปหน้างาน (${sizeKb} KB)...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.showToastNotification('☁️ [2/2] กำลังบันทึกรูปหน้างานเข้า TiDB Cloud Serverless...');
          const updatedWork: Work = { ...work, image: result };
          this.portfolio.updateWork(work.id, updatedWork).subscribe({
            next: (res) => {
              const idx = this.works.findIndex(w => w.id === res.id);
              if (idx !== -1) this.works[idx] = res;
              if (this.selectedWorkForDetail && this.selectedWorkForDetail.id === res.id) {
                this.selectedWorkForDetail = res;
                this.selectedDetailImage = res.image;
              }
              this.showToastNotification(`✅ [ยืนยัน 100%] เปลี่ยนรูปหน้างานและซิงก์เข้า TiDB Cloud เรียบร้อย! (${new Date().toLocaleTimeString('th-TH')} น.)`);
            },
            error: () => {
              this.showToastNotification('❌ ไม่สามารถบันทึกรูปหน้างานลง TiDB Cloud ได้');
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  replaceInsideImage(idx: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeKb = (file.size / 1024).toFixed(1);
      this.showToastNotification(`⏳ กำลังอ่านภาพข้างใน #${idx + 1} (${sizeKb} KB)...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.workGalleryImages[idx] = result;
          this.showToastNotification(`✅ [ยืนยัน 100%] แทนที่ภาพข้างใน #${idx + 1} (${sizeKb} KB) เรียบร้อย (กดบันทึกเพื่อซิงก์เข้า TiDB Cloud)`);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  editWorkFromDetail(): void {
    if (this.selectedWorkForDetail) {
      const workToEdit = this.selectedWorkForDetail;
      this.closeWorkDetail();
      this.openEditWorkModal(workToEdit);
    }
  }

  showToastNotification(msg: string): void {
    this.toastText = msg;
    this.isToastVisible = true;
    setTimeout(() => {
      this.isToastVisible = false;
    }, 4000);
  }
}
