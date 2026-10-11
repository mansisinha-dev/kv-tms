# HANDWRITTEN PROJECT WORK DIARY & SYSTEM DESIGN RECORD
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha (Roll Number: 2205160)  
**Degree Award:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  
**Academic Year:** 2025-2026 | **Classification:** Master Handwritten Reference & Design Log  

---

## TABLE OF CONTENTS & TOPIC OUTLINE

1. [01. Project Introduction & Institutional Context](#01-project-introduction--institutional-context)
2. [02. Software Development Lifecycle (SDLC) Model](#02-software-development-lifecycle-sdlc-model)
3. [03. Requirements Engineering Specification (FR & NFR)](#03-requirements-engineering-specification-fr--nfr)
4. [04. High-Level System Architecture & 3-Tier Topology](#04-high-level-system-architecture--3-tier-topology)
5. [05. User Roles & Responsibilities (RBAC Matrix)](#05-user-roles--responsibilities-rbac-matrix)
6. [06. Subsystem Decomposition & Module Design](#06-subsystem-decomposition--module-design)
7. [07. Unified Modeling Language (UML) Models](#07-unified-modeling-language-uml-models)
8. [08. Data Flow Architecture (DFD Level 0 & Level 1)](#08-data-flow-architecture-dfd-level-0--level-1)
9. [09. Entity-Relationship (ER) Data Modeling](#09-entity-relationship-er-data-modeling)
10. [10. Relational Database Schema & Table Dictionary](#10-relational-database-schema--table-dictionary)
11. [11. Mathematical Formulations & Core Algorithms](#11-mathematical-formulations--core-algorithms)
12. [12. Software Testing Strategy & Defect Log](#12-software-testing-strategy--defect-log)
13. [13. Developer Diary, Meeting Minutes & Viva Notes](#13-developer-diary-meeting-minutes--viva-notes)

---


# 01. PROJECT INTRODUCTION & INSTITUTIONAL CONTEXT
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Degree:** B.Tech Computer Science & Engineering | **Academic Year:** 2025-2026  
**Institution:** School of Computer Science & Engineering, KIIT University in collaboration with KISS Bhubaneswar  

---

### 1. Institutional Background: Kalinga Institute of Social Sciences (KISS)
* **Scale & Mission:** World's largest fully free residential institution for indigenous tribal children, home to over 30,000 students from 62 tribes (including 13 Particularly Vulnerable Tribal Groups / PVTGs).
* **Pedagogical Model:** Integrates formal schooling from KG to PG with vocational craftsmanship (Tailoring, Carpentry, Handicrafts, Handloom, Food Processing) to achieve economic self-reliance.
* **Earn While You Learn (EWYL):** Student artisans receive monetary stipends credited to bank accounts based on workshop fabrication outputs and academic attendance.

### 2. Manual System Bottlenecks Prior to KV-TMS
1. **Attendance & Stipend Lag:** Manual paper logbooks caused frequent miscalculations in verifying the statutory 75% attendance rule, causing stipend delays of 45–60 days.
2. **Raw Material Wastage:** Instructors lacked automated Bill of Materials (BOM) tracking, resulting in unaccounted fabric and wood scrap.
3. **Showroom Inventory Disconnect:** Retail exhibition sales recorded in paper bill-books caused inventory reconciliation delays of 3–5 business days and stockouts.
4. **Guesswork Scheduling:** Workshop batches were scheduled without empirical demand data.

### 3. Five Core Project Objectives
1. **Multi-Role Governance:** Deploy an automated platform for Administrators, Trainers, Trainees, and Production/POS Staff.
2. **Deterministic Attendance & DBT:** Enforce the 75% attendance rule and automate Direct Benefit Transfer (DBT) stipend exports.
3. **Atomic BOM Allocation:** Automate raw material deductions from Warehouse 1 upon work order creation.
4. **Thread-Safe POS Retail:** Deliver a concurrent barcode checkout terminal with multi-tier GST tax invoices.
5. **Applied AI Forecasting:** Embed statistical Ordinary Least Squares (OLS) regression to project 30-day craft demand.

---

# 02. SOFTWARE DEVELOPMENT LIFECYCLE (SDLC) MODEL
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Methodology Selection: Agile / V-Model Hybrid
To balance the iterative refinement of user interfaces with the strict regulatory compliance required for banking disbursements and academic certification, KV-TMS adopted a **Hybrid Agile / V-Model SDLC framework**.

* **Why Not Pure Waterfall?** Waterfall assumes fixed upfront requirements. However, workshop workflows (fabrication scrap rates, craft inspection criteria) required iterative discovery alongside vocational trainers.
* **Why Not Unstructured Agile?** Pure Agile lacks formal verification documentation. University capstone evaluation and institutional banking compliance demand rigorous IEEE 829 test plans and traceability matrices.

### 2. V-Model Verification & Validation Correspondence
* **Requirements Phase (SRS):** Corresponds directly to **System & Acceptance Testing** (37 Test Cases).
* **High-Level Design (HLD):** Corresponds directly to **Integration Testing** (REST APIs, Security Filters).
* **Low-Level Design (LLD):** Corresponds directly to **Component & Concurrency Testing** (Pessimistic DB Locks).
* **Source Code Implementation:** Corresponds directly to **Unit Testing** (JUnit 5, Mockito, 88.41% JaCoCo).

### 3. Iterative Sprint Roadmap (7 Sprints)
* **Sprint 1:** Domain research at KISS workshops, stakeholder requirements engineering.
* **Sprint 2:** Core backend infrastructure, Spring Boot 3.2.0, Spring Security 6, JWT, MySQL 8.0 schema.
* **Sprint 3:** Academic registry, batch management, attendance capture, 75% rule engine.
* **Sprint 4:** Workshop work orders, atomic BOM raw stock deduction, dual-warehouse inventory.
* **Sprint 5:** Retail POS terminal, concurrent checkout locking, GST tax invoicing.
* **Sprint 6:** AI forecasting module (OLS regression), monthly DBT stipend export.
* **Sprint 7:** Quality assurance, JMeter concurrency benchmarks, defect resolution, capstone documentation.

---

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

---

# 04. HIGH-LEVEL SYSTEM ARCHITECTURE & 3-TIER TOPOLOGY
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Architectural Philosophy: Decoupled 3-Tier Multi-Layered Style
The architecture enforces strict separation of concerns, high modular cohesion, and stateless horizontal scalability.

### 2. Multi-Tier Decomposition
* **Tier 1 - Presentation Layer (Client SPA):**
  - Framework: React 18 Single Page Application bundled with Vite 5.
  - UI Library: Tailwind CSS with Lucide React iconography adhering to KISS Indigo (`#2D3591`) and Ochre (`#B45309`).
  - State & Routing: React Context API (`AuthContext`, `CartContext`) and React Router DOM.
  - Network Client: Axios with global JWT request interceptors and 401 session expiration handlers.
* **Tier 2 - Application / Business Logic Layer:**
  - Runtime: Java 17 LTS on Spring Boot 3.2.0 framework.
  - Security Pipeline: Spring Security 6 stateless filter chain with JWT validation.
  - Service Layer: 8 core domain services with declarative ACID transaction boundaries (`@Transactional`).
  - Predictive Engine: Embedded statistical Ordinary Least Squares (OLS) regression library.
* **Tier 3 - Persistence Layer:**
  - Database: MySQL 8.0 Enterprise Relational Database Server with InnoDB ACID engine.
  - ORM Mapping: Spring Data JPA and Hibernate ORM.
  - Connection Pool: HikariCP connection pool with max pool size = 10.

---

# 05. USER ROLES & RESPONSIBILITIES (RBAC MATRIX)
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Stakeholder Personas & Authorization Matrix
KV-TMS establishes four distinct user roles, each isolated by Spring Security `@PreAuthorize` annotations.

| Role Identifier | Security Authority | Primary Responsibilities & Functional Scope | Allowed UI Views |
| :--- | :--- | :--- | :--- |
| **Administrator** | `ROLE_ADMIN` | System administration, trade masters, user account provisioning, executive revenue analytics, DBT banking approvals. | `/admin`, `/analytics`, `/dbt` |
| **Trainer / Faculty** | `ROLE_TRAINER` | Daily batch attendance recording, practical skill grading, trade syllabus tracking, at-risk trainee alerts. | `/trainer`, `/attendance`, `/courses` |
| **Trainee / Student** | `ROLE_TRAINEE` | Self-service attendance percentage viewing, EWYL stipend status checking, course curriculum queries, certificates. | `/student`, `/stipend`, `/profile` |
| **Production Staff** | `ROLE_PROD` | Workshop work orders, BOM raw stock allocations, QA inspection pass/scrap logs, retail POS billing, AI forecasts. | `/production`, `/inventory`, `/pos` |

### 2. Privilege Escalation Prevention
* Method-level security guards REST API endpoints against unauthorized calls.
* Trainee tokens attempting administrative routes (`/api/v1/users`) receive instant **HTTP 403 Forbidden** responses with security audit logging.

---

# 06. SUBSYSTEM DECOMPOSITION & MODULE DESIGN
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Core Functional Subsystems Breakdown
The platform encapsulates eight specialized modular subsystems:
1. **Identity & Governance Subsystem (`auth`):** Manages user credentials, BCrypt salt-hashing, and JWT token issuance/validation.
2. **Academic Curriculum Subsystem (`academic`):** Governs course master data, trade tracks (Tailoring, Carpentry, Craft), and trainee batch schedules.
3. **Attendance & EWYL Subsystem (`attendance`):** Logs daily student presence, enforces the 75% attendance threshold, and tracks cumulative hours.
4. **Workshop Manufacturing Subsystem (`production`):** Creates production work orders, allocates artisan teams, and logs fabrication milestones.
5. **Two-Tier Inventory Subsystem (`inventory`):** Isolates raw materials in Warehouse 1 (WH1) from retail finished goods in Warehouse 2 (WH2).
6. **Point-of-Sale (POS) Retail Subsystem (`pos`):** Handles barcode lookup, cart aggregation, cash/UPI reconciliation, and GST tax invoice generation.
7. **Predictive AI Forecasting Subsystem (`forecasting`):** Computes Ordinary Least Squares (OLS) regression over sales trends to advise reorder points.
8. **Direct Benefit Transfer Subsystem (`dbt`):** Aggregates student bank details and exports formatted NEFT/NACH payment files.

---

# 07. UNIFIED MODELING LANGUAGE (UML) MODELS
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. UML Behavioral Modeling (Use Case Model)
* **Actors:** Administrator, Trainer, Trainee, Production Manager, POS Cashier.
* **12 Primary Use Cases:** Authenticate User, Manage Trades, Mark Attendance, Check 75% Rule, Schedule Work Order, Deduct BOM (`<<include>>`), Perform QA Audit, Transfer Finished Goods (`<<include>>`), Retail Checkout, Predict Demand, Export DBT.

### 2. Static Object-Oriented Domain Architecture (Class Model)
* **Domain Classes:** `User`, `Trainee`, `Trainer`, `Course`, `Training`, `Attendance`, `InventoryItem`, `ProductionOrder`, `SalesOrder`, `DemandForecast`.
* **Design Patterns Applied:**
  - **Repository Pattern:** Spring Data JPA abstractions isolating SQL persistence.
  - **Service Layer Pattern:** Encapsulates business logic and transaction boundaries.
  - **DTO Pattern:** Decouples internal database entities from external REST JSON payloads.

### 3. Dynamic Workflow Sequences
* **Authentication Handshake:** Credential verification $\to$ BCrypt match $\to$ JWT token issued.
* **Atomic BOM Deduction:** Manager creates batch $\to$ `SELECT ... FOR UPDATE` locks raw inventory $\to$ stock decremented $\to$ order released.
* **POS Retail Checkout:** Barcode scan $\to$ stock verification $\to$ payment settlement $\to$ WH2 stock decremented $\to$ invoice printed.
* **AI Demand & DBT:** Scheduled regression calculates 30-day demand curves; monthly DBT engine aggregates student bank credits.

---

# 08. DATA FLOW ARCHITECTURE (DFD LEVEL 0 & LEVEL 1)
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. DFD Level 0: Global Context Diagram
Abstracts the entire platform as a single process (`0.0`) interacting with 4 external human entities:
* **Administrator:** Sends user masters and policies; receives executive reports and DBT audits.
* **Trainer / Faculty:** Submits batch attendance rosters and marks; receives grade sheets and alerts.
* **Trainee / Student:** Submits enrollments and profile queries; receives attendance % and EWYL slips.
* **Production / POS Staff:** Submits work order logs and retail sales items; receives material issue slips and tax bills.

### 2. DFD Level 1: Subsystem Functional Decomposition
Decomposes process `0.0` into 14 distinct business processes interacting with 9 relational data stores:
* **Processes 1.0–3.0:** Authentication, Trainee Enrollment, and Batch Attendance Ingestion.
* **Processes 4.0–5.0:** Attendance 75% Rule Evaluation and Curriculum Scheduling.
* **Processes 6.0–8.0:** Raw Material Inward, Work Order Creation, and Atomic BOM Deduction.
* **Processes 9.0–10.0:** Quality Assurance Inspection and Finished Stock Transfer to WH2.
* **Processes 11.0–12.0:** POS Retail Barcode Checkout and Cash/UPI Ledger Reconciliation.
* **Processes 13.0–14.0:** OLS Demand Forecasting and Monthly DBT Banking File Export.
* **Data Stores:** D1 (`users`), D2 (`trainees`), D3 (`attendances`), D4 (`courses`), D5 (`inventory_wh1`), D6 (`inventory_wh2`), D7 (`production_orders`), D8 (`sales_orders`), D9 (`stipends`).

---

# 09. ENTITY-RELATIONSHIP (ER) DATA MODELING
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Entity Classification & Relational Clustering
The conceptual data model connects 13 domain entities organized across four functional clusters:
1. **Governance & Identity Cluster:** `USER`, `TRAINER`, `TRAINEE`.
2. **Academic Curriculum Cluster:** `COURSE_TRADE`, `TRAINING`, `ATTENDANCE`.
3. **Workshop Fabrication Cluster:** `PRODUCT`, `PRODUCTION_ORDER`, `BILL_OF_MATERIAL`, `QUALITY_AUDIT`.
4. **Commercial & Welfare Cluster:** `INVENTORY`, `SALES_ORDER`, `DEMAND_FORECAST`, `STIPEND_RECORD`.

### 2. Cardinality Ratios & Multiplicity Rules
* `USER` to `TRAINEE` / `TRAINER`: $1 : 1$ mandatory relationship with foreign key cascade.
* `TRAINEE` to `ATTENDANCE`: $1 : N$ with composite unique constraint on `(trainee_id, attendance_date)`.
* `COURSE` to `TRAINING`: $1 : N$; each training batch maps to exactly one parent course curriculum.
* `PRODUCT` to `PRODUCTION_ORDER`: $1 : N$; multiple work orders can be released for a product.
* `SALES_ORDER` to `ORDER_ITEM`: $1 : N$; each retail receipt comprises multiple scanned line items.

---

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

---

# 11. MATHEMATICAL FORMULATIONS & CORE ALGORITHMS
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Atomic Bill of Materials (BOM) Deduction Algorithm
Calculates raw material volume required for work order batch size $Q_{\text{batch}}$:
$$\Delta Q_{\text{raw}, i} = Q_{\text{batch}} \times \text{BOM\_Ratio}_i \times (1 + \text{ScrapRate}_i)$$
* **Pre-Flight Invariant:** The system verifies $\forall i, Q_{\text{available}, i} \ge \Delta Q_{\text{raw}, i}$ within an atomic database transaction prior to persisting the work order.

### 2. Statutory 75.0% Attendance Rule Calculation
$$\text{Rate} = \frac{\sum \text{Days Present}}{\sum \text{Total Working Days}} \ge 0.7500$$
* **Implementation Invariant:** Evaluated using Java `BigDecimal` with scale 4 and `RoundingMode.HALF_UP`. Eliminates IEEE 754 floating-point binary rounding errors (e.g. 74.9999% vs 75.0000%).

### 3. Monthly Earn While Learn (EWYL) Stipend Accrual
$$S_{\text{monthly}} = (N_{\text{present}} \times R_{\text{daily}}) + (N_{\text{passed\_crafts}} \times R_{\text{piece}}) + B_{\text{bonus}}$$
* Aggregates verified production yields and attendance presence to generate banking payout ledgers.

### 4. Ordinary Least Squares (OLS) Demand Forecasting & Reorder Point
* **Slope & Intercept:**
  $$\beta_1 = \frac{\sum (t_i - \bar{t})(Y_i - \bar{Y})}{\sum (t_i - \bar{t})^2}, \quad \beta_0 = \bar{Y} - \beta_1 \bar{t}$$
* **30-Day Projection:** $\hat{Y}_t = \beta_0 + \beta_1 t$
* **Reorder Point (ROP):** $\text{ROP} = (\bar{d} \times L) + SS$, where $SS = Z_{\alpha} \times \sigma_d \times \sqrt{L}$

### 5. Multi-Tier GST Tax Half-Cent Balancing Algorithm
Calculates CGST (2.5%) and SGST (2.5%) using Banker's Rounding (`HALF_EVEN`) with balancing residual assigned to avoid penny discrepancies.

---

# 12. SOFTWARE TESTING STRATEGY & DEFECT LOG
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Master Testing Scorecard (IEEE 829 Compliance)
* **Total Planned Tests:** 37 / 37 Executed (**100% Pass Rate**).
* **Code Coverage (JaCoCo):** **88.41% Line Coverage** (3,050 / 3,450 lines) | **84.08% Branch Coverage**.
* **Concurrency Performance:** P95 response time of **95.0 ms** under 50 concurrent virtual users in Apache JMeter.
* **Residual Defects:** **0 Open Defects** (6 Logged / 6 Verified Closed).

### 2. Defect Resolution Summary (BUG-001 to BUG-006)
1. **BUG-001 (P1 Blocker):** POS race condition allowing inventory overselling under simultaneous checkouts. *Fix:* Injected `@Lock(LockModeType.PESSIMISTIC_WRITE)` in `InventoryRepository`.
2. **BUG-002 (P2 Critical):** Floating-point precision error in 74.9% attendance threshold check. *Fix:* Refactored calculation to `BigDecimal` with `HALF_UP` rounding.
3. **BUG-003 (P2 Critical):** Work order permitted creation when raw materials were insufficient. *Fix:* Added pre-reservation validation loop throwing `InsufficientRawMaterialException`.
4. **BUG-004 (P3 Major):** GST split truncation discrepancy on odd-rupee invoices. *Fix:* Implemented Banker's Rounding (`HALF_EVEN`) with balancing delta.
5. **BUG-005 (P3 Major):** Confidence interval vectors breaking CSV column alignment. *Fix:* Enclosed vector fields in RFC 4180 quotation blocks.
6. **BUG-006 (P4 Minor):** Department selection info tooltip clipped horizontally on mobile screens. *Fix:* Migrated tooltip component to React Portal on `document.body`.

---

# 13. DEVELOPER DIARY, MEETING MINUTES & VIVA NOTES
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Developer Work Diary & Implementation Log
* **Weeks 1–2:** Field immersion at KISS vocational training centers (Tailoring, Bamboo craft, Handloom); documented manual bottlenecks.
* **Weeks 3–4:** Designed 3-tier system architecture, formulated DFDs, ER diagrams, and relational schema; supervisor reviewed design.
* **Weeks 5–6:** Developed Spring Boot 3 REST APIs, integrated Spring Security 6 with stateless JWT, configured BCrypt password encryption.
* **Weeks 7–8:** Implemented attendance calculation service with 75% rule; created production work order module and BOM calculation.
* **Weeks 9–10:** Developed React 18 SPA frontend; encountered checkout race condition under concurrency test; solved with pessimistic row locking.
* **Weeks 11–12:** Implemented OLS demand forecasting algorithm; developed Direct Benefit Transfer (DBT) export module in NACH clearing format.
* **Weeks 13–14:** Executed full regression test suite (37 test cases, 88.41% JaCoCo coverage); authored comprehensive capstone documentation.

### 2. Anticipated Viva Defense Questions & Technical Answers
* **Q1: Why did you choose a monolithic multi-module architecture over microservices?**  
  *Answer:* For the scale of KISS (30,000 students and single-campus workshops), a modular monolith with decoupled packages offers the optimal balance of transactional simplicity (ACID guarantees via `@Transactional`), low operational latency (<100ms), and zero distributed network overhead.
* **Q2: How do you prevent stock overselling when two cashiers bill the last item simultaneously?**  
  *Answer:* Through JPA row-level pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`). The first transaction acquires an exclusive lock on the inventory row, decrements stock to 0, and commits. The second transaction observes available stock = 0 and is cleanly rejected with HTTP 409 Conflict.
* **Q3: What makes your attendance and stipend calculation deterministic?**  
  *Answer:* Standard double precision arithmetic suffers from IEEE 754 binary rounding drift. We use Java `BigDecimal` with 4-decimal precision and `RoundingMode.HALF_UP`, ensuring that 149/200 days evaluates to exactly 74.50% and 150/200 evaluates to exactly 75.00%.

---
