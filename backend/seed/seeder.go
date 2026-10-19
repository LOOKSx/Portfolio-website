package seed

import (
	"log"
	"time"

	"kruaon-backend/models"

	"gorm.io/gorm"
)

// SeedInitialData populates initial portfolio data if database is empty
func SeedInitialData(db *gorm.DB) {
	// Cleanup: Ensure ONLY Course 31901-2009 and its works exist, remove unused courses & downloads
	db.Where("id != ?", "course-31901-2009").Delete(&models.Course{})
	db.Where("course_id != ?", "course-31901-2009").Delete(&models.Work{})
	db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Download{})

	// 1. Teacher Profile Seed
	var count int64
	db.Model(&models.Teacher{}).Count(&count)
	if count == 0 {
		log.Println("[Seeder] Seeding initial Student Profile (นาย พุศิพงศ์ ราชรักษ์)...")
		statsJSON := `[
			{"label": "ระดับชั้น/กลุ่ม", "value": "ปวส.2", "unit": "สทส2 เลขที่ 12"},
			{"label": "รหัสวิชาหลัก", "value": "31901-2009", "unit": "โมบายแอป"},
			{"label": "โครงงานผลงาน", "value": "3+", "unit": "ชิ้นงาน"},
			{"label": "อาจารย์ผู้สอน", "value": "ครูอ๋อน", "unit": "ที่ปรึกษา"}
		]`
		eduJSON := `[
			{"degree": "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ", "institution": "ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ", "year": "ปัจจุบัน (2567)"},
			{"degree": "ประกาศนียบัตรวิชาชีพ (ปวช.) สาขาคอมพิวเตอร์/สารสนเทศ", "institution": "ผลการเรียนดีเด่น", "year": "2565"}
		]`
		achieveJSON := `[
			"ผู้พัฒนาโครงงานแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ รายวิชา 31901-2009 (อาจารย์ผู้สอน: ครูอ๋อน)",
			"ผ่านการฝึกปฏิบัติการเชื่อมต่อฐานข้อมูล TiDB Cloud Serverless และ REST API ด้วย Golang",
			"ผลการเรียนยอดเยี่ยมในกลุ่มวิชาการเขียนโปรแกรมและการพัฒนาซอฟต์แวร์บนอุปกรณ์เคลื่อนที่"
		]`

		teacher := models.Teacher{
			Name:               "นาย พุศิพงศ์ ราชรักษ์",
			FullName:           "นาย พุศิพงศ์ ราชรักษ์ (สทส2 เลขที่ 12)",
			Position:           "นักศึกษา ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1",
			StudentGroup:       "ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1",
			Instructor:         "อาจารย์ผู้สอน: ครูอ๋อน",
			School:             "วิทยาลัยอาชีวศึกษา / วิทยาลัยเทคนิค (สังกัด สอศ.)",
			Department:         "สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ",
			Email:              "pusiphong.it@example.ac.th",
			Phone:              "08x-xxx-xxxx",
			LineID:             "@pusiphong_it",
			Avatar:             "/pusiphong.jpg",
			Bio:                "นักศึกษาหลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ มุ่งมั่นพัฒนาทักษะด้านการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ (Mobile Application) ทั้งระบบ Android/iOS ด้วย Flutter และการเชื่อมต่อ Web API ด้วย Golang & TiDB Database (อาจารย์ผู้สอน: ครูอ๋อน)",
			TeachingPhilosophy: "เรียนรู้ด้วยการลงมือปฏิบัติจริง (Hands-on Practice) มุ่งมั่นพัฒนาซอฟต์แวร์เพื่อตอบโจทย์ผู้ใช้งานจริง",
			StatsJSON:          statsJSON,
			EducationJSON:      eduJSON,
			AchievementsJSON:   achieveJSON,
			UpdatedAt:          time.Now(),
		}
		db.Create(&teacher)
	}

	// 2. Courses Seed (ONLY Course 31901-2009)
	var courseCount int64
	db.Model(&models.Course{}).Where("id = ?", "course-31901-2009").Count(&courseCount)
	if courseCount == 0 {
		log.Println("[Seeder] Seeding primary Course 31901-2009...")
		c := models.Course{
			ID:          "course-31901-2009",
			Code:        "31901-2009",
			Name:        "การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่",
			Level:       "ระดับ ปวส.2 สาขาเทคโนโลยีสารสนเทศ",
			Semester:    "ภาคเรียนที่ 1",
			Credits:     "3.0 หน่วยกิต (4 คาบ/สัปดาห์)",
			Description: "ศึกษาและปฏิบัติเกี่ยวกับหลักการพัฒนาซอฟต์แวร์บนอุปกรณ์เคลื่อนที่ สถาปัตยกรรมโมบาย การออกแบบ UI/UX การพัฒนาแอปพลิเคชันเชื่อมต่อ API และฐานข้อมูล TiDB Cloud ในประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ (อาจารย์ผู้สอน: ครูอ๋อน)",
			BadgeColor:  "amber",
			Icon:        "smartphone",
			CreatedAt:   time.Now(),
		}
		db.Create(&c)
	}

	// 3. Works Seed (ONLY for Course 31901-2009)
	var workCount int64
	db.Model(&models.Work{}).Where("course_id = ?", "course-31901-2009").Count(&workCount)
	if workCount == 0 {
		log.Println("[Seeder] Seeding initial Works for Course 31901-2009...")
		works := []models.Work{
			{
				ID:            "work-pusiphong",
				CourseID:      "course-31901-2009",
				Title:         "โครงงานแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ (Mobile Application Project)",
				Category:      "student",
				CategoryLabel: "ผลงานนักเรียน",
				Date:          "ภาคเรียนที่ 1 ปีการศึกษา 2567",
				StudentName:   "นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 (สาขาเทคโนโลยีสารสนเทศ)",
				Image:         "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop",
				GalleryImages: `["https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop"]`,
				Description:   "ผลงานการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ ในรายวิชา 31901-2009 โดย นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ ออกแบบ UI/UX โมบายที่ทันสมัยและเชื่อมต่อระบบฐานข้อมูล TiDB Cloud อย่างมีประสิทธิภาพ",
				Link:          "#",
				DownloadText:  "ดูรายละเอียดโครงงานและผลงานแอป",
				Tags:          "31901-2009, ปวส.2, สทส2, เทคโนโลยีสารสนเทศ, อุตสาหกรรมดิจิทัล, Flutter, TiDB",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-mobile-api",
				CourseID:      "course-31901-2009",
				Title:         "ระบบเชื่อมต่อ Mobile API และฐานข้อมูล TiDB Cloud Serverless",
				Category:      "media",
				CategoryLabel: "สื่อนวัตกรรมการสอน",
				Date:          "ภาคเรียนที่ 1 ปีการศึกษา 2567",
				StudentName:   "นาย พุศิพงศ์ ราชรักษ์ (อาจารย์ผู้สอน: ครูอ๋อน)",
				Image:         "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
				GalleryImages: `["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"]`,
				Description:   "การออกแบบและพัฒนา Backend RESTful API ด้วยภาษา Go (Golang) เพื่อรองรับการรับ-ส่งข้อมูลแบบ Real-time ระหว่างแอปพลิเคชันโมบายและฐานข้อมูล TiDB Cloud Serverless พร้อมระบบความปลอดภัย TLS Encryption",
				Link:          "#",
				DownloadText:  "ดูโครงสร้าง API & Data Models",
				Tags:          "Golang, REST API, TiDB Cloud, Distributed SQL, Backend",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-mobile-uiux",
				CourseID:      "course-31901-2009",
				Title:         "การออกแบบสถาปัตยกรรม UI/UX โมบายแอปพลิเคชัน (Mobile Prototype)",
				Category:      "award",
				CategoryLabel: "รางวัล & ผลสัมฤทธิ์",
				Date:          "ภาคเรียนที่ 1 ปีการศึกษา 2567",
				StudentName:   "นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2",
				Image:         "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
				GalleryImages: `["https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop"]`,
				Description:   "การออกแบบ Wireframe, User Flow และ Interactive Prototype สำหรับแอปพลิเคชันบนสมาร์ตโฟน รองรับการทำงานแบบ Responsive ทั้งอุปกรณ์เคลื่อนที่ระบบ Android และ iOS",
				Link:          "#",
				DownloadText:  "ดูตัวอย่าง Interactive Prototype",
				Tags:          "UI/UX, Figma, Prototype, Mobile Design",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-mobile-plan",
				CourseID:      "course-31901-2009",
				Title:         "แผนการจัดการเรียนรู้มุ่งเน้นสมรรถนะ วิชา 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่",
				Category:      "plan",
				CategoryLabel: "แผนการสอน & ใบงาน",
				Date:          "มิถุนายน 2567",
				StudentName:   "ผู้จัดทำ: ครูอ๋อน",
				Image:         "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
				GalleryImages: `["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"]`,
				Description:   "แผนการจัดการเรียนรู้ Active Learning รายวิชา 31901-2009 สาขาเทคโนโลยีสารสนเทศ มุ่งเน้นการฝึกทักษะการปฏิบัติงานจริง การออกแบบสถาปัตยกรรมซอฟต์แวร์โมบาย และการทดสอบระบบ",
				Link:          "#",
				DownloadText:  "ดูตัวอย่างแผนการสอน (PDF)",
				Tags:          "แผนการสอน, 31901-2009, ปวส., Active Learning",
				CreatedAt:     time.Now(),
			},
		}
		db.Create(&works)
	}
}
