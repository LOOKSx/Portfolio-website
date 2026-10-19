-- ===================================================================
-- 🗄️ TiDB Database Schema for ครูอ๋อน E-Portfolio (Academic Portfolio)
-- Compatible with TiDB v6.0+ / v7.0+ / TiDB Cloud Serverless & MySQL 8.0+
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `kruaon_portfolio` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kruaon_portfolio`;

-- 1. ตารางข้อมูลประวัติอาจารย์ด้านวิชาการ (Teacher Academic Profile)
CREATE TABLE IF NOT EXISTS `teachers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255),
    `school` VARCHAR(255),
    `department` VARCHAR(255),
    `email` VARCHAR(255),
    `phone` VARCHAR(64),
    `line_id` VARCHAR(64),
    `avatar` LONGTEXT,
    `bio` TEXT,
    `teaching_philosophy` TEXT,
    `stats_json` TEXT,
    `education_json` TEXT,
    `achievements_json` TEXT,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ตารางรายวิชาการเรียนการสอน (Academic Courses)
CREATE TABLE IF NOT EXISTS `courses` (
    `id` VARCHAR(64) PRIMARY KEY,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `level` VARCHAR(128),
    `semester` VARCHAR(64),
    `credits` VARCHAR(64),
    `description` TEXT,
    `badge_color` VARCHAR(32) DEFAULT 'amber',
    `icon` VARCHAR(64) DEFAULT 'code',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_courses_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ตารางผลงานประจำรายวิชา (Course Works & Student Showcases)
CREATE TABLE IF NOT EXISTS `works` (
    `id` VARCHAR(64) PRIMARY KEY,
    `course_id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(64) NOT NULL, -- student, media, plan, award
    `category_label` VARCHAR(128),
    `date` VARCHAR(64),
    `student_name` VARCHAR(255),
    `image` LONGTEXT,
    `description` TEXT,
    `link` VARCHAR(512),
    `download_text` VARCHAR(128),
    `tags` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_works_course_id` (`course_id`),
    KEY `idx_works_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ตารางคลังเอกสารและประมวลรายวิชา (Academic Downloads)
CREATE TABLE IF NOT EXISTS `downloads` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `course` VARCHAR(128),
    `format` VARCHAR(32) DEFAULT 'PDF',
    `size` VARCHAR(32),
    `url` VARCHAR(512),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
