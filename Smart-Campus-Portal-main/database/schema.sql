-- =====================================================================
-- Smart Campus Portal — Database Schema
-- RDBMS: MySQL 8.0+ / MariaDB 10.4+
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `smart_campus`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `smart_campus`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `event_registrations`;
DROP TABLE IF EXISTS `complaint_history`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `marketplace`;
DROP TABLE IF EXISTS `lost_items`;
DROP TABLE IF EXISTS `found_items`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `campus_locations`;
DROP TABLE IF EXISTS `emergency_contacts`;
DROP TABLE IF EXISTS `faculty`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ---------------------------------------------------------------------
CREATE TABLE `departments` (
  `department_id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_code` VARCHAR(20) NOT NULL UNIQUE,
  `department_name` VARCHAR(150) NOT NULL,
  `hod_name` VARCHAR(150) NOT NULL,
  `contact_email` VARCHAR(150) NULL,
  `contact_phone` VARCHAR(25) NULL,
  `building_location` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dept_code` (`department_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. USERS
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `phone` VARCHAR(25) NULL,
  `role` ENUM('Admin', 'Faculty', 'Student', 'Staff') NOT NULL DEFAULT 'Student',
  `avatar_url` VARCHAR(255) NULL,
  `google_id` VARCHAR(100) UNIQUE NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. STUDENTS
-- ---------------------------------------------------------------------
CREATE TABLE `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `roll_number` VARCHAR(50) NOT NULL UNIQUE,
  `department_id` INT NULL,
  `semester` INT NOT NULL DEFAULT 1,
  `batch_year` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  INDEX `idx_student_roll` (`roll_number`),
  INDEX `idx_student_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. FACULTY
-- ---------------------------------------------------------------------
CREATE TABLE `faculty` (
  `faculty_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `department_id` INT NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `cabin_number` VARCHAR(50) NOT NULL,
  `office_hours` VARCHAR(150) NULL,
  `qualification` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_faculty_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`department_id`) ON DELETE RESTRICT,
  INDEX `idx_faculty_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. STAFF
-- ---------------------------------------------------------------------
CREATE TABLE `staff` (
  `staff_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `department_id` INT NULL,
  `role_title` VARCHAR(100) NOT NULL,
  `cabin_or_room` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_staff_department` FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. EVENTS
-- ---------------------------------------------------------------------
CREATE TABLE `events` (
  `event_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `event_date` DATE NOT NULL,
  `event_time` TIME NOT NULL,
  `venue` VARCHAR(150) NOT NULL,
  `organizer_id` INT NOT NULL,
  `registration_link` VARCHAR(255) NULL,
  `max_seats` INT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_event_organizer` FOREIGN KEY (`organizer_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_events_date` (`event_date`),
  INDEX `idx_events_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. EVENT REGISTRATIONS
-- ---------------------------------------------------------------------
CREATE TABLE `event_registrations` (
  `registration_id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`)
    REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_event_user` (`event_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. LOST ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE `lost_items` (
  `lost_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `date_lost` DATE NOT NULL,
  `lost_location` VARCHAR(150) NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `contact_phone` VARCHAR(25) NULL,
  `status` ENUM('Reported', 'Resolved') NOT NULL DEFAULT 'Reported',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_lost_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_lost_status` (`status`),
  INDEX `idx_lost_category` (`category`),
  INDEX `idx_lost_date` (`date_lost`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. FOUND ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE `found_items` (
  `found_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `date_found` DATE NOT NULL,
  `found_location` VARCHAR(150) NOT NULL,
  `storage_location` VARCHAR(150) NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `status` ENUM('Available', 'Claimed', 'Resolved') NOT NULL DEFAULT 'Available',
  `claimed_by_name` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_found_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_found_status` (`status`),
  INDEX `idx_found_category` (`category`),
  INDEX `idx_found_date` (`date_found`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. MARKETPLACE
-- ---------------------------------------------------------------------
CREATE TABLE `marketplace` (
  `product_id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NOT NULL,
  `condition_type` ENUM('Like New', 'Good', 'Fair', 'Refurbished') NOT NULL DEFAULT 'Good',
  `image_url` VARCHAR(255) NULL,
  `contact_phone` VARCHAR(25) NULL,
  `status` ENUM('Available', 'Sold') NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_market_seller` FOREIGN KEY (`seller_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_market_status` (`status`),
  INDEX `idx_market_category` (`category`),
  INDEX `idx_market_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. COMPLAINTS
-- ---------------------------------------------------------------------
CREATE TABLE `complaints` (
  `complaint_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `complaint_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `attachment_url` VARCHAR(255) NULL,
  `status` ENUM('Open', 'In Progress', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Open',
  `assigned_to` INT NULL,
  `admin_remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_complaint_student` FOREIGN KEY (`student_id`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaint_assigned` FOREIGN KEY (`assigned_to`)
    REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  INDEX `idx_complaints_status` (`status`),
  INDEX `idx_complaints_type` (`complaint_type`),
  INDEX `idx_complaints_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. COMPLAINT HISTORY (Audit trail & Remarks)
-- ---------------------------------------------------------------------
CREATE TABLE `complaint_history` (
  `history_id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` INT NOT NULL,
  `changed_by` INT NOT NULL,
  `old_status` ENUM('Open', 'In Progress', 'Resolved', 'Rejected') NULL,
  `new_status` ENUM('Open', 'In Progress', 'Resolved', 'Rejected') NOT NULL,
  `remarks` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_history_complaint` FOREIGN KEY (`complaint_id`)
    REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by`)
    REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX `idx_history_complaint` (`complaint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. EMERGENCY CONTACTS
-- ---------------------------------------------------------------------
CREATE TABLE `emergency_contacts` (
  `contact_id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `phone_number` VARCHAR(25) NOT NULL,
  `email` VARCHAR(150) NULL,
  `category` ENUM('Security', 'Medical', 'Fire', 'Helpline', 'Other') NOT NULL DEFAULT 'Security',
  `is_24x7` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_emergency_cat` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. CAMPUS LOCATIONS (Map Pins)
-- ---------------------------------------------------------------------
CREATE TABLE `campus_locations` (
  `location_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Academic', 'Hostel', 'Administrative', 'Facility', 'Cafeteria', 'Sports', 'Other') NOT NULL DEFAULT 'Academic',
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `description` TEXT NULL,
  `building_code` VARCHAR(50) NULL,
  `opening_hours` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_locations_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
