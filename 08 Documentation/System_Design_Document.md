# SYSTEM DESIGN DOCUMENT (SDD)
## High-Level & Low-Level Architectural Specification
### KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-SDD-v1.0  
**Project Title:** KISS Vocational Training Management System  
**Document Classification:** Technical Architecture & System Design Document  
**Date of Publication:** October 2026  
**Candidate / Author:** Mansi Sinha (Roll No: 2205160)  
**Degree Program:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Academic Department:** School of Computer Science and Engineering  
**Institutions:** KIIT Deemed to be University & Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## DOCUMENT CONTROL & APPROVALS

| Field | Detail |
| :--- | :--- |
| **Document Version** | Version 1.0 (Consolidated Capstone Architectural Specification) |
| **Primary Author** | Mansi Sinha (Roll No: 2205160, B.Tech CSE) |
| **Supervisor / Reviewer** | Faculty Project Supervisor, School of Computer Science & Engineering |
| **Host Institution** | Kalinga Institute of Social Sciences (KISS) Vocational Directorate |
| **Release Status** | Approved for Production Deployment & Final Academic Evaluation |
| **Repository Location** | `08 Documentation/System_Design_Document.docx` |

---

## 1. EXECUTIVE ARCHITECTURE ABSTRACT & SYSTEM OVERVIEW

The **KISS Vocational Training Management System (KV-TMS)** is a modern enterprise web platform engineered to automate and govern vocational education, workshop fabrication, dual-warehouse supply chains, retail point-of-sale operations, automated student stipend disbursements, and AI-driven demand forecasting. Specifically architected for the **Kalinga Institute of Social Sciences (KISS)**—the world's largest fully free residential institute for over 30,000 indigenous tribal children—KV-TMS replaces fragmented paper registers with a centralized, secure, and data-driven platform.

This **System Design Document (SDD)** defines the architectural blueprint of KV-TMS, encapsulating:
1. **High-Level Design (HLD):** 3-Tier enterprise topology, subsystem functional decomposition, and Level 0 & Level 1 Data Flow Diagrams (DFDs).
2. **Low-Level Design (LLD):** Object-oriented UML Use Case models, static UML Class architectures, relational Entity-Relationship (ER) models, dynamic UML Sequence diagrams (5 execution paths), and operational UML Activity workflows (5 operational paths).
3. **Infrastructure & Security:** RESTful API contracts, Spring Security 6 JWT filter chains, BCrypt password hashing, role-based access control (RBAC), and ACID transaction guarantees.

---

## 2. 3-TIER ENTERPRISE ARCHITECTURE

KV-TMS is architected around a strict **3-Tier Client-Server Topology** that enforces loose coupling, high cohesion, and horizontal scalability across all vocational modules.

![KV-TMS System Architecture Diagram](../03%20System%20Design/Architecture/KV-TMS%20System%20Architecture.png)  
*Figure 2.1: KV-TMS Multi-Tier System Architecture Diagram*

### 2.1 Layer Breakdown & Responsibilities

| Architectural Layer | Core Technologies | Primary Responsibilities | Protocols & Latency |
| :--- | :--- | :--- | :--- |
| **Tier 1: Presentation Layer (Client SPA)** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Axios, React Context API | Responsive single-page application dashboards for Admin, Trainer, Trainee, and Production/POS roles. Client-side routing, JWT interceptors, and optimistic UI updates. | HTTPS / TLS 1.3, DOM Render < 120ms |
| **Tier 2: Application / Logic Layer** | Java 17, Spring Boot 3.2.0, Spring Security 6, Spring Data JPA, Hibernate ORM | Stateless RESTful API orchestration, role-based authorization, ACID transaction boundaries (`@Transactional`), BOM calculation, and AI forecasting engine. | REST over JSON, API Latency < 450ms |
| **Tier 3: Persistence Layer** | MySQL 8.0 Enterprise Database, InnoDB Engine, HikariCP Connection Pool | Relational schema persistence across 9 core tables. Primary/foreign key constraints, B-Tree indexing, transaction isolation (Read Committed), and automated backups. | JDBC / TCP port 3306, Query Time < 45ms |

---

## 3. FUNCTIONAL SUBSYSTEMS & DATA FLOW ARCHITECTURE (DFD LEVEL 0)

### 3.1 Subsystem Functional Decomposition
The system encompasses eight interconnected functional subsystems:
1. **Identity & Governance Subsystem:** Manages user registration, BCrypt password hashing, and stateless JWT token issuance across 4 system roles.
2. **Academic Curriculum & Trainee Enrollment:** Governs vocational trades (Tailoring, Carpentry, Handicrafts), batch scheduling, and trainee profiles.
3. **Attendance & EWYL Stipend Subsystem:** Enforces the 75% attendance threshold and calculates monthly Earn While Learn (EWYL) stipends.
4. **Workshop Production & BOM Subsystem:** Schedules manufacturing work orders, enforces atomic Bill of Materials (BOM) inventory deductions, and logs quality audits.
5. **Two-Tier Inventory Subsystem:** Manages isolated stores for Raw Materials (Warehouse 1) and Finished Goods (Warehouse 2).
6. **Point-of-Sale (POS) Retail Subsystem:** Handles customer checkout, barcode scanning, Cash/UPI reconciliation, and real-time inventory adjustments.
7. **Direct Benefit Transfer (DBT) Disbursement:** Aggregates bank account numbers and automates stipend distribution ledgers.
8. **Applied AI Demand Forecasting Engine:** Utilizes statistical Ordinary Least Squares (OLS) regression to project 30-day inventory demand.

![KV-TMS DFD Level 0 Context Diagram](../03%20System%20Design/DFD/KV-TMS%20DFD%20Level%200.png)  
*Figure 3.1: KV-TMS DFD Level 0 Context Diagram*

### 3.2 DFD Level 0 External Entity & Data Flow Matrix

| External Entity | Inbound Data Flows to KV-TMS | Outbound Data Flows from KV-TMS | Security Context |
| :--- | :--- | :--- | :--- |
| **Administrator** | User credentials, trade master configs, role assignments, system audits | Executive dashboards, financial revenue reports, DBT approval summaries | Full Platform Privileges (`ROLE_ADMIN`) |
| **Trainer / Faculty** | Trainee marks, daily batch attendance, pedagogical syllabus updates | Attendance rosters, batch performance metrics, training schedules | Trade Scoped Access (`ROLE_TRAINER`) |
| **Trainee / Student** | Course enrollment requests, assessment answers, profile queries | Attendance % summaries, trade certificates, EWYL stipend slips | Student Portal Access (`ROLE_TRAINEE`) |
| **Production / POS Staff**| Work order logs, BOM requirements, sales items, cash/UPI amounts | Material requisition slips, stock alerts, printable tax invoices | Workshop & POS Scope (`ROLE_PRODUCTION`) |

---

## 4. DETAILED FUNCTIONAL DECOMPOSITION (DFD LEVEL 1)

The Level 1 Data Flow Diagram decomposes process `0.0` into 14 granular business processes interacting with 9 relational data stores (D1 to D9).

![KV-TMS DFD Level 1 Subsystem Flow Diagram](../03%20System%20Design/DFD/KV-TMS%20DFD%20Level%201.png)  
*Figure 4.1: KV-TMS DFD Level 1 Subsystem Flow Diagram*

### 4.1 Process Transformation & Data Store Interconnection Matrix

| Process ID | Process Name | Primary Input Flows | Data Store Interacted | Primary Output Flows |
| :--- | :--- | :--- | :--- | :--- |
| **1.0** | User Authentication | Username, password | **D1:** `users` | Bearer JWT token, role claims |
| **2.0** | Trainee Enrollment | Trainee demographic data | **D2:** `trainees` | Trainee ID, batch enrollment record |
| **3.0** | Attendance Recording | Daily batch attendance | **D3:** `attendances` | Attendance ledger, threshold flag |
| **4.0** | Stipend Ledgering | Attendance % records | **D3, D9:** `stipends` | Monthly EWYL stipend amount |
| **5.0** | Course Management | Curriculum, trade modules | **D4:** `courses`, `trainings` | Course catalog, batch schedules |
| **6.0** | Raw Material Inward | Supplier procurement slips | **D5:** `inventory` (WH1) | Stock balance update, stock ledger |
| **7.0** | Work Order Creation | Production batch request | **D7:** `production_orders` | Active work order, assigned trainees |
| **8.0** | Atomic BOM Deduction| Work order quantity | **D5:** `inventory` (WH1) | Raw material decrement, BOM log |
| **9.0** | Quality Inspection | Completed item audit | **D7:** `production_orders` | Pass/Fail certification, scrap record |
| **10.0**| Finished Stock Inward| Inspected batch units | **D6:** `inventory` (WH2) | Retail finished stock increment |
| **11.0**| POS Retail Checkout | Scanned item barcodes | **D6:** `inventory` (WH2) | Deducted stock, itemized invoice |
| **12.0**| Sales Reconciliation | Payment mode (Cash/UPI) | **D8:** `sales_orders` | Sales receipt, daily cash ledger |
| **13.0**| AI Demand Forecast | Historical sales orders | **D8:** `sales_orders` | 30-day forecast, reorder recommendations |
| **14.0**| Audit & DBT Export | Monthly disbursement run | **D9:** `stipends` | Banking NEFT/DBT batch payload |

---

## 5. BEHAVIORAL MODELING: UML USE CASE MODEL

The Use Case Model formalizes the functional capabilities available to each actor, establishing authorization boundaries and execution workflows.

![KV-TMS UML Use Case Diagram](../03%20System%20Design/UML/KV-TMS%20Use%20Case%20Diagram.png)  
*Figure 5.1: KV-TMS UML Use Case Diagram*

### 5.1 Use Case Catalog & Role Permissions

| UC ID | Use Case Name | Primary Actor | Stereotype | Business Goal & Preconditions |
| :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Authenticate User | All Actors | Foundation | Validates credentials, issues JWT token |
| **UC-02** | Manage Users & Trades | Administrator | Primary | Creates trainer/trainee accounts, provisions courses |
| **UC-03** | View Executive Analytics | Administrator | Primary | Aggregates training metrics, revenue, and stock levels |
| **UC-04** | Record Daily Attendance | Trainer / Faculty | Primary | Submits trainee presence; triggers threshold checks |
| **UC-05** | View Attendance & Stipend | Trainee / Student | Primary | Enables students to view attendance % and EWYL status |
| **UC-06** | Create Production Order | Production Manager | Primary | Initiates workshop batch for artisanal goods |
| **UC-07** | Deduct BOM Raw Materials | Production Manager | `<<include>>` UC-06 | Atomically decrements raw material stock from WH1 |
| **UC-08** | Perform Quality Audit | Production Manager | Primary | Inspects completed batch; updates pass/scrap counts |
| **UC-09** | Transfer to Finished Goods | Production Manager | `<<include>>` UC-08 | Credits approved goods to retail showroom (WH2) |
| **UC-10** | Process POS Retail Sale | Production / POS Staff | Primary | Scans retail items, collects payment, issues bill |
| **UC-11** | Generate AI Demand Forecast| Administrator / Manager| Primary | Runs OLS regression on historical sales data |
| **UC-12** | Disburse Monthly DBT | Administrator | Primary | Generates institutional banking payment files |

---

## 6. STATIC DOMAIN MODELING: UML CLASS ARCHITECTURE

The class architecture organizes the object-oriented structure of KV-TMS into 4 cohesive packages within the `com.kiss.kvtms` root namespace.

![KV-TMS Class Diagram](../03%20System%20Design/UML/KV-TMS%20Class%20Diagram.png)  
*Figure 6.1: KV-TMS Static UML Class Diagram*

### 6.1 Domain Class Catalog & Method Contracts

| Class Name | Package Namespace | Key Attributes | Core Public Operations / Methods |
| :--- | :--- | :--- | :--- |
| **User** | `com.kiss.kvtms.domain` | `id`, `username`, `password`, `email`, `role`, `createdAt` | `getAuthorities()`, `isEnabled()`, `validateCredentials()` |
| **Trainee** | `com.kiss.kvtms.domain` | `id`, `user`, `rollNumber`, `trade`, `bankAccount`, `stipendEligible` | `calculateAttendanceRate()`, `isEligibleForStipend()` |
| **Trainer** | `com.kiss.kvtms.domain` | `id`, `user`, `employeeCode`, `specialization`, `assignedTrade` | `markBatchAttendance()`, `evaluateTraineePractical()` |
| **Course** | `com.kiss.kvtms.domain` | `id`, `courseCode`, `courseName`, `tradeCategory`, `durationMonths` | `enrollTrainee()`, `getActiveTrainingSchedules()` |
| **Attendance** | `com.kiss.kvtms.domain` | `id`, `trainee`, `training`, `attendanceDate`, `status`, `stipendCredit` | `verifyThreshold()`, `computeCumulativeDays()` |
| **InventoryItem**| `com.kiss.kvtms.domain` | `id`, `itemCode`, `itemName`, `category`, `warehouseType`, `quantity` | `deductStock(qty)`, `addStock(qty)`, `isBelowSafetyStock()` |
| **ProductionOrder**| `com.kiss.kvtms.domain` | `id`, `orderNumber`, `product`, `quantity`, `status`, `qaPassedQty` | `allocateBOM()`, `completeInspection()`, `closeOrder()` |
| **SalesOrder** | `com.kiss.kvtms.domain` | `id`, `invoiceNumber`, `totalAmount`, `paymentMode`, `cashier`, `items` | `calculateTotal()`, `processPayment()`, `printInvoice()` |
| **DemandForecast**| `com.kiss.kvtms.domain` | `id`, `product`, `forecastPeriod`, `predictedDemand`, `safetyStock` | `runOLSRegression()`, `calculateReorderPoint()` |

---

## 7. CONCEPTUAL & LOGICAL DATA ARCHITECTURE (ER MODEL)

The conceptual data model connects 13 core relational entities across institutional governance, training tracks, workshop production, and retail sales.

![KV-TMS ER Diagram](../03%20System%20Design/ER%20Diagram/KV-TMS_ER_Diagram.png)  
*Figure 7.1: KV-TMS Entity-Relationship (ER) Diagram*

### 7.1 Relational Entities & Structural Data Invariants

| Entity Table | Primary Key | Foreign Keys & Target Entities | Cardinality | Structural Invariant & Business Rule |
| :--- | :--- | :--- | :--- | :--- |
| **users** | `id` (BIGINT) | None | 1 : 1 to Trainee/Trainer | `username` and `email` must be unique; password BCrypt hashed |
| **trainees** | `id` (BIGINT) | `user_id` -> `users(id)` | 1 : N to Attendance | Unique tribal roll number; holds bank account for DBT |
| **trainers** | `id` (BIGINT) | `user_id` -> `users(id)` | 1 : N to Trainings | Unique employee code; scoped to vocational trade specializations |
| **courses** | `id` (BIGINT) | None | 1 : N to Trainings | Unique course code; duration specified in academic weeks |
| **trainings** | `id` (BIGINT) | `course_id`, `trainer_id` | 1 : N to Attendance | Links course curriculum with trainer schedule and batch |
| **attendances**| `id` (BIGINT) | `trainee_id`, `training_id` | N : 1 Trainee/Training | Composite unique on `(trainee_id, attendance_date)` |
| **inventory** | `id` (BIGINT) | None | 1 : N to Sales/BOM | Stock level must be $\ge 0$; warehouse must be WH1 or WH2 |
| **production_orders** | `id` (BIGINT) | `product_id`, `supervisor_id` | 1 : N to OrderItems | Status enum (`PLANNED`, `IN_PROGRESS`, `INSPECTED`, `COMPLETED`) |
| **sales_orders** | `id` (BIGINT) | `cashier_id` -> `users(id)` | 1 : N to OrderItems | Atomic transaction; `total_amount` matches sum of items |

---

## 8. DYNAMIC BEHAVIORAL MODELING: SEQUENCE WORKFLOWS

### 8.1 Workflow 1: Authentication & JWT Handshake
The authentication sequence manages secure client login, credential verification against BCrypt hashes, and stateless JWT token issuance.

![KV-TMS Sequence 01 - Authentication](../03%20System%20Design/UML/KV-TMS%20Sequence%2001%20-%20Authentication.png)  
*Figure 8.1: Sequence Diagram - Authentication & JWT Handshake*

### 8.2 Workflow 2: Daily Attendance Marking & Stipend Eligibility
The attendance sequence enables trainers to submit attendance rosters, updates cumulative percentages, and triggers Earn While Learn eligibility flags.

![KV-TMS Sequence 02 - Attendance](../03%20System%20Design/UML/KV-TMS%20Sequence%2002%20-%20Attendance.png)  
*Figure 8.2: Sequence Diagram - Attendance Marking & EWYL Accrual*

---

## 9. DYNAMIC BEHAVIORAL MODELING: PRODUCTION & RETAIL WORKFLOWS

### 9.1 Workflow 3: Production Work Order & Atomic BOM Deduction
The production sequence enforces atomic raw material deductions from Warehouse 1 upon work order release, followed by quality inspection and finished goods stock credit in Warehouse 2.

![KV-TMS Sequence 03 - Production](../03%20System%20Design/UML/KV-TMS%20Sequence%2003%20-%20Production.png)  
*Figure 9.1: Sequence Diagram - Production Order & Atomic BOM Deduction*

### 9.2 Workflow 4: Point-of-Sale (POS) Retail Checkout & Inventory Adjustment
The retail POS sequence governs cashier item scanning, automated tax and discount calculation, cash/UPI payment collection, invoice creation, and immediate finished goods stock reduction.

![KV-TMS Sequence 04 - POS Retail](../03%20System%20Design/UML/KV-TMS%20Sequence%2004%20-%20POS%20Retail.png)  
*Figure 9.2: Sequence Diagram - Point-of-Sale Retail Checkout*

---

## 10. DYNAMIC BEHAVIORAL MODELING: AI FORECASTING & MATHEMATICAL FORMULATIONS

### 10.1 Workflow 5: AI Demand Forecasting & Direct Benefit Transfer (DBT)
The predictive forecasting sequence runs statistical regression across historical POS receipts to project 30-day demand and advise reorder points, while the monthly DBT sequence aggregates student bank ledgers.

![KV-TMS Sequence 05 - AI Forecasting & DBT](../03%20System%20Design/UML/KV-TMS%20Sequence%2005%20-%20AI%20Forecasting%20%26%20DBT.png)  
*Figure 10.1: Sequence Diagram - AI Demand Forecasting & DBT Disbursement*

### 10.2 Mathematical Algorithms & Invariants

| Domain Area | Mathematical Model / Invariant Formula | Operational Interpretation & Invariant Rule |
| :--- | :--- | :--- |
| **BOM Atomic Deduction** | $\Delta Q_{\text{raw}, i} = Q_{\text{order}} \times \text{BOM\_Ratio}_i$ | The system verifies $\forall i, Q_{\text{stock}, i} \ge \Delta Q_{\text{raw}, i}$ prior to issuing production orders. |
| **75% Attendance Law** | $\text{Rate} = \frac{\sum \text{Days Present}}{\sum \text{Total Working Days}} \ge 0.75$ | Strict institutional rule; trainees falling below 75% are ineligible for monthly stipend disbursement. |
| **Monthly Stipend Calculation** | $S_{\text{monthly}} = (N_{\text{present}} \times R_{\text{daily}}) + B_{\text{craft}}$ | Calculates monetary stipend deposited directly into student bank accounts via NEFT/DBT. |
| **OLS Demand Regression** | $\hat{Y}_t = \beta_0 + \beta_1 t, \quad \text{ROP} = (d \times L) + SS$ | Ordinary Least Squares linear trend combined with Lead-Time ($L$) and Safety Stock ($SS$) for reorder alert. |

---

## 11. OPERATIONAL FLOW MODELING: ACTIVITY DIAGRAMS (PART 1)

### 11.1 Activity 1: Authentication & Role-Based Routing
Models user credential entry, CAPTCHA verification, password hash validation, and dashboard routing based on security claims.

![KV-TMS Activity 01 - Authentication](../03%20System%20Design/UML/KV-TMS%20Activity%2001%20-%20Authentication.png)  
*Figure 11.1: Activity Diagram - User Authentication & Routing*

### 11.2 Activity 2: Daily Attendance Marking Lifecycle
Models the trainer selecting a batch, marking student presence/absence, validating records, and notifying academic administrators.

![KV-TMS Activity 02 - Attendance](../03%20System%20Design/UML/KV-TMS%20Activity%2002%20-%20Attendance.png)  
*Figure 11.2: Activity Diagram - Attendance Marking & Stipend Flagging*

---

## 12. OPERATIONAL FLOW MODELING: ACTIVITY DIAGRAMS (PART 2)

### 12.1 Activity 3: Workshop Production & QA Inspection
Models work order scheduling, raw material availability checking, fabrication tracking, and quality audit pass/scrap branching.

![KV-TMS Activity 03 - Production](../03%20System%20Design/UML/KV-TMS%20Activity%2003%20-%20Production.png)  
*Figure 12.1: Activity Diagram - Manufacturing & QA Inspection*

### 12.2 Activity 4: Point-of-Sale (POS) Retail Checkout
Models item barcode entry, cart summation, payment method selection (Cash vs. UPI QR), invoice generation, and finished stock decrement.

![KV-TMS Activity 04 - POS Retail](../03%20System%20Design/UML/KV-TMS%20Activity%2004%20-%20POS%20Retail.png)  
*Figure 12.2: Activity Diagram - Retail Checkout & Invoice Issuance*

---

## 13. OPERATIONAL FLOW MODELING: ACTIVITY DIAGRAMS (PART 3)

### 13.1 Activity 5: AI Demand Forecasting & Monthly DBT Disbursement
Models weekly scheduled regression calculation of sales trends, production recommendation generation, and monthly DBT stipend banking runs.

![KV-TMS Activity 05 - AI Forecasting & DBT](../03%20System%20Design/UML/KV-TMS%20Activity%2005%20-%20AI%20Forecasting%20%26%20DBT.png)  
*Figure 13.1: Activity Diagram - AI Demand Forecasting & DBT Payout*

### 13.2 Activity Transition & Decision Logic Matrix

| Activity Workflow | Initial State | Key Decision Gateway | Success Termination State | Error / Exception Path |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | User submits login | Are credentials valid? | User redirected to role dashboard | HTTP 401 Unauthorized; retry prompt |
| **Attendance** | Trainer opens batch | Are all students logged? | Attendance saved; EWYL updated | Duplicate submission blocked; error toast |
| **Production Order**| Manager enters qty | Is raw stock sufficient? | Order completed; finished goods credited | Order aborted with insufficient stock alert |
| **POS Checkout** | Cashier scans item | Payment approved? | Receipt printed; stock decremented | Transaction rolled back; cart preserved |
| **AI Demand & DBT** | Cron job triggered | Is attendance $\ge 75\%$? | Bank DBT file exported; forecast saved| Flagged as disqualified; alert sent to Admin |

---

## 14. INTERFACE DESIGN & SECURITY ARCHITECTURE

### 14.1 RESTful API Endpoint Catalog

| HTTP Method | API Endpoint Path | Permitted Roles | Request Payload | Response Code & Output |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | `{ username, password }` | `200 OK` -> `{ token, role, user }` |
| `GET` | `/api/v1/trainees` | ADMIN, TRAINER | None | `200 OK` -> Array of Trainee records |
| `POST` | `/api/v1/attendance/batch` | TRAINER, ADMIN | `{ batchId, date, records[] }` | `201 Created` -> Attendance summary |
| `GET` | `/api/v1/inventory` | ADMIN, PROD | None | `200 OK` -> Dual warehouse item list |
| `POST` | `/api/v1/production-orders`| ADMIN, PROD | `{ productId, quantity }` | `201 Created` -> Work order details |
| `POST` | `/api/v1/pos/checkout` | ADMIN, PROD | `{ items[], paymentMode }` | `200 OK` -> Itemized Tax Invoice |
| `GET` | `/api/v1/forecasting/demand`| ADMIN, PROD | None | `200 OK` -> 30-day forecast projections |

### 14.2 Security Architecture & Defense-in-Depth
* **Stateless Authentication:** Spring Security 6 configured with `SessionCreationPolicy.STATELESS`. Every request is intercepted by `JwtAuthenticationFilter`.
* **Credential Protection:** Passwords hashed with BCrypt algorithm at work factor 12. Plaintext passwords never stored or logged.
* **Role-Based Access Control (RBAC):** Endpoints guarded with `@PreAuthorize("hasRole('ADMIN')")` method-level security.
* **Network & Transport:** Transport Layer Security (TLS 1.3) via HTTPS, strict CORS origin policies, and CSRF protection disabled safely for stateless JWT APIs.

---

## 15. REQUIREMENTS TRACEABILITY MATRIX & ACADEMIC SIGN-OFF

### 15.1 Traceability Matrix (SRS Requirements to Design Components)

| Req ID | Requirement Description | Architecture Tier | Primary Domain Class | API Endpoint | Test Case ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Role-Based User Authentication | Tier 2 (Application) | `User`, `JwtTokenProvider` | `POST /api/v1/auth/login` | `TC-AUTH-01` |
| **FR-02** | Trainee Profile Management | Tier 2 / Tier 3 | `Trainee`, `TraineeService` | `GET /api/v1/trainees` | `TC-TRN-01` |
| **FR-03** | Daily Attendance & 75% Rule | Tier 2 (Logic) | `Attendance`, `AttendanceService`| `POST /api/v1/attendance` | `TC-ATT-01` |
| **FR-04** | Workshop Work Order Scheduling | Tier 2 (Logic) | `ProductionOrder`, `ProductionService`| `POST /api/v1/production-orders`| `TC-PRD-01` |
| **FR-05** | Atomic BOM Stock Deduction | Tier 2 / Tier 3 | `InventoryItem`, `BOMService` | Internal `@Transactional` | `TC-BOM-01` |
| **FR-06** | Retail POS Barcode Checkout | Tier 1 / Tier 2 | `SalesOrder`, `POSService` | `POST /api/v1/pos/checkout` | `TC-POS-01` |
| **FR-07** | OLS Demand Forecasting | Tier 2 (AI Module) | `DemandForecast`, `ForecastService` | `GET /api/v1/forecasting` | `TC-AI-01` |
| **FR-08** | Automated DBT Stipend Export | Tier 2 (Logic) | `StipendRecord`, `DBTService` | `GET /api/v1/dbt/export` | `TC-DBT-01` |

### 15.2 Academic Verification & Sign-Off

I hereby certify that this **System Design Document (SDD)** represents an original, comprehensive, and verified architectural specification for the **KISS Vocational Training Management System (KV-TMS)** capstone project.

**Candidate Name:** Mansi Sinha  
**Roll Number:** 2205160  
**Degree:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Department:** School of Computer Science and Engineering  
**Institutions:** KIIT Deemed to be University & Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  
**Academic Year:** 2025-2026  
**Signature of Candidate:** _____________________________  
**Date:** October 9, 2026  
