# 10. RELATIONAL DATABASE SCHEMA & TABLE DICTIONARY
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Schema Normalization & Engine Specifications
* **Engine:** MySQL 8.0 InnoDB storage engine providing ACID transactions and row-level locking.
* **Normalization:** Enforces strict **Third Normal Form (3NF)** with zero transitive or repeating group dependencies.
* **Primary Keys:** Surrogate 64-bit integer keys (`BIGINT AUTO_INCREMENT`) across all tables.

### 2. Core Relational Tables Dictionary
1. `users` (id, username, password_hash, email, role, created_at, enabled)
2. `trainees` (id, user_id, roll_number, trade, bank_account, ifsc, stipend_eligible)
3. `trainers` (id, user_id, employee_code, specialization, assigned_trade)
4. `courses` (id, course_code, course_name, trade_category, duration_weeks)
5. `trainings` (id, course_id, trainer_id, batch_name, start_date, end_date)
6. `attendances` (id, trainee_id, training_id, attendance_date, status, recorded_at)
7. `inventory` (id, item_code, item_name, category, warehouse_type, quantity, unit_price)
8. `production_orders` (id, order_number, product_id, quantity, status, qa_passed_qty)
9. `sales_orders` (id, invoice_number, total_amount, payment_mode, cashier_id, order_date)

### 3. Referential Actions & Indexing Rationale
* Foreign keys configured with `ON DELETE RESTRICT` on master records to prevent accidental deletion.
* B-Tree composite indexes on `attendances(trainee_id, attendance_date)` and `inventory(warehouse_type, item_code)` to accelerate P95 queries.