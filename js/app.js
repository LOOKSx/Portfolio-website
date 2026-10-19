/**
 * ==========================================================================
 * 🚀 app.js : ตัวจัดการระบบเว็บสะสมผลงานครูอ๋อน (Portfolio Web Application)
 * ==========================================================================
 * - โหมดสี: ขาวครีม-น้ำตาลอ่อน (Light Mode) / โหมดสีดำ (Dark Mode)
 * - การจัดเก็บข้อมูล: LocalStorage + Data.js + Export/Import JSON
 * - ระบบโชว์อาจารย์เฉพาะวิชาการ & ระบบจัดการผลงานแยกตามรายวิชา
 * - ระบบแก้ไขข้อมูลได้ทั้งหมด (Live Edit System)
 */

// -------------------------------------------------------------
// 1. Data Store Management (ระบบจัดเก็บข้อมูล)
// -------------------------------------------------------------
const STORAGE_KEY = "kru_aon_portfolio_v2";
const THEME_KEY = "kru_aon_theme_pref";

let portfolioData = null;
let currentCourseFilter = "all";
let currentCategoryFilter = "all";
let searchQuery = "";
let isEditMode = false;

function safeCreateIcons() {
  if (typeof lucide !== "undefined" && lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

// โหลดข้อมูลเริ่มต้น (จาก LocalStorage ถ้ามี หรือจาก defaultPortfolioData ใน data.js)
function loadPortfolioData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      portfolioData = JSON.parse(saved);
    } else if (typeof defaultPortfolioData !== "undefined") {
      portfolioData = JSON.parse(JSON.stringify(defaultPortfolioData));
    } else {
      console.error("Data store not found");
    }
  } catch (e) {
    console.error("Error parsing saved data, falling back to default", e);
    portfolioData = JSON.parse(JSON.stringify(defaultPortfolioData));
  }
}

// บันทึกข้อมูลลง LocalStorage
function savePortfolioData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
    showToast("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
  } catch (e) {
    console.error("Could not save to localStorage", e);
    showToast("บันทึกไม่สำเร็จ (อาจเกินขนาดพื้นที่ความจำของเบราว์เซอร์)", "error");
  }
}

// คืนค่าข้อมูลเริ่มต้น
function resetToDefaultData() {
  if (confirm("คุณต้องการคืนค่าข้อมูลทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่? (ข้อมูลที่แก้ไขไว้จะถูกแทนที่)")) {
    portfolioData = JSON.parse(JSON.stringify(defaultPortfolioData));
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
    showToast("คืนค่าข้อมูลเริ่มต้นเรียบร้อยแล้ว", "info");
  }
}

// ส่งออกไฟล์ JSON สำหรับดาวน์โหลดไปเก็บไว้
function exportDataAsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `portfolio_data_kru_aon_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("ดาวน์โหลดไฟล์สำรองข้อมูล data.json สำเร็จ", "success");
}

// นำเข้าไฟล์ JSON จากเครื่อง
function importDataFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.teacher && imported.courses && imported.works) {
        portfolioData = imported;
        savePortfolioData();
        renderAll();
        showToast("นำเข้าข้อมูลจากไฟล์สำเร็จแล้ว", "success");
      } else {
        showToast("รูปแบบไฟล์ไม่ถูกต้อง", "error");
      }
    } catch (err) {
      showToast("เกิดข้อผิดพลาดในการอ่านไฟล์ JSON", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // reset input
}

// -------------------------------------------------------------
// 2. Theme Switcher (สลับโหมด ขาว-น้ำตาลอ่อน / ดำ)
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  updateThemeIcons();
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  updateThemeIcons();
}

function updateThemeIcons() {
  const isDark = document.documentElement.classList.contains("dark");
  const sunIcon = document.getElementById("themeSunIcon");
  const moonIcon = document.getElementById("themeMoonIcon");
  const themeLabel = document.getElementById("themeLabel");
  
  if (sunIcon && moonIcon) {
    if (isDark) {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
      if (themeLabel) themeLabel.innerText = "โหมดสีสว่าง";
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
      if (themeLabel) themeLabel.innerText = "โหมดสีดำ";
    }
  }
}

// -------------------------------------------------------------
// 3. Render Teacher Academic Profile (หน้าโชว์อาจารย์แค่วิชาการ)
// -------------------------------------------------------------
function renderTeacherProfile() {
  const t = portfolioData.teacher;
  if (!t) return;

  // Avatar & Basic Info
  const avatarEl = document.getElementById("teacherAvatar");
  if (avatarEl) {
    avatarEl.src = t.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop";
    avatarEl.alt = t.name;
  }

  const nameEl = document.getElementById("teacherName");
  if (nameEl) nameEl.textContent = t.name;

  const fullNameEl = document.getElementById("teacherFullName");
  if (fullNameEl) fullNameEl.textContent = t.fullName;

  const posEl = document.getElementById("teacherPosition");
  if (posEl) posEl.textContent = t.position;

  const schoolEl = document.getElementById("teacherSchool");
  if (schoolEl) schoolEl.textContent = t.school;

  const deptEl = document.getElementById("teacherDepartment");
  if (deptEl) deptEl.textContent = t.department;

  const bioEl = document.getElementById("teacherBio");
  if (bioEl) bioEl.textContent = t.bio;

  const philEl = document.getElementById("teacherPhilosophy");
  if (philEl) philEl.textContent = `“${t.teachingPhilosophy}”`;

  // Stats
  const statsContainer = document.getElementById("teacherStatsContainer");
  if (statsContainer && t.stats) {
    statsContainer.innerHTML = t.stats.map(s => `
      <div class="p-4 rounded-xl border border-custom bg-custom-surface transition-all duration-200 hover:border-custom-accent">
        <div class="text-2xl sm:text-3xl font-bold font-num text-custom-accent">${s.value}</div>
        <div class="text-xs sm:text-sm font-medium text-custom-muted mt-1">${s.label} (${s.unit})</div>
      </div>
    `).join("");
  }

  // Academic Education & Credentials
  const eduContainer = document.getElementById("teacherEducationContainer");
  if (eduContainer && t.education) {
    eduContainer.innerHTML = t.education.map(e => `
      <li class="flex items-start space-x-3 text-sm">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-custom-accent-soft text-custom-accent text-xs font-bold mt-0.5">✓</span>
        <div>
          <span class="font-semibold text-custom-main">${e.degree}</span>
          <div class="text-custom-muted text-xs">${e.institution} (ปี พ.ศ. ${e.year})</div>
        </div>
      </li>
    `).join("");
  }

  // Academic Achievements / PA
  const achieveContainer = document.getElementById("teacherAchievementsContainer");
  if (achieveContainer && t.academicAchievements) {
    achieveContainer.innerHTML = t.academicAchievements.map(a => `
      <li class="flex items-start space-x-3 text-sm">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold mt-0.5">★</span>
        <span class="text-custom-main">${a}</span>
      </li>
    `).join("");
  }

  // Contact info
  const emailEl = document.getElementById("teacherEmail");
  if (emailEl) emailEl.textContent = t.email || "-";
  const phoneEl = document.getElementById("teacherPhone");
  if (phoneEl) phoneEl.textContent = t.phone || "-";
  const lineEl = document.getElementById("teacherLine");
  if (lineEl) lineEl.textContent = t.lineId || "-";
}

// -------------------------------------------------------------
// 4. Render Courses (รายวิชาการเรียนการสอน)
// -------------------------------------------------------------
function renderCourses() {
  const container = document.getElementById("coursesListContainer");
  const navTabsContainer = document.getElementById("courseFilterTabs");
  if (!container) return;

  const courses = portfolioData.courses || [];

  // 1. Render Course Cards in Section
  container.innerHTML = courses.map(course => {
    const courseWorksCount = (portfolioData.works || []).filter(w => w.courseId === course.id).length;
    return `
      <div class="relative bg-custom-surface border border-custom rounded-2xl p-6 transition-all duration-300 hover:shadow-hover group">
        ${isEditMode ? `
          <div class="absolute top-4 right-4 flex space-x-1.5 z-10">
            <button onclick="openCourseModal('${course.id}')" class="p-1.5 rounded-lg bg-custom-accent-soft text-custom-accent hover:bg-custom-accent hover:text-white transition-colors" title="แก้ไขวิชา">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteCourse('${course.id}')" class="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-colors" title="ลบวิชา">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        ` : ''}

        <div class="flex items-center space-x-3 mb-3">
          <span class="px-2.5 py-1 text-xs font-bold rounded-md bg-custom-accent text-white font-num tracking-wide">${course.code}</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-custom-subtle text-custom-muted font-medium">${course.semester}</span>
        </div>

        <h3 class="text-lg font-bold text-custom-main group-hover:text-custom-accent transition-colors mb-2">${course.name}</h3>
        <p class="text-xs font-medium text-custom-accent mb-2">ระดับ: ${course.level} | ${course.credits}</p>
        <p class="text-xs text-custom-muted line-clamp-3 mb-4 leading-relaxed">${course.description}</p>

        <div class="pt-4 border-t border-custom flex items-center justify-between">
          <span class="text-xs text-custom-muted flex items-center gap-1.5 font-medium">
            <i data-lucide="folder-git-2" class="w-4 h-4 text-custom-accent"></i>
            ผลงานสะสม: <strong class="text-custom-main font-num">${courseWorksCount}</strong> ชิ้น
          </span>
          <button onclick="filterByCourse('${course.id}')" class="text-xs font-semibold text-custom-accent hover:underline flex items-center gap-1">
            ดูผลงานวิชานี้ <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // 2. Render Course Filter Tabs in Works Section
  if (navTabsContainer) {
    const totalWorks = (portfolioData.works || []).length;
    let tabsHtml = `
      <button onclick="filterByCourse('all')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${currentCourseFilter === 'all' ? 'bg-custom-accent text-white shadow-sm' : 'bg-custom-surface text-custom-muted border border-custom hover:border-custom-accent'}">
        ทั้งหมด (${totalWorks})
      </button>
    `;

    courses.forEach(c => {
      const count = (portfolioData.works || []).filter(w => w.courseId === c.id).length;
      const isActive = currentCourseFilter === c.id;
      tabsHtml += `
        <button onclick="filterByCourse('${c.id}')" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${isActive ? 'bg-custom-accent text-white shadow-sm' : 'bg-custom-surface text-custom-muted border border-custom hover:border-custom-accent'}">
          <span class="font-num font-semibold">${c.code}</span>
          <span class="hidden md:inline">${c.name.length > 16 ? c.name.slice(0, 16) + '...' : c.name}</span>
          <span class="text-xs px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-custom-subtle'}">${count}</span>
        </button>
      `;
    });

    navTabsContainer.innerHTML = tabsHtml;
  }
}

// -------------------------------------------------------------
// 5. Render Works Portfolio (เก็บข้อมูลผลงานของรายวิชา)
// -------------------------------------------------------------
function renderWorks() {
  const container = document.getElementById("worksGridContainer");
  const emptyState = document.getElementById("worksEmptyState");
  const countBadge = document.getElementById("worksCountBadge");
  if (!container) return;

  const works = portfolioData.works || [];
  const courses = portfolioData.courses || [];

  // Filter works
  const filtered = works.filter(item => {
    // 1. Course filter
    if (currentCourseFilter !== "all" && item.courseId !== currentCourseFilter) {
      return false;
    }
    // 2. Category filter
    if (currentCategoryFilter !== "all" && item.category !== currentCategoryFilter) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAuthor = (item.studentName || "").toLowerCase().includes(q);
      const matchTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAuthor && !matchTags) return false;
    }
    return true;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} ชิ้นงาน`;
  }

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  } else {
    if (emptyState) emptyState.classList.add("hidden");
  }

  container.innerHTML = filtered.map(w => {
    const course = courses.find(c => c.id === w.courseId) || { code: "ทั่วไป", name: "วิชาการ" };
    
    // Category badge class
    let badgeClass = "badge-student";
    if (w.category === "media") badgeClass = "badge-media";
    if (w.category === "plan") badgeClass = "badge-plan";
    if (w.category === "award") badgeClass = "badge-award";

    return `
      <div class="portfolio-card bg-custom-surface border border-custom rounded-2xl overflow-hidden flex flex-col relative group">
        ${isEditMode ? `
          <div class="absolute top-3 right-3 flex space-x-1 z-20">
            <button onclick="openWorkModal('${w.id}')" class="p-1.5 rounded-lg bg-custom-surface/90 text-custom-accent shadow-sm border border-custom hover:bg-custom-accent hover:text-white transition-colors" title="แก้ไขผลงาน">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteWork('${w.id}')" class="p-1.5 rounded-lg bg-custom-surface/90 text-red-600 shadow-sm border border-custom hover:bg-red-600 hover:text-white transition-colors" title="ลบผลงาน">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        ` : ''}

        <!-- Image Container -->
        <div class="relative h-48 sm:h-52 overflow-hidden bg-custom-subtle cursor-pointer" onclick="openWorkDetail('${w.id}')">
          <img src="${w.image || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop'}" 
               alt="${w.title}" 
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop'">
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="px-2 py-0.5 rounded text-xs font-bold font-num bg-custom-accent text-white shadow-sm">${course.code}</span>
            <span class="px-2 py-0.5 rounded text-xs font-semibold ${badgeClass}">${w.categoryLabel || 'ผลงาน'}</span>
          </div>
          <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] bg-black/60 text-white backdrop-blur-sm">
            ${w.date || ''}
          </span>
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-custom-main text-base line-clamp-2 hover:text-custom-accent transition-colors cursor-pointer mb-2" onclick="openWorkDetail('${w.id}')">
              ${w.title}
            </h4>
            <p class="text-xs text-custom-muted line-clamp-3 mb-3 leading-relaxed">
              ${w.description}
            </p>
          </div>

          <div class="pt-3 border-t border-custom mt-auto">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-custom-muted truncate max-w-[190px]">
                👤 ${w.studentName || '-'}
              </span>
              <button onclick="openWorkDetail('${w.id}')" class="text-custom-accent font-semibold flex items-center gap-1 hover:underline text-xs">
                ดูรายละเอียด <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1">
              ${(w.tags || []).slice(0, 3).map(t => `
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-custom-subtle text-custom-muted">${t}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// -------------------------------------------------------------
// 6. Render Academic Downloads (คลังดาวน์โหลดเอกสาร)
// -------------------------------------------------------------
function renderDownloads() {
  const container = document.getElementById("downloadsListContainer");
  if (!container) return;

  const dls = portfolioData.downloads || [];
  container.innerHTML = dls.map(d => `
    <div class="bg-custom-surface border border-custom rounded-2xl p-4 flex items-center justify-between transition-all hover:border-custom-accent hover:shadow-card">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-custom-accent-soft text-custom-accent flex items-center justify-center font-bold text-xs uppercase font-num">
          ${d.format || 'PDF'}
        </div>
        <div>
          <h5 class="text-sm font-bold text-custom-main line-clamp-1">${d.title}</h5>
          <p class="text-xs text-custom-muted">${d.course} • ขนาด ${d.size}</p>
        </div>
      </div>
      <a href="${d.url}" target="_blank" onclick="alert('ดาวน์โหลดไฟล์ตัวอย่าง: ' + '${d.title}')" class="p-2.5 rounded-xl bg-custom-subtle text-custom-main hover:bg-custom-accent hover:text-white transition-colors">
        <i data-lucide="download" class="w-4 h-4"></i>
      </a>
    </div>
  `).join("");
}

// -------------------------------------------------------------
// 7. Interactive Filtering & Search
// -------------------------------------------------------------
function filterByCourse(courseId) {
  currentCourseFilter = courseId;
  renderCourses();
  renderWorks();
  safeCreateIcons();
}

function filterByCategory(category) {
  currentCategoryFilter = category;
  
  // Update button active state
  document.querySelectorAll(".category-btn").forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add("bg-custom-accent", "text-white");
      btn.classList.remove("bg-custom-surface", "text-custom-muted");
    } else {
      btn.classList.remove("bg-custom-accent", "text-white");
      btn.classList.add("bg-custom-surface", "text-custom-muted");
    }
  });

  renderWorks();
  safeCreateIcons();
}

function handleSearch(input) {
  searchQuery = input.value;
  renderWorks();
  safeCreateIcons();
}

// -------------------------------------------------------------
// 8. Work Detail Lightbox Modal (ดูรายละเอียดผลงาน)
// -------------------------------------------------------------
function openWorkDetail(workId) {
  const work = (portfolioData.works || []).find(w => w.id === workId);
  if (!work) return;

  const course = (portfolioData.courses || []).find(c => c.id === work.courseId) || { code: "ทั่วไป", name: "วิชาการ" };
  const modal = document.getElementById("workDetailModal");
  if (!modal) return;

  document.getElementById("detailModalCourse").textContent = `${course.code} - ${course.name}`;
  document.getElementById("detailModalCategory").textContent = work.categoryLabel || "ผลงานวิชาการ";
  document.getElementById("detailModalTitle").textContent = work.title;
  document.getElementById("detailModalAuthor").textContent = work.studentName || "-";
  document.getElementById("detailModalDate").textContent = work.date || "-";
  document.getElementById("detailModalDescription").textContent = work.description;

  const imgEl = document.getElementById("detailModalImage");
  if (imgEl) {
    imgEl.src = work.image || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop";
    imgEl.alt = work.title;
  }

  const tagsContainer = document.getElementById("detailModalTags");
  if (tagsContainer) {
    tagsContainer.innerHTML = (work.tags || []).map(t => `
      <span class="px-2.5 py-1 text-xs rounded-lg bg-custom-subtle text-custom-main font-medium">#${t}</span>
    `).join("");
  }

  const actionLink = document.getElementById("detailModalDownloadBtn");
  if (actionLink) {
    actionLink.textContent = work.downloadText || "เปิดดูเอกสาร / สื่อการสอน";
    actionLink.href = work.link || "#";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  safeCreateIcons();
}

function closeWorkDetailModal() {
  const modal = document.getElementById("workDetailModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

// -------------------------------------------------------------
// 9. Edit Mode Toggle & Controls (ระบบเข้าสู่โหมดแก้ไขลับ)
// -------------------------------------------------------------
const SECRET_KEY = "phuttiphongF";
const SECRET_PIN = "119236";

function toggleEditMode() {
  if (!isEditMode) {
    openSecretPrompt();
  } else {
    setEditModeState(false);
    showToast("ปิดโหมดแก้ไขข้อมูลแล้ว (ล็อกระบบเรียบร้อย)", "info");
  }
}

function openSecretPrompt(prefillKey = "") {
  let key = prefillKey;
  if (!key) {
    key = prompt("🔐 กรุณาระบุรหัสลับตรงลิงก์ (Secret Key):", "");
    if (!key) return;
  }
  if (key.trim() !== SECRET_KEY) {
    alert("❌ รหัสลับตรงลิงก์ไม่ถูกต้อง! (รหัสคือ phuttiphongF)");
    return;
  }
  const pin = prompt("🔑 กรุณากรอกรหัสผ่านเข้าใช้งาน (Passcode 6 หลัก):", "");
  if (pin && pin.trim() === SECRET_PIN) {
    setEditModeState(true);
    showToast("🔓 เข้าสู่โหมดแก้ไขลับสำเร็จ! ยินดีต้อนรับ นาย พุศิพงศ์ ราชรักษ์", "success");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("secret", SECRET_KEY);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  } else if (pin !== null) {
    alert("❌ รหัสผ่านเข้าใช้งานไม่ถูกต้อง! (รหัสผ่านคือ 119236)");
  }
}

function setEditModeState(active) {
  isEditMode = active;
  const editBanner = document.getElementById("editModeBanner");
  const editBtn = document.getElementById("toggleEditModeBtn");
  const editFloatingBar = document.getElementById("editFloatingBar");
  const addCourseBtn = document.getElementById("addCourseBtn");
  const addWorkBtn = document.getElementById("addWorkBtn");
  const editProfileBtn = document.getElementById("editProfileBtn");

  if (isEditMode) {
    document.body.classList.add("is-editing");
    if (editBanner) editBanner.classList.remove("hidden");
    if (editFloatingBar) editFloatingBar.classList.remove("hidden");
    if (addCourseBtn) addCourseBtn.classList.remove("hidden");
    if (addWorkBtn) addWorkBtn.classList.remove("hidden");
    if (editProfileBtn) editProfileBtn.classList.remove("hidden");
    if (editBtn) {
      editBtn.classList.add("bg-amber-600", "text-white");
      editBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> กำลังอยู่ในโหมดแก้ไขลับ`;
    }
  } else {
    document.body.classList.remove("is-editing");
    if (editBanner) editBanner.classList.add("hidden");
    if (editFloatingBar) editFloatingBar.classList.add("hidden");
    if (addCourseBtn) addCourseBtn.classList.add("hidden");
    if (addWorkBtn) addWorkBtn.classList.add("hidden");
    if (editProfileBtn) editProfileBtn.classList.add("hidden");
    if (editBtn) {
      editBtn.classList.remove("bg-amber-600", "text-white");
      editBtn.innerHTML = `<i data-lucide="lock" class="w-4 h-4"></i> โหมดแก้ไขลับ`;
    }
  }

  renderCourses();
  renderWorks();
  safeCreateIcons();
}

// -------------------------------------------------------------
// 10. Modals: Edit Profile / Course / Work
// -------------------------------------------------------------

// --- Teacher Profile Modal ---
function openTeacherModal() {
  const t = portfolioData.teacher;
  const modal = document.getElementById("teacherEditModal");
  if (!modal) return;

  document.getElementById("formTeacherName").value = t.name || "";
  document.getElementById("formTeacherFullName").value = t.fullName || "";
  document.getElementById("formTeacherPosition").value = t.position || "";
  document.getElementById("formTeacherSchool").value = t.school || "";
  document.getElementById("formTeacherDept").value = t.department || "";
  document.getElementById("formTeacherBio").value = t.bio || "";
  document.getElementById("formTeacherPhil").value = t.teachingPhilosophy || "";
  document.getElementById("formTeacherAvatar").value = t.avatar || "";
  document.getElementById("formTeacherEmail").value = t.email || "";
  document.getElementById("formTeacherPhone").value = t.phone || "";
  document.getElementById("formTeacherLine").value = t.lineId || "";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  safeCreateIcons();
}

function closeTeacherModal() {
  const modal = document.getElementById("teacherEditModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

function saveTeacherProfile(event) {
  event.preventDefault();
  const t = portfolioData.teacher;
  t.name = document.getElementById("formTeacherName").value;
  t.fullName = document.getElementById("formTeacherFullName").value;
  t.position = document.getElementById("formTeacherPosition").value;
  t.school = document.getElementById("formTeacherSchool").value;
  t.department = document.getElementById("formTeacherDept").value;
  t.bio = document.getElementById("formTeacherBio").value;
  t.teachingPhilosophy = document.getElementById("formTeacherPhil").value;
  t.avatar = document.getElementById("formTeacherAvatar").value;
  t.email = document.getElementById("formTeacherEmail").value;
  t.phone = document.getElementById("formTeacherPhone").value;
  t.lineId = document.getElementById("formTeacherLine").value;

  savePortfolioData();
  renderTeacherProfile();
  closeTeacherModal();
  showToast("บันทึกข้อมูลอาจารย์สำเร็จแล้ว", "success");
}

// --- Course Modal (Add / Edit) ---
let editingCourseId = null;

function openCourseModal(courseId = null) {
  editingCourseId = courseId;
  const modal = document.getElementById("courseEditModal");
  const modalTitle = document.getElementById("courseModalTitle");
  if (!modal) return;

  if (courseId) {
    const course = portfolioData.courses.find(c => c.id === courseId);
    if (!course) return;
    modalTitle.textContent = "แก้ไขรายวิชาการสอน";
    document.getElementById("formCourseCode").value = course.code;
    document.getElementById("formCourseName").value = course.name;
    document.getElementById("formCourseLevel").value = course.level;
    document.getElementById("formCourseSemester").value = course.semester;
    document.getElementById("formCourseCredits").value = course.credits;
    document.getElementById("formCourseDesc").value = course.description;
  } else {
    modalTitle.textContent = "เพิ่มรายวิชาการสอนใหม่";
    document.getElementById("formCourseCode").value = "";
    document.getElementById("formCourseName").value = "";
    document.getElementById("formCourseLevel").value = "ชั้นมัธยมศึกษาปีที่ 1";
    document.getElementById("formCourseSemester").value = "ภาคเรียนที่ 1";
    document.getElementById("formCourseCredits").value = "1.0 หน่วยกิต (2 คาบ/สัปดาห์)";
    document.getElementById("formCourseDesc").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  safeCreateIcons();
}

function closeCourseModal() {
  const modal = document.getElementById("courseEditModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

function saveCourse(event) {
  event.preventDefault();
  const code = document.getElementById("formCourseCode").value.trim();
  const name = document.getElementById("formCourseName").value.trim();
  const level = document.getElementById("formCourseLevel").value.trim();
  const semester = document.getElementById("formCourseSemester").value.trim();
  const credits = document.getElementById("formCourseCredits").value.trim();
  const description = document.getElementById("formCourseDesc").value.trim();

  if (!code || !name) {
    alert("กรุณากรอกรหัสวิชาและชื่อวิชา");
    return;
  }

  if (editingCourseId) {
    const idx = portfolioData.courses.findIndex(c => c.id === editingCourseId);
    if (idx !== -1) {
      portfolioData.courses[idx] = {
        ...portfolioData.courses[idx],
        code, name, level, semester, credits, description
      };
      showToast("แก้ไขรายวิชาสำเร็จ", "success");
    }
  } else {
    const newId = "course-" + Date.now();
    portfolioData.courses.push({
      id: newId,
      code, name, level, semester, credits, description,
      badgeColor: "amber",
      icon: "book-open"
    });
    showToast("เพิ่มรายวิชาใหม่เรียบร้อยแล้ว", "success");
  }

  savePortfolioData();
  renderCourses();
  renderWorks();
  closeCourseModal();
  safeCreateIcons();
}

function deleteCourse(courseId) {
  const course = portfolioData.courses.find(c => c.id === courseId);
  if (!course) return;

  if (confirm(`คุณแน่ใจว่าต้องการลบวิชา "${course.code} ${course.name}" และผลงานในวิชานี้หรือไม่?`)) {
    portfolioData.courses = portfolioData.courses.filter(c => c.id !== courseId);
    portfolioData.works = portfolioData.works.filter(w => w.courseId !== courseId);
    if (currentCourseFilter === courseId) currentCourseFilter = "all";
    savePortfolioData();
    renderCourses();
    renderWorks();
    showToast("ลบรายวิชาเรียบร้อยแล้ว", "info");
    safeCreateIcons();
  }
}

// --- Work Modal (Add / Edit) ---
let editingWorkId = null;

function openWorkModal(workId = null) {
  editingWorkId = workId;
  const modal = document.getElementById("workEditModal");
  const modalTitle = document.getElementById("workModalTitle");
  const courseSelect = document.getElementById("formWorkCourse");
  if (!modal) return;

  // Populate course dropdown
  courseSelect.innerHTML = (portfolioData.courses || []).map(c => `
    <option value="${c.id}">${c.code} - ${c.name}</option>
  `).join("");

  if (workId) {
    const work = portfolioData.works.find(w => w.id === workId);
    if (!work) return;
    modalTitle.textContent = "แก้ไขผลงานรายวิชา";
    courseSelect.value = work.courseId;
    document.getElementById("formWorkTitle").value = work.title;
    document.getElementById("formWorkCategory").value = work.category;
    document.getElementById("formWorkAuthor").value = work.studentName || "";
    document.getElementById("formWorkDate").value = work.date || "";
    document.getElementById("formWorkImage").value = work.image || "";
    document.getElementById("formWorkDesc").value = work.description || "";
    document.getElementById("formWorkLink").value = work.link || "";
    document.getElementById("formWorkDownloadText").value = work.downloadText || "";
    document.getElementById("formWorkTags").value = (work.tags || []).join(", ");
  } else {
    modalTitle.textContent = "เพิ่มผลงานในรายวิชา";
    if (currentCourseFilter !== "all") {
      courseSelect.value = currentCourseFilter;
    }
    document.getElementById("formWorkTitle").value = "";
    document.getElementById("formWorkCategory").value = "student";
    document.getElementById("formWorkAuthor").value = "";
    document.getElementById("formWorkDate").value = "ปีการศึกษา 2567";
    document.getElementById("formWorkImage").value = "";
    document.getElementById("formWorkDesc").value = "";
    document.getElementById("formWorkLink").value = "#";
    document.getElementById("formWorkDownloadText").value = "ดูตัวอย่างผลงาน / ดาวน์โหลด";
    document.getElementById("formWorkTags").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  safeCreateIcons();
}

function closeWorkModal() {
  const modal = document.getElementById("workEditModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

function handleImageFileUpload(event, targetInputId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById(targetInputId).value = e.target.result;
    showToast("อัปโหลดและแปลงภาพตัวอย่างเรียบร้อยแล้ว", "info");
  };
  reader.readAsDataURL(file);
}

function saveWork(event) {
  event.preventDefault();
  const courseId = document.getElementById("formWorkCourse").value;
  const title = document.getElementById("formWorkTitle").value.trim();
  const category = document.getElementById("formWorkCategory").value;
  const studentName = document.getElementById("formWorkAuthor").value.trim();
  const date = document.getElementById("formWorkDate").value.trim();
  let image = document.getElementById("formWorkImage").value.trim();
  const description = document.getElementById("formWorkDesc").value.trim();
  const link = document.getElementById("formWorkLink").value.trim() || "#";
  const downloadText = document.getElementById("formWorkDownloadText").value.trim() || "ดูรายละเอียด";
  const rawTags = document.getElementById("formWorkTags").value.trim();
  const tags = rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (!title) {
    alert("กรุณากรอกชื่อผลงาน");
    return;
  }

  let categoryLabel = "ผลงานนักเรียน";
  if (category === "media") categoryLabel = "สื่อนวัตกรรมการสอน";
  if (category === "plan") categoryLabel = "แผนการสอน & ใบงาน";
  if (category === "award") categoryLabel = "รางวัล & ผลสัมฤทธิ์";

  if (!image) {
    image = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop";
  }

  if (editingWorkId) {
    const idx = portfolioData.works.findIndex(w => w.id === editingWorkId);
    if (idx !== -1) {
      portfolioData.works[idx] = {
        ...portfolioData.works[idx],
        courseId, title, category, categoryLabel, studentName, date, image, description, link, downloadText, tags
      };
      showToast("แก้ไขผลงานสำเร็จ", "success");
    }
  } else {
    const newId = "work-" + Date.now();
    portfolioData.works.unshift({
      id: newId,
      courseId, title, category, categoryLabel, studentName, date, image, description, link, downloadText, tags
    });
    showToast("เพิ่มผลงานใหม่เรียบร้อยแล้ว", "success");
  }

  savePortfolioData();
  renderCourses();
  renderWorks();
  closeWorkModal();
  safeCreateIcons();
}

function deleteWork(workId) {
  const work = portfolioData.works.find(w => w.id === workId);
  if (!work) return;

  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน "${work.title}" ?`)) {
    portfolioData.works = portfolioData.works.filter(w => w.id !== workId);
    savePortfolioData();
    renderCourses();
    renderWorks();
    showToast("ลบผลงานเรียบร้อยแล้ว", "info");
    safeCreateIcons();
  }
}

// -------------------------------------------------------------
// 11. Toast Notifications (แจ้งเตือนความเคลื่อนไหว)
// -------------------------------------------------------------
function showToast(msg, type = "info") {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastMessage");
  if (!toast || !toastText) return;

  toastText.textContent = msg;
  toast.classList.remove("hidden", "translate-y-10", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3000);
}

// -------------------------------------------------------------
// 12. Main Initializer (จุดเริ่มต้นโปรแกรม)
// -------------------------------------------------------------
function renderAll() {
  renderTeacherProfile();
  renderCourses();
  renderWorks();
  renderDownloads();
  safeCreateIcons();
}

function checkSecretFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hasSecret = params.get("secret") === SECRET_KEY || 
                      params.get("key") === SECRET_KEY || 
                      params.has(SECRET_KEY) || 
                      window.location.hash.includes(SECRET_KEY);
    if (hasSecret) {
      if (params.get("pin") === SECRET_PIN) {
        setEditModeState(true);
        showToast("🔓 ปลดล็อกโหมดแก้ไขลับอัตโนมัติ (นาย พุศิพงศ์ ราชรักษ์)", "success");
      } else {
        setTimeout(() => openSecretPrompt(SECRET_KEY), 300);
      }
    }
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadPortfolioData();
  renderAll();
  checkSecretFromUrl();
});

