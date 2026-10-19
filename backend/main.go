package main

import (
	"log"
	"os"

	"kruaon-backend/config"
	"kruaon-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("=====================================================")
	log.Println("🎓 Kru Aon Academic Portfolio Backend Service (Go)")
	log.Println("⚡ Prepared for TiDB / MySQL Distributed SQL")
	log.Println("=====================================================")

	// 1. Initialize Database (TiDB with Fallback)
	config.InitDatabase()

	// 2. Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// 3. Setup CORS for Angular Frontend
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	r.Use(cors.New(corsConfig))

	// 4. API Routes
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", handlers.HealthCheck)

		// Teacher Profile
		api.GET("/teacher", handlers.GetTeacher)
		api.PUT("/teacher", handlers.UpdateTeacher)

		// Academic Courses
		api.GET("/courses", handlers.GetCourses)
		api.POST("/courses", handlers.CreateCourse)
		api.PUT("/courses/:id", handlers.UpdateCourse)
		api.DELETE("/courses/:id", handlers.DeleteCourse)

		// Course Works & Portfolios
		api.GET("/works", handlers.GetWorks)
		api.POST("/works", handlers.CreateWork)
		api.PUT("/works/:id", handlers.UpdateWork)
		api.DELETE("/works/:id", handlers.DeleteWork)

		// Academic Downloads
		api.GET("/downloads", handlers.GetDownloads)
		api.POST("/downloads", handlers.CreateDownload)
		api.PUT("/downloads/:id", handlers.UpdateDownload)
		api.DELETE("/downloads/:id", handlers.DeleteDownload)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s\n", port)
	log.Printf("📡 API Base URL: http://localhost:%s/api\n", port)
	log.Printf("📊 TiDB / Database Connection: %s\n", config.DatabaseType)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server stopped: %v", err)
	}
}
