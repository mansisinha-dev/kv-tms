# 03. REQUIREMENTS ENGINEERING SPECIFICATION (FR & NFR)
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Master Functional Requirements (FR-01 to FR-12)
* **FR-01 (Authentication):** Role-based login issuing stateless JWT tokens with BCrypt encrypted passwords.
* **FR-02 (User Governance):** Provisioning of accounts across Admin, Trainer, Trainee, and Production Staff roles.
* **FR-03 (Trainee Registry):** Student profile management including tribal demographics, trade allocations, and bank accounts.
* **FR-04 (Attendance Ingestion):** Daily batch attendance logging with biometric/RFID card timestamp ingestion.
* **FR-05 (75% Statutory Rule):** Deterministic evaluation of trainee attendance rates using BigDecimal arithmetic.
* **FR-06 (Work Order Creation):** Production batch initiation specifying craft item, batch size, and scheduled delivery.
* **FR-07 (Atomic BOM Deduction):** Automated decrement of raw materials from Warehouse 1 upon order release.
* **FR-08 (Quality Control Gate):** Inspection audit routing approved items to Warehouse 2 and rejected units to scrap.
* **FR-09 (Retail POS Checkout):** Barcode item scanning, cart summation, Cash/UPI split payments, and GST tax invoicing.
* **FR-10 (Concurrency Safety):** Database row-level pessimistic locking preventing inventory overselling under load.
* **FR-11 (AI Demand Forecasting):** 30-day linear regression trend calculation and Reorder Point (ROP) triggering.
* **FR-12 (Direct Benefit Transfer):** Monthly aggregation of student EWYL stipends and banking NACH export generation.

### 2. Non-Functional Requirements (NFR)
* **Performance Budget:** P95 API response time < 500 ms under 50 concurrent virtual users (achieved: 95 ms).
* **Transactional Integrity:** ACID guarantees across BOM deductions and financial ledgers via declarative `@Transactional`.
* **Security Standards:** BCrypt hashing (strength 12), TLS 1.3 encryption, CORS filtering, and JWT token expiry.
* **Availability & Reliability:** HikariCP connection pooling, automated database dumps, zero unhandled 500 crashes.