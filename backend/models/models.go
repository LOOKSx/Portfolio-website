package models

import "time"

// Teacher represents the Student & Academic Profile
type Teacher struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	Name               string    `gorm:"size:255" json:"name"`
	FullName           string    `gorm:"size:255" json:"fullName"`
	Position           string    `gorm:"size:255" json:"position"`
	School             string    `gorm:"size:255" json:"school"`
	Department         string    `gorm:"size:255" json:"department"`
	Instructor         string    `gorm:"size:255" json:"instructor"`
	InstructorRole     string    `gorm:"size:255" json:"instructorRole"`
	StudentGroup       string    `gorm:"size:255" json:"studentGroup"`
	Email              string    `gorm:"size:255" json:"email"`
	Phone              string    `gorm:"size:64" json:"phone"`
	LineID             string    `gorm:"size:128" json:"lineId"`
	Avatar             string    `gorm:"type:longtext" json:"avatar"`
	Bio                string    `gorm:"type:text" json:"bio"`
	TeachingPhilosophy string    `gorm:"type:text" json:"teachingPhilosophy"`
	StatsJSON          string    `gorm:"type:text" json:"statsJson"`
	EducationJSON      string    `gorm:"type:text" json:"educationJson"`
	AchievementsJSON   string    `gorm:"type:text" json:"achievementsJson"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// Course represents an Academic Course
type Course struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	Code        string    `gorm:"size:32;index" json:"code"`
	Name        string    `gorm:"size:255" json:"name"`
	Level       string    `gorm:"size:128" json:"level"`
	Semester    string    `gorm:"size:64" json:"semester"`
	Credits     string    `gorm:"size:64" json:"credits"`
	Description string    `gorm:"type:text" json:"description"`
	BadgeColor  string    `gorm:"size:32" json:"badgeColor"`
	Icon        string    `gorm:"size:64" json:"icon"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Work represents a Course Portfolio Item with Cover & Inside Gallery Images
type Work struct {
	ID            string    `gorm:"primaryKey;size:64" json:"id"`
	CourseID      string    `gorm:"size:64;index" json:"courseId"`
	Title         string    `gorm:"size:255" json:"title"`
	Category      string    `gorm:"size:64" json:"category"` // student, media, plan, award
	CategoryLabel string    `gorm:"size:128" json:"categoryLabel"`
	Date          string    `gorm:"size:64" json:"date"`
	StudentName   string    `gorm:"size:255" json:"studentName"`
	Image         string    `gorm:"type:longtext" json:"image"`         // ภาพหน้างาน (Cover Image)
	GalleryImages string    `gorm:"type:longtext" json:"galleryImages"` // ภาพข้างใน (Inside Gallery Images JSON)
	Description   string    `gorm:"type:text" json:"description"`
	Link          string    `gorm:"type:longtext" json:"link"`
	DownloadText  string    `gorm:"size:128" json:"downloadText"`
	FileName      string    `gorm:"size:255" json:"fileName"`
	FileSize      string    `gorm:"size:64" json:"fileSize"`
	FileType      string    `gorm:"size:64" json:"fileType"`
	Tags          string    `gorm:"size:255" json:"tags"` // comma-separated tags
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// Download represents an Academic Resource or Syllabus PDF
type Download struct {
	ID        string    `gorm:"primaryKey;size:64" json:"id"`
	Title     string    `gorm:"size:255" json:"title"`
	Course    string    `gorm:"size:128" json:"course"`
	Format    string    `gorm:"size:32" json:"format"`
	Size      string    `gorm:"size:32" json:"size"`
	URL       string    `gorm:"size:512" json:"url"`
	CreatedAt time.Time `json:"createdAt"`
}
