package handlers

import (
	"fmt"
	"net/http"
	"time"

	"kruaon-backend/config"
	"kruaon-backend/models"

	"github.com/gin-gonic/gin"
)

// HealthCheck provides API and Database connection status
func HealthCheck(c *gin.Context) {
	sqlDB, err := config.DB.DB()
	dbStatus := "connected"
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "error"
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       "ok",
		"service":      "Kru Aon Academic E-Portfolio API",
		"database":     dbStatus,
		"databaseType": config.DatabaseType,
		"time":         time.Now(),
	})
}

// -------------------------------------------------------------
// 1. Teacher Profile Handlers (หน้าโชว์อาจารย์เฉพาะวิชาการ)
// -------------------------------------------------------------

func GetTeacher(c *gin.Context) {
	var teacher models.Teacher
	result := config.DB.First(&teacher)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher profile not found"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

func UpdateTeacher(c *gin.Context) {
	var current models.Teacher
	if err := config.DB.First(&current).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher profile not found"})
		return
	}

	var input models.Teacher
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.ID = current.ID
	input.UpdatedAt = time.Now()
	config.DB.Save(&input)

	c.JSON(http.StatusOK, input)
}

// -------------------------------------------------------------
// 2. Courses Handlers (รายวิชาการเรียนการสอน)
// -------------------------------------------------------------

func GetCourses(c *gin.Context) {
	var courses []models.Course
	config.DB.Order("created_at asc").Find(&courses)
	c.JSON(http.StatusOK, courses)
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if course.ID == "" {
		course.ID = fmt.Sprintf("course-%d", time.Now().UnixNano()/1000000)
	}
	course.CreatedAt = time.Now()
	course.UpdatedAt = time.Now()

	if err := config.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := config.DB.First(&course, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	var input models.Course
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.ID = id
	input.UpdatedAt = time.Now()
	config.DB.Model(&course).Updates(input)

	c.JSON(http.StatusOK, input)
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	// Delete course and cascade delete associated works
	config.DB.Where("course_id = ?", id).Delete(&models.Work{})
	config.DB.Where("id = ?", id).Delete(&models.Course{})
	c.JSON(http.StatusOK, gin.H{"message": "Course and associated works deleted successfully"})
}

// -------------------------------------------------------------
// 3. Works Handlers (เก็บข้อมูลผลงานของรายวิชา)
// -------------------------------------------------------------

func GetWorks(c *gin.Context) {
	courseID := c.Query("courseId")
	category := c.Query("category")

	query := config.DB.Model(&models.Work{})

	if courseID != "" && courseID != "all" {
		query = query.Where("course_id = ?", courseID)
	}
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	var works []models.Work
	query.Order("created_at desc").Find(&works)
	c.JSON(http.StatusOK, works)
}

func CreateWork(c *gin.Context) {
	var work models.Work
	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if work.ID == "" {
		work.ID = fmt.Sprintf("work-%d", time.Now().UnixNano()/1000000)
	}
	work.CreatedAt = time.Now()
	work.UpdatedAt = time.Now()

	if err := config.DB.Create(&work).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, work)
}

func UpdateWork(c *gin.Context) {
	id := c.Param("id")
	var work models.Work
	if err := config.DB.First(&work, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Work not found"})
		return
	}

	var input models.Work
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.ID = id
	input.UpdatedAt = time.Now()
	config.DB.Model(&work).Updates(input)

	c.JSON(http.StatusOK, input)
}

func DeleteWork(c *gin.Context) {
	id := c.Param("id")
	config.DB.Where("id = ?", id).Delete(&models.Work{})
	c.JSON(http.StatusOK, gin.H{"message": "Work deleted successfully"})
}

// -------------------------------------------------------------
// 4. Downloads Handlers (คลังดาวน์โหลดเอกสาร)
// -------------------------------------------------------------

func GetDownloads(c *gin.Context) {
	var downloads []models.Download
	config.DB.Order("created_at asc").Find(&downloads)
	c.JSON(http.StatusOK, downloads)
}

func CreateDownload(c *gin.Context) {
	var download models.Download
	if err := c.ShouldBindJSON(&download); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if download.ID == "" {
		download.ID = fmt.Sprintf("dl-%d", time.Now().UnixNano()/1000000)
	}
	download.CreatedAt = time.Now()
	config.DB.Create(&download)
	c.JSON(http.StatusCreated, download)
}

func DeleteDownload(c *gin.Context) {
	id := c.Param("id")
	config.DB.Where("id = ?", id).Delete(&models.Download{})
	c.JSON(http.StatusOK, gin.H{"message": "Download item deleted successfully"})
}

func UpdateDownload(c *gin.Context) {
	id := c.Param("id")
	var download models.Download
	if err := config.DB.First(&download, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Download item not found"})
		return
	}

	var input models.Download
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.ID = id
	config.DB.Model(&download).Updates(input)
	c.JSON(http.StatusOK, input)
}

