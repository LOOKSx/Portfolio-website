package seed

import (
	"log"
	"time"

	"kruaon-backend/models"

	"gorm.io/gorm"
)

// SeedInitialData populates initial portfolio data if database is empty
func SeedInitialData(db *gorm.DB) {
	// 1. Teacher Profile Seed
	var count int64
	db.Model(&models.Teacher{}).Count(&count)
	if count == 0 {
		log.Println("[Seeder] Seeding initial Student Profile (นาย พุศิพงศ์ ราชรักษ์)...")
		statsJSON := `[
			{"label": "ระดับชั้น/กลุ่ม", "value": "ปวส.2", "unit": "สทส2 เลขที่ 12"},
			{"label": "รหัสวิชาหลัก", "value": "31901-2009", "unit": "โมบายแอป"},
			{"label": "โครงงานผลงาน", "value": "6+", "unit": "ชิ้นงาน"},
			{"label": "อาจารย์ผู้สอน", "value": "ครูอ๋อน", "unit": "ที่ปรึกษา"}
		]`
		eduJSON := `[
			{"degree": "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ", "institution": "ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ", "year": "ปัจจุบัน (2567)"},
			{"degree": "ประกาศนียบัตรวิชาชีพ (ปวช.) สาขาคอมพิวเตอร์/สารสนเทศ", "institution": "ผลการเรียนดีเด่น", "year": "2565"}
		]`
		achieveJSON := `[
			"ผู้พัฒนาโครงงานแอปพลิเคชันสำหรับอุปกรณ์เคลื่อนที่ รายวิชา 31901-2009 (อาจารย์ผู้สอน: ครูอ๋อน)",
			"ผ่านการฝึกปฏิบัติการเชื่อมต่อฐานข้อมูล TiDB / Distributed SQL และ REST API ด้วย Golang",
			"ผลการเรียนยอดเยี่ยมในกลุ่มวิชาการเขียนโปรแกรมและการพัฒนาซอฟต์แวร์"
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
			Avatar:             "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
			Bio:                "นักศึกษาหลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีสารสนเทศ มุ่งมั่นพัฒนาทักษะด้านการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ (Mobile Application) ทั้งระบบ Android/iOS ด้วย Flutter และการเชื่อมต่อ Web API ด้วย Golang & TiDB Database (อาจารย์ผู้สอน: ครูอ๋อน)",
			TeachingPhilosophy: "เรียนรู้ด้วยการลงมือปฏิบัติจริง (Hands-on Practice) มุ่งมั่นพัฒนาซอฟต์แวร์เพื่อตอบโจทย์ผู้ใช้งานจริง",
			StatsJSON:          statsJSON,
			EducationJSON:      eduJSON,
			AchievementsJSON:   achieveJSON,
			UpdatedAt:          time.Now(),
		}
		db.Create(&teacher)
	}

	// 2. Courses Seed
	db.Model(&models.Course{}).Count(&count)
	if count == 0 {
		log.Println("[Seeder] Seeding initial Courses...")
		courses := []models.Course{
			{
				ID:          "course-31901-2009",
				Code:        "31901-2009",
				Name:        "การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่",
				Level:       "ระดับ ปวส.2 สาขาเทคโนโลยีสารสนเทศ",
				Semester:    "ภาคเรียนที่ 1",
				Credits:     "3.0 หน่วยกิต (4 คาบ/สัปดาห์)",
				Description: "ศึกษาและปฏิบัติเกี่ยวกับหลักการพัฒนาซอฟต์แวร์บนอุปกรณ์เคลื่อนที่ สถาปัตยกรรมโมบาย การออกแบบ UI/UX การพัฒนาแอปพลิเคชันเชื่อมต่อ API และฐานข้อมูล TiDB/Cloud ในประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ",
				BadgeColor:  "amber",
				Icon:        "smartphone",
				CreatedAt:   time.Now(),
			},
			{
				ID:          "course-2",
				Code:        "ว30281",
				Name:        "การออกแบบและพัฒนาเว็บไซต์สมัยใหม่",
				Level:       "ระดับ ปวส. / มัธยมศึกษาตอนปลาย",
				Semester:    "ภาคเรียนที่ 2",
				Credits:     "1.5 หน่วยกิต (3 คาบ/สัปดาห์)",
				Description: "พื้นฐานโครงสร้าง HTML5, CSS3, TypeScript การออกแบบ UI/UX ตามหลักสากล และการพัฒนา Web Application เชื่อมต่อ Backend Golang และฐานข้อมูล",
				BadgeColor:  "brown",
				Icon:        "globe",
				CreatedAt:   time.Now(),
			},
			{
				ID:          "course-3",
				Code:        "ว22104",
				Name:        "การออกแบบและเทคโนโลยี",
				Level:       "ระดับ ปวช. / มัธยมศึกษา",
				Semester:    "ภาคเรียนที่ 2",
				Credits:     "1.0 หน่วยกิต (2 คาบ/สัปดาห์)",
				Description: "กระบวนการออกแบบเชิงวิศวกรรม การเลือกใช้วัสดุ อุปกรณ์ กลไกไฟฟ้าอิเล็กทรอนิกส์ และการแก้ปัญหาในชีวิตประจำวัน",
				BadgeColor:  "stone",
				Icon:        "cpu",
				CreatedAt:   time.Now(),
			},
			{
				ID:          "course-4",
				Code:        "ว23102",
				Name:        "นวัตกรรมและโครงงานดิจิทัล",
				Level:       "ระดับ ปวส.1 / มัธยมศึกษา",
				Semester:    "ภาคเรียนที่ 1",
				Credits:     "1.5 หน่วยกิต (3 คาบ/สัปดาห์)",
				Description: "การพัฒนาโครงงานซอฟต์แวร์ การศึกษาปัญหาในชุมชนและภาคอุตสาหกรรม การบูรณาการเทคโนโลยี และการนำเสนอผลงานสู่สาธารณชน",
				BadgeColor:  "orange",
				Icon:        "lightbulb",
				CreatedAt:   time.Now(),
			},
		}
		db.Create(&courses)
	}

	// 3. Works Seed
	db.Model(&models.Work{}).Count(&count)
	if count == 0 {
		log.Println("[Seeder] Seeding initial Works & Course Portfolios...")
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
				Description:   "ผลงานการพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่ ในรายวิชา 31901-2009 โดย นาย พุศิพงศ์ ราชรักษ์ ปวส.2 สทส2 เลขที่ 12 กลุ่ม 1 สาขาเทคโนโลยีสารสนเทศ ประเภทวิชาอุตสาหกรรมดิจิทัลและสารสนเทศ ออกแบบ UI/UX โมบายที่ทันสมัยและเชื่อมต่อระบบฐานข้อมูลอย่างมีประสิทธิภาพ",
				Link:          "#",
				DownloadText:  "ดูรายละเอียดโครงงานและผลงานแอป",
				Tags:          "31901-2009, ปวส.2, สทส2, เทคโนโลยีสารสนเทศ, อุตสาหกรรมดิจิทัล",
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
				Description:   "แผนการจัดการเรียนรู้ Active Learning รายวิชา 31901-2009 สาขาเทคโนโลยีสารสนเทศ มุ่งเน้นการฝึกทักษะการปฏิบัติงานจริง การออกแบบสถาปัตยกรรมซอฟต์แวร์โมบาย และการทดสอบระบบ",
				Link:          "#",
				DownloadText:  "ดาวน์โหลดแผนการสอน (PDF)",
				Tags:          "แผนการสอน, 31901-2009, ปวส., Active Learning",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-1",
				CourseID:      "course-2",
				Title:         "เว็บไซต์ประชาสัมพันธ์การท่องเที่ยวชุมชนเชิงวัฒนธรรม",
				Category:      "student",
				CategoryLabel: "ผลงานนักเรียน",
				Date:          "มกราคม 2567",
				StudentName:   "กลุ่มต้นกล้าไอที (นายภานุวัฒน์ และคณะ ม.5/2)",
				Image:         "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
				Description:   "ผลงานโครงงานกลุ่มวิชาพัฒนาเว็บไซต์ ออกแบบ UI สไตล์มินิมอล มีระบบค้นหาสถานที่ท่องเที่ยวในชุมชน และสามารถรองรับการแสดงผลบนสมาร์ตโฟนได้อย่างสมบูรณ์",
				Link:          "#",
				DownloadText:  "ดูตัวอย่างผลงานเว็บไซต์",
				Tags:          "HTML/CSS, Responsive, UI/UX, โครงงาน",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-2",
				CourseID:      "course-1",
				Title:         "ชุดสื่อการเรียนรู้อัลกอริทึมด้วยบอร์ดเกม 'ภารกิจพิชิตเขาวงกต'",
				Category:      "media",
				CategoryLabel: "สื่อนวัตกรรมการสอน",
				Date:          "กันยายน 2566",
				StudentName:   "จัดทำโดย: ครูอ๋อน",
				Image:         "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
				Description:   "สื่อนวัตกรรม Unplugged Coding สำหรับฝึกฝนแนวคิดเชิงคำนวณและอัลกอริทึม โดยไม่ต้องใช้อุปกรณ์คอมพิวเตอร์ ช่วยให้นักเรียนเข้าใจกระบวนการแตกปัญหาย่อย ได้อย่างสนุกสนาน",
				Link:          "#",
				DownloadText:  "ดาวน์โหลดคู่มือและสื่อการสอน (PDF)",
				Tags:          "Unplugged, Active Learning, นวัตกรรมครู",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-3",
				CourseID:      "course-1",
				Title:         "แผนการจัดการเรียนรู้ Active Learning หน่วย 'แนวคิดเชิงคำนวณ'",
				Category:      "plan",
				CategoryLabel: "แผนการสอน & ใบงาน",
				Date:          "มิถุนายน 2566",
				StudentName:   "ผู้จัดทำ: ครูอ๋อน",
				Image:         "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
				Description:   "แผนการจัดการเรียนรู้ 8 คาบ เน้นกระบวนการสืบเสาะหาความรู้และกิจกรรมกลุ่ม พร้อมใบกิจกรรม เกณฑ์การวัดและประเมินผลตามสภาพจริง (Rubric Assessment)",
				Link:          "#",
				DownloadText:  "ดาวน์โหลดแผนการสอนฉบับเต็ม (PDF)",
				Tags:          "แผนการสอน, ว.PA, Rubrics",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-4",
				CourseID:      "course-3",
				Title:         "แบบจำลองเครื่องคัดแยกขยะอัจฉริยะระบบเซนเซอร์",
				Category:      "student",
				CategoryLabel: "ผลงานนักเรียน",
				Date:          "กุมภาพันธ์ 2567",
				StudentName:   "ด.ญ.กัญญาณัฐ และ ด.ช.วีรภัทร ม.2/1",
				Image:         "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
				Description:   "ผลงานการประยุกต์ใช้กระบวนการออกแบบเชิงวิศวกรรม ผสานบอร์ดไมโครคอนโทรลเลอร์ตรวจจับขยะรีไซเคิล ช่วยสร้างความตระหนักเรื่องสิ่งแวดล้อมในโรงเรียน",
				Link:          "#",
				DownloadText:  "รายงานสรุปโครงงาน (PDF)",
				Tags:          "STEM, สิ่งประดิษฐ์, ไมโครคอนโทรลเลอร์",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-5",
				CourseID:      "course-4",
				Title:         "รางวัลเหรียญทอง การแข่งขันโครงงานคอมพิวเตอร์ประเภทซอฟต์แวร์",
				Category:      "award",
				CategoryLabel: "รางวัล & ผลสัมฤทธิ์",
				Date:          "สิงหาคม 2566",
				StudentName:   "ครูผู้ฝึกสอน: ครูอ๋อน / นักเรียนทีม AI Clean",
				Image:         "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=800&auto=format&fit=crop",
				Description:   "นำนักเรียนเข้าร่วมแข่งขันงานมหกรรมวิชาการระดับเขตพื้นที่การศึกษา ได้รับรางวัลเหรียญทองอันดับ 1 จากผลงานแอปพลิเคชันคัดแยกขยะด้วย Machine Learning",
				Link:          "#",
				DownloadText:  "เกียรติบัตรและเอกสารรับรอง",
				Tags:          "รางวัลเหรียญทอง, การแข่งขันวิชาการ, งานเขตพื้นที่",
				CreatedAt:     time.Now(),
			},
			{
				ID:            "work-6",
				CourseID:      "course-2",
				Title:         "ชุดวิดีโอคลิปการสอนย้อนหลัง 'Web Dev 101 สำหรับเยาวชน'",
				Category:      "media",
				CategoryLabel: "สื่อนวัตกรรมการสอน",
				Date:          "พฤศจิกายน 2566",
				StudentName:   "ผู้จัดทำ: ครูอ๋อน",
				Image:         "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
				Description:   "คลิปวิดีโอสั้นประกอบการสอน (Micro-learning) ความยาวตอนละ 5-8 นาที ให้นักเรียนสามารถทบทวนการเขียนโค้ดได้ทุกที่ทุกเวลาบนแพลตฟอร์มออนไลน์",
				Link:          "#",
				DownloadText:  "เปิดดูเพลย์ลิสต์บทเรียน",
				Tags:          "สื่อออนไลน์, Microlearning, Flipped Classroom",
				CreatedAt:     time.Now(),
			},
		}
		db.Create(&works)
	}

	// 4. Downloads Seed
	db.Model(&models.Download{}).Count(&count)
	if count == 0 {
		log.Println("[Seeder] Seeding initial Academic Downloads...")
		downloads := []models.Download{
			{
				ID:        "dl-1",
				Title:     "เอกสารประมวลรายวิชา (Course Syllabus) รหัสวิชา 31901-2009 การพัฒนาซอฟต์แวร์สำหรับอุปกรณ์เคลื่อนที่",
				Course:    "วิชา 31901-2009",
				Format:    "PDF",
				Size:      "2.4 MB",
				URL:       "#",
				CreatedAt: time.Now(),
			},
			{
				ID:        "dl-2",
				Title:     "รายงานสรุปผลโครงงาน Mobile Application (Flutter + TiDB) - นาย พุศิพงศ์ ราชรักษ์",
				Course:    "โครงงาน ปวส.2 สทส2",
				Format:    "PDF",
				Size:      "4.8 MB",
				URL:       "#",
				CreatedAt: time.Now(),
			},
			{
				ID:        "dl-3",
				Title:     "คู่มือการเชื่อมต่อ Golang REST API และฐานข้อมูล TiDB Distributed SQL",
				Course:    "เอกสารทางเทคนิค (Tech Guide)",
				Format:    "PDF",
				Size:      "1.5 MB",
				URL:       "#",
				CreatedAt: time.Now(),
			},
		}
		db.Create(&downloads)
	}
}
