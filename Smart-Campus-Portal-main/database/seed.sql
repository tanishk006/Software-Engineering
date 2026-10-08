-- =====================================================================
-- Smart Campus Portal — Realistic Seed Data
-- Default Password for all seeded accounts: Password@123
-- Bcrypt Hash: $2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK
-- =====================================================================

USE `smart_campus`;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `event_registrations`;
TRUNCATE TABLE `complaint_history`;
TRUNCATE TABLE `complaints`;
TRUNCATE TABLE `marketplace`;
TRUNCATE TABLE `lost_items`;
TRUNCATE TABLE `found_items`;
TRUNCATE TABLE `events`;
TRUNCATE TABLE `campus_locations`;
TRUNCATE TABLE `emergency_contacts`;
TRUNCATE TABLE `faculty`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `staff`;
TRUNCATE TABLE `departments`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. DEPARTMENTS
-- ---------------------------------------------------------------------
INSERT INTO `departments` (`department_id`, `department_code`, `department_name`, `hod_name`, `contact_email`, `contact_phone`, `building_location`) VALUES
(1, 'CSE', 'Computer Science & Engineering', 'Dr. Arvind Swaminathan', 'cse.dept@campus.edu', '+91 80 2345 6101', 'Turing Innovation Block, 3rd Floor'),
(2, 'ECE', 'Electronics & Communication Engineering', 'Dr. Meenakshi Sundaram', 'ece.dept@campus.edu', '+91 80 2345 6102', 'Sir J.C. Bose Block, 2nd Floor'),
(3, 'MECH', 'Mechanical Engineering', 'Dr. Harish Chandra Rao', 'mech.dept@campus.edu', '+91 80 2345 6103', 'Babbage Engineering Complex, Ground Floor'),
(4, 'CIVIL', 'Civil Engineering', 'Dr. Rajeshwari Nair', 'civil.dept@campus.edu', '+91 80 2345 6104', 'Visvesvaraya Hall, 1st Floor'),
(5, 'IT', 'Information Technology', 'Dr. Pradeep Kulkarni', 'it.dept@campus.edu', '+91 80 2345 6105', 'Turing Innovation Block, 4th Floor');

-- ---------------------------------------------------------------------
-- 2. USERS
-- ---------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `avatar_url`, `is_active`) VALUES
-- Admin
(1, 'Prof. Vikramaditya Sen', 'admin@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98450 11223', 'Admin', NULL, 1),
-- Faculty
(2, 'Dr. Ananya Sharma', 'ananya.sharma@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98451 22334', 'Faculty', NULL, 1),
(3, 'Prof. K. R. Ramanathan', 'kr.ramanathan@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98452 33445', 'Faculty', NULL, 1),
(4, 'Dr. Sneha Kulkarni', 'sneha.kulkarni@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98453 44556', 'Faculty', NULL, 1),
(5, 'Dr. Tariq Mansoor', 'tariq.mansoor@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98454 55667', 'Faculty', NULL, 1),
-- Staff
(6, 'Ramesh Babu', 'ramesh.babu@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98455 66778', 'Staff', NULL, 1),
(7, 'Sunita Deshmukh', 'sunita.deshmukh@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 98456 77889', 'Staff', NULL, 1),
-- Students
(8, 'Rohan Sengupta', 'rohan.sengupta@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 97410 11001', 'Student', NULL, 1),
(9, 'Priya Nambiar', 'priya.nambiar@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 97410 22002', 'Student', NULL, 1),
(10, 'Aditya Vardhan', 'aditya.vardhan@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 97410 33003', 'Student', NULL, 1),
(11, 'Tanvi Agarwal', 'tanvi.agarwal@campus.edu', '$2b$10$qi4STMQUhDQJCSRyu59w3uy5bWsPc4anMJLfyAPSA10e4ettPhclK', '+91 97410 44004', 'Student', NULL, 1);

-- ---------------------------------------------------------------------
-- 3. STUDENTS
-- ---------------------------------------------------------------------
INSERT INTO `students` (`student_id`, `user_id`, `roll_number`, `department_id`, `semester`, `batch_year`) VALUES
(1, 8, '2023CSB1042', 1, 6, 2023),
(2, 9, '2023ECB1089', 2, 6, 2023),
(3, 10, '2024MEB1015', 3, 4, 2024),
(4, 11, '2024ITB1055', 5, 4, 2024);

-- ---------------------------------------------------------------------
-- 4. FACULTY
-- ---------------------------------------------------------------------
INSERT INTO `faculty` (`faculty_id`, `user_id`, `department_id`, `designation`, `cabin_number`, `office_hours`, `qualification`) VALUES
(1, 2, 1, 'Associate Professor', 'AB-3 412', 'Mon & Wed, 2:00 PM - 4:00 PM', 'Ph.D. in Distributed Systems, IIT Bombay'),
(2, 3, 2, 'Professor', 'Bose-204', 'Tue & Thu, 10:30 AM - 12:30 PM', 'M.Tech, Ph.D. in Signal Processing, IISc Bangalore'),
(3, 4, 3, 'Assistant Professor', 'Babbage-108', 'Wed & Fri, 3:00 PM - 5:00 PM', 'Ph.D. in Thermal Engineering, NIT Trichy'),
(4, 5, 5, 'Associate Professor', 'AB-3 305', 'Mon & Fri, 11:00 AM - 1:00 PM', 'Ph.D. in Cyber Security, IIIT Hyderabad');

-- ---------------------------------------------------------------------
-- 5. STAFF
-- ---------------------------------------------------------------------
INSERT INTO `staff` (`staff_id`, `user_id`, `department_id`, `role_title`, `cabin_or_room`) VALUES
(1, 6, NULL, 'Senior Facilities & Maintenance Coordinator', 'Estate Office Room 04'),
(2, 7, 1, 'Senior Network Systems Administrator', 'Server Room AB-3 101');

-- ---------------------------------------------------------------------
-- 6. EVENTS
-- ---------------------------------------------------------------------
INSERT INTO `events` (`event_id`, `title`, `description`, `category`, `event_date`, `event_time`, `venue`, `organizer_id`, `registration_link`, `max_seats`, `image_url`) VALUES
(1, 'National Tech Symposium: ApexInnovate 2026', 'Annual flagship technical symposium featuring competitive programming, project showcases, robotics challenges, and keynote addresses from leading industry researchers.', 'Technical', '2026-10-25', '09:30:00', 'Dr. A.P.J. Abdul Kalam Auditorium', 2, 'https://campus.edu/apexinnovate', 350, NULL),
(2, 'Hands-on Workshop: Edge AI and Embedded Systems', 'Intensive practical session covering quantization of neural networks and real-time deployment on microcontrollers and embedded Linux hardware.', 'Technical', '2026-11-02', '14:00:00', 'Embedded Systems Lab, Bose Block 302', 3, 'https://campus.edu/edge-ai-workshop', 60, NULL),
(3, 'Inter-College Robotics Challenge: RoboWars', 'Autonomous and radio-controlled battle bot arena tournament with obstacle navigation and combat categories.', 'Technical', '2026-11-15', '10:00:00', 'Central Indoor Sports Arena', 4, 'https://campus.edu/robowars-2026', 150, NULL),
(4, 'Campus Placement Orientation & Mock Technical Interviews', 'Comprehensive session by top hiring managers covering software engineering interview rounds, system design questions, and resume critique.', 'Placement', '2026-10-18', '11:00:00', 'Placement Cell Seminar Hall', 1, 'https://campus.edu/placement-prep', 200, NULL),
(5, 'Annual Voluntary Blood Donation & Health Screening Drive', 'Organized in partnership with the City Red Cross Society. Complete free health checkup, BMI analysis, and blood group typing for all participating students and staff.', 'Social', '2026-10-30', '09:00:00', 'Student Activity Center Lounge', 6, NULL, 500, NULL);

-- ---------------------------------------------------------------------
-- 7. EVENT REGISTRATIONS
-- ---------------------------------------------------------------------
INSERT INTO `event_registrations` (`registration_id`, `event_id`, `user_id`, `registered_at`) VALUES
(1, 1, 8, '2026-10-04 10:15:00'),
(2, 1, 9, '2026-10-04 11:30:00'),
(3, 2, 8, '2026-10-04 14:00:00'),
(4, 4, 10, '2026-10-04 16:45:00');

-- ---------------------------------------------------------------------
-- 8. LOST ITEMS
-- ---------------------------------------------------------------------
INSERT INTO `lost_items` (`lost_item_id`, `user_id`, `item_name`, `category`, `description`, `date_lost`, `lost_location`, `image_url`, `contact_phone`, `status`) VALUES
(1, 8, 'Casio fx-991CW ClassWiz Scientific Calculator', 'Electronics', 'Black casing with white key accents. Has a small handwritten initials RS on the back battery cover.', '2026-10-01', 'Central Library, 2nd Floor Reading Section', NULL, '+91 97410 11001', 'Reported'),
(2, 9, 'Brown Leather Cardholder Wallet', 'Accessories', 'Contains campus student identity card (Priya Nambiar) and hostel access card. Reward offered.', '2026-10-02', 'Cafeteria Food Court outdoor seating area', NULL, '+91 97410 22002', 'Reported'),
(3, 10, 'Blue Parker Vector Fountain Pen', 'Stationery', 'Brushed metal finish with dark blue grip section. Lost during workshop hours.', '2026-09-28', 'Mechanical Engineering Workshop B-04', NULL, '+91 97410 33003', 'Resolved');

-- ---------------------------------------------------------------------
-- 9. FOUND ITEMS
-- ---------------------------------------------------------------------
INSERT INTO `found_items` (`found_item_id`, `user_id`, `item_name`, `category`, `description`, `date_found`, `found_location`, `storage_location`, `image_url`, `status`, `claimed_by_name`) VALUES
(1, 6, 'Boat Airdopes 141 Wireless Earbuds', 'Electronics', 'Found inside black charging case. Left on bench in the third row.', '2026-10-03', 'LH-204 Lecture Hall, 2nd Floor', 'Security Control Room Gate 1', NULL, 'Available', NULL),
(2, 7, 'Set of 3 Keys with Red Swiss Army Keychain', 'Keys', 'Two brass door keys and one silver motorcycle key on a red Victorinox ring.', '2026-10-02', 'Basketball Court bleachers, Sports Complex', 'Sports Complex Reception Counter', NULL, 'Available', NULL),
(3, 6, 'Milton Thermosteel 750ml Flask', 'Personal Items', 'Matte navy blue insulated stainless steel bottle with silver cap.', '2026-09-29', 'Turing Block staircase landing between 2nd and 3rd floors', 'Estate Office Room 04', NULL, 'Available', NULL);

-- ---------------------------------------------------------------------
-- 10. MARKETPLACE
-- ---------------------------------------------------------------------
INSERT INTO `marketplace` (`product_id`, `seller_id`, `product_name`, `category`, `price`, `description`, `condition_type`, `image_url`, `contact_phone`, `status`) VALUES
(1, 8, 'Computer Networks: A Top-Down Approach (Kurose & Ross) - 8th Edition', 'Books & Notes', 450.00, 'Paperback in immaculate condition. No pen markings or highlighted pages. Essential textbook for 5th/6th sem Computer Science syllabus.', 'Like New', NULL, '+91 97410 11001', 'Available'),
(2, 10, 'Engineering Drawing Mini Drafter and Canvas Sheet Board', 'Engineering Equipment', 350.00, 'Omicron brand mini drafter with steel clamping mechanism. Includes drafting board and sheet pins. Used for one semester.', 'Good', NULL, '+91 97410 33003', 'Available'),
(3, 9, 'Hero Sprint 26T 21-Gear Hybrid Bicycle', 'Bicycles & Transport', 2800.00, 'Well maintained campus bicycle with front suspension, mudguards, bottle cage, and four-digit combination cable lock included.', 'Good', NULL, '+91 97410 22002', 'Available'),
(4, 11, 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard', 'Electronics', 1200.00, 'Dark grey keyboard with long battery life. Connects wirelessly with up to 3 devices (laptop, tablet, phone). Fresh AAA batteries included.', 'Like New', NULL, '+91 97410 44004', 'Available'),
(5, 8, 'Data Structures & Algorithms in C Complete Lab Manual & Handwritten Notes', 'Books & Notes', 150.00, 'Neatly bound spiral manual containing all solved laboratory assignments and complexity analysis notes.', 'Good', NULL, '+91 97410 11001', 'Sold');

-- ---------------------------------------------------------------------
-- 11. COMPLAINTS
-- ---------------------------------------------------------------------
INSERT INTO `complaints` (`complaint_id`, `student_id`, `complaint_type`, `title`, `description`, `location`, `attachment_url`, `status`, `assigned_to`, `admin_remarks`, `created_at`) VALUES
(1, 8, 'Electrical & Lighting', 'Ceiling fan bearing failure and loud grinding noise', 'The ceiling fan in study room 314 produces severe vibrations and a high-pitched grinding sound making it impossible to study or sleep safely.', 'Hostel Block B, Room 314', NULL, 'In Progress', 6, 'Electrician inspected and replacement capacitor and bearing ordered. Will be fitted today.', '2026-10-02 08:30:00'),
(2, 9, 'Hostel & Maintenance', 'Continuous water pipe leakage in restroom washbasin', 'The inlet valve beneath washbasin #2 has a split washer resulting in continuous puddle formation and slippery floor.', 'Visvesvaraya Hall 2nd Floor North Restroom', NULL, 'Open', 6, NULL, '2026-10-03 14:15:00'),
(3, 11, 'IT & Wi-Fi', 'Intermittent Wi-Fi packet drop and authentication failure', 'Wireless access point AP-TURING-3F keeps dropping active SSH sessions every 4 to 5 minutes during lab classes.', 'Turing Block Lab 304', NULL, 'Resolved', 7, 'Upgraded AP firmware, cleared DHCP lease collisions, and re-crimped RJ45 termination. Signal verified at 94 Mbps.', '2026-09-27 11:00:00');

-- ---------------------------------------------------------------------
-- 12. COMPLAINT HISTORY
-- ---------------------------------------------------------------------
INSERT INTO `complaint_history` (`history_id`, `complaint_id`, `changed_by`, `old_status`, `new_status`, `remarks`, `created_at`) VALUES
(1, 1, 1, 'Open', 'In Progress', 'Assigned ticket to Ramesh Babu (Estate & Facilities). Scheduled for on-site inspection.', '2026-10-02 10:00:00'),
(2, 1, 6, 'In Progress', 'In Progress', 'Inspected motor assembly. Capacitor ordered from maintenance store.', '2026-10-02 15:45:00'),
(3, 3, 1, 'Open', 'In Progress', 'Assigned ticket to Sunita Deshmukh (Network Admin).', '2026-09-27 13:00:00'),
(4, 3, 7, 'In Progress', 'Resolved', 'Updated firmware and verified speed stability over 30 minute stress test.', '2026-09-28 16:30:00');

-- ---------------------------------------------------------------------
-- 13. EMERGENCY CONTACTS
-- ---------------------------------------------------------------------
INSERT INTO `emergency_contacts` (`contact_id`, `department_name`, `contact_person`, `phone_number`, `email`, `category`, `is_24x7`) VALUES
(1, 'Campus Main Security Control Room', 'Capt. Surendra Mohan (Chief Security Officer)', '+91 80 2345 6701', 'security@campus.edu', 'Security', 1),
(2, 'Campus Health Clinic & 24/7 Ambulance Bay', 'Dr. Radhika Shenoy (Chief Medical Officer)', '+91 80 2345 6702', 'healthcenter@campus.edu', 'Medical', 1),
(3, 'Campus Fire & Emergency Response Station', 'Station Commander O. P. Yadav', '+91 80 2345 6703', 'fire.safety@campus.edu', 'Fire', 1),
(4, 'Internal Complaints Committee & Women Cell', 'Prof. Meenakshi Sundaram (Presiding Officer)', '+91 80 2345 6704', 'icc.cell@campus.edu', 'Helpline', 1),
(5, 'Anti-Ragging Squad & Student Welfare Cell', 'Prof. Harish Chandra Rao (Convener)', '+91 80 2345 6705', 'antiragging@campus.edu', 'Helpline', 1),
(6, 'Estate Electrical & Water Breakdown Helpline', 'Superintendent Ramesh Babu', '+91 80 2345 6706', 'maintenance@campus.edu', 'Other', 1);

-- ---------------------------------------------------------------------
-- 14. CAMPUS LOCATIONS
-- ---------------------------------------------------------------------
INSERT INTO `campus_locations` (`location_id`, `name`, `category`, `latitude`, `longitude`, `description`, `building_code`, `opening_hours`) VALUES
(1, 'Turing Innovation Block', 'Academic', 12.97195000, 77.59462000, 'Houses Computer Science, Information Technology, AI Research Labs, and Server Infrastructure.', 'AB-3', '08:00 AM - 08:00 PM'),
(2, 'Sir J.C. Bose Block', 'Academic', 12.97230000, 77.59510000, 'Electronics, Signal Processing, Embedded Systems, and Cleanroom Semiconductor Labs.', 'AB-2', '08:00 AM - 07:00 PM'),
(3, 'Central Library & Knowledge Hub', 'Facility', 12.97140000, 77.59410000, 'Three levels of book collections, research journals, multimedia room, and 24/7 exam study halls.', 'LIB-1', '08:00 AM - 11:00 PM'),
(4, 'Administrative Bhavan', 'Administrative', 12.97080000, 77.59380000, 'Vice Chancellor Secretariat, Registrar, Admissions, Student Verification, and Finance.', 'ADM-1', '09:30 AM - 05:30 PM'),
(5, 'Central Dining Hall & Food Court', 'Cafeteria', 12.97120000, 77.59580000, 'Multi-cuisine student canteen, coffee kiosk, and open garden seating.', 'CAN-1', '07:30 AM - 10:30 PM'),
(6, 'Boys Hostel Complex (Blocks A & B)', 'Hostel', 12.97310000, 77.59320000, 'Undergraduate student residence with Wi-Fi, recreation hall, and study rooms.', 'HB-AB', '24 Hours'),
(7, 'Girls Hostel Complex (Blocks C & D)', 'Hostel', 12.97340000, 77.59620000, 'Undergraduate and postgraduate student residences with dedicated security post.', 'HG-CD', '24 Hours'),
(8, 'Campus Health Clinic & Pharmacy', 'Facility', 12.97050000, 77.59490000, 'Equipped with 6 observation beds, doctor on duty, generic pharmacy, and ambulance bay.', 'MED-1', '24 Hours'),
(9, 'Indoor Sports Arena & Gymnasium', 'Sports', 12.97270000, 77.59690000, 'Four wooden badminton courts, squash court, table tennis, and modern strength training equipment.', 'SPT-1', '06:00 AM - 09:00 PM'),
(10, 'Campus Main Security Post (Gate 1)', 'Facility', 12.97010000, 77.59320000, 'Main vehicle gate, visitor clearance desk, and Central Lost & Found collection center.', 'SEC-1', '24 Hours');
