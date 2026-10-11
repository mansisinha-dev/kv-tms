-- =============================================================================
-- KISS Vocational Training Management System (KV-TMS)
-- Production Seed & Reference Data (seed_data.sql)
-- Candidate: Mansi Sinha (Roll No: 2205160)
-- Institution: School of Computer Science & Engineering, KIIT & KISS
-- =============================================================================

-- 1. SEED USERS & AUTHENTICATION (Master Rule: Password is strictly [College_ID]@123)
INSERT INTO users (name, username, password, role, contact_info, account_status) VALUES
('Dr. Debashis Mohanty', 'KISS-ADM-001', '$2a$10$wT8m9Z1Ndummyhashforautomatedtestingonly', 'ROLE_ADMIN', 'admin@kiss.ac.in', 'ACTIVE'),
('Prof. Sanatan Marndi', 'KISS-FAC-001', '$2a$10$eK2j8P3Mdummyhashforautomatedtestingonly', 'ROLE_TRAINER', 'trainer@kiss.ac.in', 'ACTIVE'),
('Kavita Priyadarshini Das', 'KISS-PRD-001', '$2a$10$uY4t1R9Qdummyhashforautomatedtestingonly', 'ROLE_PRODUCTION_MANAGER', 'production@kiss.ac.in', 'ACTIVE'),
('Laxman Majhi', 'KISS-TRN-2026-001', '$2a$10$aB1c2D3Edummyhashforautomatedtestingonly', 'ROLE_TRAINEE', 'laxman.majhi@kiss.ac.in', 'ACTIVE'),
('Birsa Munda', 'KISS-TRN-2026-002', '$2a$10$aB1c2D3Edummyhashforautomatedtestingonly', 'ROLE_TRAINEE', 'birsa.munda@kiss.ac.in', 'ACTIVE'),
('Sunita Kisku', 'KISS-TRN-2026-003', '$2a$10$aB1c2D3Edummyhashforautomatedtestingonly', 'ROLE_TRAINEE', 'sunita.kisku@kiss.ac.in', 'ACTIVE');

-- 2. SEED VOCATIONAL COURSE TRADES
INSERT INTO course_trades (trade_name, description, duration, status) VALUES
('Traditional Handloom Weaving', 'Traditional Sambalpuri and Kotpad ethnic fabric loom weaving', '6 Months', 'ACTIVE'),
('Bamboo & Teakwood Craft', 'Artisanal tribal wood joinery, bamboo carving, and furniture fabrication', '6 Months', 'ACTIVE'),
('Bell Metal & Dhokra Art', 'Lost-wax bell metal casting of indigenous figurines and jewellery', '6 Months', 'ACTIVE'),
('Terracotta & Pottery Art', 'Traditional clay sculpting, kiln firing, and decorative urn fabrication', '3 Months', 'ACTIVE'),
('Tailoring & Ethnic Apparel', 'Pattern drafting, garment cutting, and traditional tribal costume stitching', '6 Months', 'ACTIVE');

-- 3. SEED TRAINERS / MASTER CRAFTSMEN
INSERT INTO trainers (user_id, name, specialization, trade_id, status) VALUES
(2, 'Rajesh Kumar Sahu', 'Sambalpuri Ikat Weaving Master', 1, 'ACTIVE'),
(3, 'Sanatan Marndi', 'Tribal Bell Metal & Dhokra Artisan', 3, 'ACTIVE');

-- 4. SEED INDIGENOUS STUDENT TRAINEES
INSERT INTO trainees (user_id, name, trade_id, aadhaar_no, bank_account, status) VALUES
(5, 'Laxman Majhi', 1, 'XXXX-XXXX-4512', 'SBI-0034891278', 'ENROLLED'),
(6, 'Birsa Munda', 3, 'XXXX-XXXX-9011', 'AXIS-9182371923', 'ENROLLED'),
(7, 'Sunita Kisku', 1, 'XXXX-XXXX-9022', 'PNB-7728192381', 'ENROLLED');

-- 5. SEED PRACTICAL TRAINING SESSIONS
INSERT INTO trainings (trade_id, trainer_id, topic, training_date, practical_theory) VALUES
(1, 1, 'Loom Setup & Warp Threading', '2026-09-01', 'PRACTICAL'),
(1, 1, 'Sambalpuri Ikat Motif Tie & Dye', '2026-09-02', 'PRACTICAL'),
(1, 1, 'Border Weaving Finishing Techniques', '2026-09-03', 'PRACTICAL'),
(3, 2, 'Lost-Wax Clay Core Sculpting', '2026-09-01', 'PRACTICAL'),
(3, 2, 'Brass Scrap Melting & Pouring', '2026-09-02', 'PRACTICAL');

-- 6. SEED ATTENDANCE RECORDS (Demonstrating 75% Threshold Calculations)
INSERT INTO attendance (trainee_id, training_id, attendance_date, status) VALUES
(1, 1, '2026-09-01', 'PRESENT'),
(1, 2, '2026-09-02', 'PRESENT'),
(1, 3, '2026-09-03', 'PRESENT'),
(2, 4, '2026-09-01', 'PRESENT'),
(2, 5, '2026-09-02', 'PRESENT'),
(3, 1, '2026-09-01', 'PRESENT'),
(3, 2, '2026-09-02', 'ABSENT');

-- 7. SEED FINISHED CRAFT PRODUCT CATALOG
INSERT INTO products (product_name, category, trade_id, unit_price, stipend_rate, status) VALUES
('Sambalpuri Handloom Silk Scarf', 'Apparel & Textile', 1, 850.00, 120.00, 'ACTIVE'),
('Handcrafted Dhokra Brass Figurine', 'Tribal Handicrafts', 3, 450.00, 80.00, 'ACTIVE'),
('Carved Teakwood Desk Organizer', 'Woodworking & Carving', 2, 350.00, 60.00, 'ACTIVE'),
('Terracotta Decorative Table Urn', 'Pottery & Ceramics', 4, 250.00, 45.00, 'ACTIVE'),
('Kotpad Natural Dyed Cotton Stole', 'Apparel & Textile', 1, 650.00, 95.00, 'ACTIVE');

-- 8. SEED WORKSHOP PRODUCTION BATCHES
INSERT INTO productions (product_id, prod_date, target_quantity, passed_quantity, rejected_quantity, status) VALUES
(1, '2026-09-10', 50, 48, 2, 'COMPLETED'),
(2, '2026-09-12', 40, 39, 1, 'COMPLETED'),
(3, '2026-09-15', 30, 0, 0, 'IN_PROGRESS');

-- 9. SEED TWO-TIER INVENTORY (WH1 Raw Materials & WH2 Finished Retail Stock)
INSERT INTO inventory (item_id, item_type, quantity, unit, stock_status) VALUES
(1, 'RAW_MATERIAL', 250.00, 'KG', 'IN_STOCK'),
(2, 'RAW_MATERIAL', 15.00, 'LITER', 'LOW_STOCK'),
(3, 'RAW_MATERIAL', 120.00, 'KG', 'IN_STOCK'),
(1, 'FINISHED_PRODUCT', 48.00, 'UNITS', 'IN_STOCK'),
(2, 'FINISHED_PRODUCT', 39.00, 'UNITS', 'IN_STOCK'),
(3, 'FINISHED_PRODUCT', 5.00, 'UNITS', 'LOW_STOCK');

-- 10. SEED POINT OF SALE (POS) RETAIL ORDERS
INSERT INTO sales_orders (invoice_no, product_id, quantity_sold, sales_amount, payment_mode) VALUES
('INV-2026-0001', 1, 2, 1700.00, 'UPI_QR'),
('INV-2026-0002', 2, 1, 450.00, 'CASH'),
('INV-2026-0003', 1, 1, 850.00, 'CARD');

-- 11. SEED APPLIED AI DEMAND FORECASTS (OLS Regression Projections)
INSERT INTO forecasts (product_id, forecast_date, predicted_demand, recommended_qty, model_info) VALUES
(1, '2026-10-01', 65, 70, 'Ordinary Least Squares (OLS)'),
(2, '2026-10-01', 50, 55, 'Ordinary Least Squares (OLS)'),
(3, '2026-10-01', 40, 45, 'Ordinary Least Squares (OLS)');
