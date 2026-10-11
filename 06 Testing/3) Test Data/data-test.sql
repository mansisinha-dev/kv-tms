-- ============================================================================
-- KV-TMS AUTOMATED INTEGRATION TEST SEED FIXTURES (data-test.sql)
-- KISS Vocational Training Management System
-- Purpose: Pre-populates deterministic test data for JUnit / MockMvc test suites
-- Compatibility: PostgreSQL 16 & H2 Database (MODE=PostgreSQL)
-- ============================================================================

-- Clean up existing test tables in reverse foreign key order
DELETE FROM dbt_disbursements;
DELETE FROM sales_order_items;
DELETE FROM sales_orders;
DELETE FROM quality_inspections;
DELETE FROM production_batches;
DELETE FROM attendance_records;
DELETE FROM enrollments;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM raw_materials;
DELETE FROM courses;
DELETE FROM students;
DELETE FROM users;

-- 1. SEED TEST USERS (5 Roles)
INSERT INTO users (user_id, username, email, password_hash, role, is_active, created_at)
VALUES 
(1, 'admin_mansi', 'admin.testing@kiss.ac.in', '$2a$10$wT8m9Z1Ndummyhashforautomatedtestingonly', 'ROLE_ADMIN', true, CURRENT_TIMESTAMP),
(2, 'trainer_sanatan', 'trainer.textile@kiss.ac.in', '$2a$10$eK2j8P3Mdummyhashforautomatedtestingonly', 'ROLE_INSTRUCTOR', true, CURRENT_TIMESTAMP),
(3, 'pos_kalinga_01', 'pos.counter1@kiss.ac.in', '$2a$10$uY4t1R9Qdummyhashforautomatedtestingonly', 'ROLE_POS_OPERATOR', true, CURRENT_TIMESTAMP),
(4, 'qa_inspector_das', 'qa.inspector@kiss.ac.in', '$2a$10$oL7p3W5Sdummyhashforautomatedtestingonly', 'ROLE_QA_OFFICER', true, CURRENT_TIMESTAMP),
(5, 'student_birsa', 'birsa.munda@kiss.ac.in', '$2a$10$aB1c2D3Edummyhashforautomatedtestingonly', 'ROLE_STUDENT', true, CURRENT_TIMESTAMP);

-- 2. SEED COURSES / VOCATIONAL TRADES
INSERT INTO courses (course_id, course_name, department, duration_months, is_active)
VALUES 
(1, 'Tribal Handicrafts & Terracotta', 'Handicrafts', 6, true),
(2, 'Sambalpuri Ikat Textile Weaving', 'Textiles', 6, true),
(3, 'Teakwood Carving & Joinery', 'Woodworking', 6, true),
(4, 'Bell Metal & Dhokra Art', 'Metal Craft', 6, true);

-- 3. SEED STUDENTS (Boundary Conditions for Attendance)
INSERT INTO students (student_id, user_id, first_name, last_name, roll_no, aadhaar_hash, bank_account_token, is_at_risk)
VALUES 
(1, 5, 'Birsa', 'Munda', 'KISS-2026-001', 'hash_aadhaar_9011', 'tok_bank_axis_01', false), -- Qualified (75%)
(2, NULL, 'Sunita', 'Kisku', 'KISS-2026-002', 'hash_aadhaar_9022', 'tok_bank_sbi_02', true),   -- Boundary Fail (74.5%)
(3, NULL, 'Pravati', 'Majhi', 'KISS-2026-003', 'hash_aadhaar_9033', 'tok_bank_pnb_03', false); -- High (96%)

-- 4. SEED RAW MATERIALS (Warehouse 1)
INSERT INTO raw_materials (material_id, material_code, material_name, current_stock, unit_of_measure, unit_cost, reorder_level)
VALUES 
(1, 'RM-FAB-COTTON', 'Organic Cotton Yarn (Kg)', 250.00, 'KG', 180.00, 50.00),
(2, 'RM-DYE-NATURAL', 'Vegetable Indigo Dye Extract', 15.00, 'LITER', 320.00, 30.00),
(3, 'RM-MTL-BRASS', 'Recycled Brass Scrap Metal', 40.00, 'KG', 420.00, 100.00); -- Deficient for 100-batch

-- 5. SEED PRODUCTS & RETAIL INVENTORY (Warehouse 2)
INSERT INTO products (product_id, sku_code, barcode, product_name, category, unit_price, gst_rate)
VALUES 
(1, 'SKU-HND-DHOKRA-01', '8901234567890', 'Handcrafted Dhokra Brass Figurine', 'Tribal Handicrafts', 450.00, 12.00),
(2, 'SKU-APP-SAMBAL-02', '8901234567891', 'Sambalpuri Handloom Ikat Scarf', 'Apparel & Textile', 850.00, 5.00),
(3, 'SKU-WDW-STAND-03', '8901234567892', 'Carved Teakwood Desk Organizer', 'Woodworking & Carving', 350.00, 12.00);

-- INVENTORY: Product 1 has stock=1 (concurrency test), Product 2 has stock=25, Product 3 has stock=0 (out of stock)
INSERT INTO inventory (inventory_id, product_id, available_stock, reserved_stock, warehouse_location)
VALUES 
(1, 1, 1, 0, 'WH2-SHELF-A1'),  -- Stock = 1 for Concurrency Lock Race Condition Test (TC-POS-03)
(2, 2, 25, 0, 'WH2-SHELF-B4'), -- Stock = 25 for Normal POS Sale (TC-POS-01)
(3, 3, 0, 0, 'WH2-SHELF-C2');  -- Stock = 0 for Out-of-Stock Conflict Rejection (TC-POS-04)
