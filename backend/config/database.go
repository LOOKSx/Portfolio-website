package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"kruaon-backend/models"
	"kruaon-backend/seed"

	"github.com/glebarez/sqlite"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB
var DatabaseType = "Unknown"

// InitDatabase initializes the TiDB / MySQL connection, with fallback to SQLite if TiDB is not running
func InitDatabase() *gorm.DB {
	_ = godotenv.Load()

	tidbHost := os.Getenv("TIDB_HOST")
	if tidbHost == "" {
		tidbHost = "127.0.0.1"
	}

	tidbPort := os.Getenv("TIDB_PORT")
	if tidbPort == "" {
		tidbPort = "4000" // TiDB default port is 4000
	}

	tidbUser := os.Getenv("TIDB_USER")
	if tidbUser == "" {
		tidbUser = "root"
	}

	tidbPassword := os.Getenv("TIDB_PASSWORD")

	tidbDatabase := os.Getenv("TIDB_DATABASE")
	if tidbDatabase == "" {
		tidbDatabase = "kruaon_portfolio"
	}

	tidbTLS := os.Getenv("TIDB_TLS")
	if tidbTLS == "" {
		tidbTLS = "false"
	}

	customDSN := os.Getenv("TIDB_DSN")
	var dsn string
	if customDSN != "" {
		dsn = customDSN
	} else {
		// TiDB / MySQL DSN format
		if tidbPassword != "" {
			dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=%s",
				tidbUser, tidbPassword, tidbHost, tidbPort, tidbDatabase, tidbTLS)
		} else {
			dsn = fmt.Sprintf("%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=%s",
				tidbUser, tidbHost, tidbPort, tidbDatabase, tidbTLS)
		}
	}

	log.Printf("[Database] Connecting to TiDB at %s:%s (Database: %s)...", tidbHost, tidbPort, tidbDatabase)

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), gormConfig)
	if err == nil {
		sqlDB, pingErr := DB.DB()
		if pingErr != nil || sqlDB.Ping() != nil {
			err = fmt.Errorf("ping failed: %v", pingErr)
		}
	}

	if err != nil {
		log.Printf("⚠️ [TiDB Notice] Could not connect to TiDB (%v).", err)
		log.Println("💡 [TiDB Notice] Falling back to local development database (kruaon_v2.db).")
		log.Println("👉 To connect with your TiDB server, configure TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD in backend/.env")

		// Fallback to SQLite so local testing works out of the box
		DB, err = gorm.Open(sqlite.Open("kruaon_v2.db"), gormConfig)
		if err != nil {
			log.Fatalf("Fatal: Failed to connect to fallback database: %v", err)
		}
		DatabaseType = "SQLite (Local Fallback)"
	} else {
		DatabaseType = "TiDB Cloud (Distributed SQL)"
		log.Println("✅ [Database] Successfully connected to TiDB Cloud Cluster!")
	}

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Auto Migration for all tables
	log.Println("[Database] Running AutoMigrate for models...")
	err = DB.AutoMigrate(
		&models.Teacher{},
		&models.Course{},
		&models.Work{},
		&models.Download{},
	)
	if err != nil {
		log.Printf("Migration warning: %v", err)
	}

	// Seed initial data
	seed.SeedInitialData(DB)

	return DB
}
