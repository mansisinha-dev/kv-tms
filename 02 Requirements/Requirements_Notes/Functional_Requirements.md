# FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-FRD-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Initial System Specification)  
**Date:** October 7, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. DOCUMENT CONTROL & EXECUTIVE SUMMARY

### 1.1 Purpose of the Document
This Functional Requirements Document (FRD) defines the complete, granular functional behavior, operational business rules, data interactions, validation criteria, and system interfaces of the **KISS Vocational Training Management System (KV-TMS)**. 

While the Software Requirements Specification (SRS) provides the high-level system perspective, architectural framework, and non-functional bounds, this document serves as the **authoritative functional specification**. It details each functional requirement from the user’s trigger to backend transactional processing, database mutation, and response rendering.

### 1.2 System Overview
KV-TMS is a multi-tier, responsive enterprise platform built to digitize, unify, and scale vocational education, hands-on production, dual-warehouse supply chain operations, retail commercialization, and trainee financial empowerment at KISS. 

The software establishes a closed-loop operational pipeline:
- **Stage 1:** Vocational Student Enrollment & Skills Curriculum
- **Stage 2:** Daily Cohort Attendance & Leave Request Management
- **Stage 3:** Workshop Work-Order Scheduling & Machine Allocation
- **Stage 4:** BOM Raw Material Requisition (Warehouse 1 Auto-Deduction)
- **Stage 5:** Shop-Floor Quality Control (QC) Inspection & Unit Verification
- **Stage 6:** Finished Goods Intake & Barcode Tagging (Warehouse 2 Hub)
- **Stage 7:** Point of Sale (POS) Retail Billing & Instant Stock Deduction
- **Stage 8:** Earn While You Learn (EWYL) Direct Benefit Transfer (DBT) Payouts
- **Stage 9:** AI Demand Forecasting & Production Batch Reorder Planning

### 1.3 Key Architectural Foundations
- **Frontend Architecture:** React 19 Single Page Application (SPA), Vite 8, Tailwind CSS, Lucide React icons, and Recharts analytics.
- **Backend Architecture:** Java 17 LTS, Spring Boot 3.x RESTful Web Services, Spring Security 6.x stateless filter pipeline.
- **Authentication & Cryptography:** JSON Web Tokens (JWT) with HMAC-SHA256 signature, BCrypt password hashing ($10\text{ salt rounds}$).
- **Data Persistence:** Spring Data JPA, Hibernate 6.x ORM, relational schema with H2 in-memory engine (evaluation/demonstration) and MySQL 8.0+ / PostgreSQL 15+ production compatibility.

---

## 2. STAKEHOLDER & USER ROLE SPECIFICATIONS

KV-TMS provides strictly governed, role-based functionality for four authenticated user classes and one public user class.

```
+----------------------------------------------------------------------------------------------------+
|                                    USER ROLE HIERARCHY & MATRIX                                    |
+--------------------------+-----------------------+-------------------------------------------------+
| Role Name                | System Identifier     | Core Functional Authority                       |
+--------------------------+-----------------------+-------------------------------------------------+
| System Administrator     | ROLE_ADMIN            | Complete administrative oversight; user account |
|                          |                       | provisioning; trade catalog configuration;      |
|                          |                       | warehouse management; POS sales terminal; DBT   |
|                          |                       | stipend disbursement; notice broadcasts; audit. |
+--------------------------+-----------------------+-------------------------------------------------+
| Trainer / Faculty        | ROLE_TRAINER          | Academic trade management; syllabus tracking;   |
|                          |                       | daily cohort attendance; leave approval drawer; |
|                          |                       | competency evaluation and practical grading.   |
+--------------------------+-----------------------+-------------------------------------------------+
| Production Manager /     | ROLE_PRODUCTION_      | Workshop work orders; machine/batch allocation; |
| Workshop Staff           | MANAGER               | BOM raw material requisition; Quality Control   |
|                          |                       | (QC) inspection; trainee output unit logging;   |
|                          |                       | finished goods handoff to Warehouse 2.          |
+--------------------------+-----------------------+-------------------------------------------------+
| Trainee / Student        | ROLE_TRAINEE          | Enrolled trade progress; attendance benchmarks; |
|                          |                       | leave application submission; competency report |
|                          |                       | cards; Earn While You Learn (EWYL) earnings and |
|                          |                       | Direct Benefit Transfer (DBT) payment status.   |
+--------------------------+-----------------------+-------------------------------------------------+
| Public Visitor /         | ROLE_PUBLIC           | Public institutional showcase exploration; live |
| Prospective Applicant    |                       | impact counters; trade directory; artisan       |
|                          |                       | stories; admission inquiry form; session bridge.|
+--------------------------+-----------------------+-------------------------------------------------+
```

---

## 3. DETAILED FUNCTIONAL REQUIREMENTS BY MODULE

### MODULE 1: AUTHENTICATION, AUTHORIZATION & IDENTITY GOVERNANCE

#### FR-AUTH-001: User Login & Cryptographic JWT Issuance
- **Description:** The system shall authenticate registered users using credentials and issue a stateless, signed JSON Web Token (JWT).
- **Primary Actor:** All Users (`ROLE_ADMIN`, `ROLE_TRAINER`, `ROLE_PRODUCTION_MANAGER`, `ROLE_TRAINEE`).
- **Priority:** Critical.
- **Pre-conditions:** The user account must exist in the database with status `ACTIVE`.
- **Inputs:** `username` (string, required), `password` (string, required).
- **Processing Logic:**
  1. Client sends JSON payload to `POST /api/v1/auth/login`.
  2. Spring Security `AuthenticationManager` fetches user details by username.
  3. Verifies provided plaintext password against the stored BCrypt hash.
  4. If credentials match, generates a signed JWT containing claims: `sub` (username), `roles` (granted authorities), `iat` (issued at timestamp), and `exp` (expiration timestamp).
  5. Returns HTTP 200 with response payload: `{ token, username, role, fullName, userId }`.
- **Validation Rules:**
  - `username` and `password` cannot be null or blank.
  - Reject invalid credentials with HTTP 401 Unauthorized (`"Invalid username or password"`).
  - Reject disabled accounts with HTTP 403 Forbidden (`"Account is deactivated"`).
- **Post-conditions:** Client stores JWT in `localStorage` / application state; all subsequent HTTP requests attach the header: `Authorization: Bearer <token>`.

#### FR-AUTH-002: Production Staff Self-Registration
- **Description:** The system shall provide a dedicated registration gateway for workshop supervisors and production staff to register for system access.
- **Primary Actor:** Prospective Production Staff.
- **Priority:** High.
- **Pre-conditions:** Production registration gateway active at `LoginPage.jsx`.
- **Inputs:** `username` (alphanumeric, 4–30 chars), `password` (min 6 chars), `fullName` (string), `email` (valid email format), `workshopSpecialization` (Tailoring, Pottery, Bamboo, Food Processing).
- **Processing Logic:**
  1. Client submits payload to `POST /api/v1/auth/register-production-staff`.
  2. Backend validates that `username` and `email` are globally unique.
  3. Encrypts password using BCrypt with salt rounds = 10.
  4. Persists new `User` entity automatically assigning authority `ROLE_PRODUCTION_MANAGER`.
  5. Returns HTTP 201 Created with confirmation message.
- **Validation Rules:**
  - Duplicate usernames return HTTP 409 Conflict (`"Username is already registered"`).
  - Malformed emails return HTTP 400 Bad Request.

#### FR-AUTH-003: Administrative User Account Provisioning
- **Description:** System Administrators shall have the authority to provision, modify, or deactivate user accounts for Trainees, Trainers, and Staff.
- **Primary Actor:** System Administrator (`ROLE_ADMIN`).
- **Priority:** High.
- **Endpoint:** `POST /api/v1/admin/users`, `GET /api/v1/admin/users`, `PUT /api/v1/admin/users/{id}/status`.
- **Processing Logic:**
  - Administrator creates account specifying role (`ROLE_TRAINEE`, `ROLE_TRAINER`, `ROLE_ADMIN`).
  - Sets initial temporary password and associated profile references.
  - Can toggle status between `ACTIVE` and `DEACTIVATED`.

#### FR-AUTH-004: Stateless Role-Based Access Control (RBAC) & Route Protection
- **Description:** Every protected REST endpoint and frontend view shall enforce strict role-based access rules.
- **Primary Actor:** System Filter Engine.
- **Processing Logic:**
  1. `JwtAuthenticationFilter` intercepts each incoming request.
  2. Extracts and verifies JWT signature using HMAC-SHA256 secret.
  3. Populates `SecurityContextHolder` with authenticated user and granted authorities.
  4. Method security evaluates `@PreAuthorize("hasRole('ADMIN')")`.
  5. Unauthenticated requests return HTTP 401; unauthorized role access returns HTTP 403.
  6. Frontend React Router dynamically redirects users to their designated console (`/admin`, `/trainer`, `/production`, `/portal`).

#### FR-AUTH-005: Secure Session Invalidation & Logout
- **Description:** The system shall support secure logout by evicting tokens and resetting client application state.
- **Primary Actor:** All Users.
- **Processing Logic:** Client flushes stored JWT from memory and `localStorage`, invalidates active state, and navigates immediately to `/login`.

---

### MODULE 2: TRAINEE & ACADEMIC COHORT MANAGEMENT

#### FR-TRN-001: Trainee Enrollment & Profile Governance
- **Description:** Capture, maintain, and update complete demographic and vocational profiles of trainees.
- **Primary Actor:** Administrator (`ROLE_ADMIN`).
- **Inputs:** `fullName`, `gender`, `dateOfBirth`, `tribeCategory`, `contactNumber`, `guardianName`, `residentialVillage`, `district`, `aadhaarNumber`, `bankAccountNumber`, `bankIfscCode`.
- **Processing Logic:**
  1. Persists `TraineeProfile` mapped to the corresponding `User` account.
  2. Validates 12-digit Aadhaar number and valid IFSC code structure.
  3. Flags profile as ready for trade assignment.

#### FR-TRN-002: Vocational Trade Assignment & Cohort Allocation
- **Description:** Assign enrolled trainees to specific trade tracks (Apparels & Tailoring, Terracotta, Bamboo Crafts, Food Processing) and academic batches.
- **Primary Actor:** Administrator (`ROLE_ADMIN`), Trainer (`ROLE_TRAINER`).
- **Inputs:** `traineeId`, `tradeId`, `batchCode` (e.g., `BATCH-2026-TLR-01`), `enrollmentDate`.
- **Processing Logic:** Associates trainee with trade syllabus and enables them on the daily attendance roster for that cohort.

#### FR-TRN-003: Trainee Academic Progress & Syllabus View
- **Description:** Allow trainees to inspect their personal training curriculum, module milestones, and trainer contact information.
- **Primary Actor:** Trainee (`ROLE_TRAINEE`).
- **Endpoint:** `GET /api/v1/academic/trainee/my-progress`.
- **Output:** Completed modules count, current module topic, attendance percentage, and upcoming practical evaluation dates.

---

### MODULE 3: TRAINER & FACULTY CURRICULUM ADMINISTRATION

#### FR-FAC-001: Trainer Profile & Specialization Directory
- **Description:** Maintain faculty records including specialization area, office location, contact information, and assigned trade cohorts.
- **Primary Actor:** Administrator (`ROLE_ADMIN`).
- **Endpoint:** `GET /api/v1/academic/trainers`, `POST /api/v1/academic/trainers`.

#### FR-FAC-002: Trade Curriculum & Syllabus Module Structuring
- **Description:** Trainers shall structure and maintain vocational syllabi divided into sequential theory and practical modules.
- **Primary Actor:** Trainer (`ROLE_TRAINER`), Administrator (`ROLE_ADMIN`).
- **Inputs:** `tradeId`, `moduleCode`, `moduleTitle`, `totalHours`, `theoryVsPracticalRatio`, `learningOutcomes`.
- **Processing Logic:** Persists syllabus modules. Trainees in that trade receive real-time updates on curriculum progression.

---

### MODULE 4: ATTENDANCE & LEAVE MANAGEMENT WORKFLOW

#### FR-ATT-001: Daily Cohort Attendance Marking
- **Description:** Trainers shall mark daily attendance for each trainee enrolled in their active trade cohort.
- **Primary Actor:** Trainer (`ROLE_TRAINER`).
- **Endpoint:** `POST /api/v1/attendance/mark-batch`.
- **Inputs:** `tradeId`, `sessionDate` (ISO Date), `attendanceList: [{ traineeId, status }]` where `status` $\in$ `{PRESENT, ABSENT, LATE, EXCUSED}`.
- **Validation Rules:**
  - Attendance can only be recorded for valid enrolled trainees.
  - Rejects duplicate attendance submissions for the same cohort on the same date unless in explicit update mode.
- **Post-conditions:** Recalculates trainee cumulative attendance percentage in real time.

#### FR-ATT-002: Attendance Analytics & Benchmark Alerts
- **Description:** Automatically compute attendance statistics and raise visual alerts when attendance drops below the mandatory 75% institutional threshold.
- **Primary Actor:** Trainer, Administrator, Trainee.
- **Processing Logic:**
$$\text{Attendance Rate} = \left(\frac{\text{Sessions Attended}}{\text{Total Sessions Conducted}}\right) \times 100$$
- Highlights trainees with $\text{Rate} < 75\%$ in red warning badges across faculty and student portals.

#### FR-LEV-001: Trainee Leave Application Submission
- **Description:** Trainees shall apply for official leaves of absence specifying dates, category, and reason.
- **Primary Actor:** Trainee (`ROLE_TRAINEE`).
- **Endpoint:** `POST /api/v1/leaves/apply`.
- **Inputs:** `startDate` (ISO Date), `endDate` (ISO Date), `category` (`MEDICAL`, `PERSONAL`, `ACADEMIC`, `BEREAVEMENT`), `reason` (string, max 500 chars).
- **Validation Rules:**
  - `startDate` cannot be in the past.
  - `endDate` must be $\ge \text{startDate}$.
  - System prevents overlapping pending or approved leave requests.
- **Post-conditions:** Creates `LeaveRequest` with status `PENDING`. Dispatches notification badge to cohort trainer.

#### FR-LEV-002: Trainer Leave Review & Approval Drawer
- **Description:** Trainers and administrators shall inspect pending leave requests and approve or reject them with audit remarks.
- **Primary Actor:** Trainer (`ROLE_TRAINER`), Administrator (`ROLE_ADMIN`).
- **Endpoint:** `PUT /api/v1/leaves/{id}/review`.
- **Inputs:** `leaveId`, `decision` (`APPROVED` or `REJECTED`), `reviewerRemarks` (string).
- **Processing Logic:** Updates leave record status. If `APPROVED`, automatically logs days within the date range as `EXCUSED` in the attendance engine, preventing unexcused absence penalties.

---

### MODULE 5: PRACTICAL COMPETENCY ASSESSMENT & GRADING

#### FR-ASM-001: Assessment Milestone Definition
- **Description:** Define practical and craftsmanship evaluation events.
- **Primary Actor:** Trainer (`ROLE_TRAINER`).
- **Inputs:** `tradeId`, `assessmentTitle` (e.g., "Pattern Cutting & Stitching Practical Exam"), `assessmentDate`, `maxMarks` (number), `passingMarks` (number).

#### FR-ASM-002: Multi-Factor Evaluation & Skill Rating
- **Description:** Record trainee practical scores, qualitative craftsmanship feedback, and a 1-to-5 star skill rating.
- **Primary Actor:** Trainer (`ROLE_TRAINER`).
- **Endpoint:** `POST /api/v1/academic/assessments/submit-grades`.
- **Inputs:** `assessmentId`, `grades: [{ traineeId, score, starRating (1-5), remarks }]`.
- **Post-conditions:** Persists assessment records and updates trainee competency profile.

---

### MODULE 6: MASTER PRODUCT CATALOG MANAGEMENT

#### FR-CAT-001: Product SKU Creation & Trade Categorization
- **Description:** Maintain the catalog of standardized crafts and products manufactured during vocational training.
- **Primary Actor:** Production Manager (`ROLE_PRODUCTION_MANAGER`), Administrator (`ROLE_ADMIN`).
- **Inputs:** `productName`, `sku` (unique alphanumeric, e.g., `TLR-SHIRT-M-01`), `tradeId`, `unitPrice` (decimal), `costPrice` (decimal), `unitOfMeasure` (Pcs, Set, Kg), `description`.
- **Validation Rules:** `sku` must be globally unique across all catalog products.

---

### MODULE 7: SHOP-FLOOR PRODUCTION UNIT & QUALITY CONTROL

#### FR-PRD-001: Production Work Order Scheduling
- **Description:** Create scheduled manufacturing work orders specifying batch targets, machine/loom allocation, and deadlines.
- **Primary Actor:** Production Manager (`ROLE_PRODUCTION_MANAGER`).
- **Endpoint:** `POST /api/v1/production/work-orders`.
- **Inputs:** `productId`, `targetQuantity` (integer $> 0$), `batchNumber` (unique string), `machineId` / `loomIdentifier`, `scheduledCompletionDate`.
- **Post-conditions:** Creates `ProductionWorkOrder` in status `SCHEDULED`.

#### FR-PRD-002: Bill of Materials (BOM) Raw Material Auto-Requisition
- **Description:** Automatically calculate required raw materials from the Bill of Materials (BOM) upon launching a work order and deduct them from Warehouse 1.
- **Primary Actor:** Production Manager (`ROLE_PRODUCTION_MANAGER`).
- **Processing Logic:**
  1. On transition of work order from `SCHEDULED` to `IN_PROGRESS`, system retrieves BOM recipe:
$$\text{Required Quantity}_i = \text{Target Batch Units} \times \text{BOM Unit Requirement}_i$$
  2. Checks available stock in Warehouse 1 (Raw Materials Depot).
  3. If stock is sufficient, executes atomic deduction from Warehouse 1 stock records.
  4. If stock is insufficient, rejects launch with error: `"Insufficient raw materials in Warehouse 1"`.

#### FR-PRD-003: Quality Control (QC) Inspection & Defect Segregation
- **Description:** Perform formal inspection of finished craft units, logging approved units vs. rejected/scrap units.
- **Primary Actor:** Production Manager (`ROLE_PRODUCTION_MANAGER`).
- **Endpoint:** `POST /api/v1/production/work-orders/{id}/qc-inspection`.
- **Inputs:** `workOrderId`, `passedQuantity` (integer $\ge 0$), `rejectedQuantity` (integer $\ge 0$), `defectNotes` (string).
- **Validation Rules:**
$$\text{passedQuantity} + \text{rejectedQuantity} = \text{Target Batch Units}$$
- **Post-conditions:**
  1. Updates work order status to `COMPLETED`.
  2. Atomically increments Warehouse 2 (Finished Goods Hub) stock by `passedQuantity`.
  3. Triggers Trainee Unit Attribution for EWYL stipend computation.

#### FR-PRD-004: Trainee Output Attribution for Incentive Tracking
- **Description:** Log individual trainee contributions to completed production runs to drive Earn-While-You-Learn stipend disbursements.
- **Primary Actor:** Production Manager (`ROLE_PRODUCTION_MANAGER`).
- **Inputs:** `workOrderId`, `attributions: [{ traineeId, unitsCrafted }]`.
- **Validation Rules:** $\sum \text{unitsCrafted} \le \text{passedQuantity}$.

---

### MODULE 8: TWO-TIER DUAL-WAREHOUSE LOGISTICS

#### FR-WHS-001: Warehouse 1 (Raw Materials Depot) Stock Intake
- **Description:** Record procurement intake of bulk raw materials (fabrics, thread, timber, clay, dyes, glazes).
- **Primary Actor:** Administrator (`ROLE_ADMIN`), Production Manager (`ROLE_PRODUCTION_MANAGER`).
- **Inputs:** `materialId`, `quantityReceived`, `unitCost`, `supplierBatchNo`, `invoiceReference`.
- **Post-conditions:** Increments Warehouse 1 inventory records.

#### FR-WHS-002: Warehouse 1 Minimum Threshold Alert Engine
- **Description:** Continuously evaluate raw material stock levels against defined minimum safety thresholds and generate alerts.
- **Primary Actor:** System Background Engine.
- **Processing Logic:**
  - For each raw material item, if $\text{currentStock} \le \text{reorderThreshold}$, trigger alert state.
  - Renders red alert badge in `DualWarehouse.jsx` and `AdminConsole.jsx`.

#### FR-WHS-003: Warehouse 2 (Finished Goods Hub) Stock & Barcode Intake
- **Description:** Maintain finished goods received from QC inspection, cataloging SKU barcodes, storage bin locations, and available-for-sale counts.
- **Primary Actor:** Administrator (`ROLE_ADMIN`), Production Manager.
- **Endpoint:** `GET /api/v1/inventory/warehouse-2/finished-goods`.
- **Processing Logic:** Provides live inventory counts to the Point of Sale (POS) terminal.

---

### MODULE 9: SALES POINT OF SALE (POS) TERMINAL & RETAIL INVOICING

#### FR-POS-001: Real-Time Catalog Lookup & Barcode Search
- **Description:** Provide sub-second search of finished products by SKU, barcode, name, or trade category.
- **Primary Actor:** Retail Cashier / Administrator (`ROLE_ADMIN`).
- **Endpoint:** `GET /api/v1/sales/pos/search?query={term}`.
- **Output:** Matching products with SKU, current retail price, thumbnail, and live Warehouse 2 stock availability.

#### FR-POS-002: Dynamic Interactive Shopping Cart
- **Description:** Support interactive cart operations with real-time quantity increment/decrement, line-item removal, and price calculation.
- **Primary Actor:** Cashier / Administrator.
- **Validation Rules:** Line-item quantity cannot exceed available Warehouse 2 stock (`qty <= availableStock`). Attempting to add out-of-stock items is blocked.

#### FR-POS-003: Automated Tax (GST) & Discount Computation
- **Description:** Dynamically compute subtotal, configurable tax amounts (GST 5% / 12% / 18%), applied discounts, and net payable balance.
- **Processing Logic:**
$$\text{Line Total}_i = \text{Unit Price}_i \times \text{Quantity}_i$$
$$\text{Subtotal} = \sum \text{Line Total}_i$$
$$\text{Tax Amount} = \text{Subtotal} \times \text{GST Rate}$$
$$\text{Net Payable} = (\text{Subtotal} + \text{Tax Amount}) - \text{Discount}$$

#### FR-POS-004: Multi-Tender Payment Processing
- **Description:** Accept and record customer payments across multiple tender modes: Cash, UPI (QR code reference), and Credit/Debit Card.
- **Inputs:** `paymentMode` (`CASH`, `UPI`, `CARD`), `amountTendered`, `referenceTransactionId` (for UPI/Card).

#### FR-POS-005: Digital Invoice Generation & Atomic Stock Deduction
- **Description:** Upon payment confirmation, finalize the transaction, generate an official printable invoice receipt, and atomically decrement stock from Warehouse 2.
- **Primary Actor:** Cashier / Administrator.
- **Endpoint:** `POST /api/v1/sales/pos/checkout`.
- **Processing Logic (Enclosed in `@Transactional` boundary):**
  1. Validates current stock for all cart items.
  2. Generates unique Invoice Number: `INV-YYYYMMDD-XXXX`.
  3. Inserts `SalesTransaction` and associated `TransactionLineItem` records.
  4. Atomically decrements `currentStock` in Warehouse 2 for each purchased product.
  5. Returns HTTP 201 with completed receipt payload for printing.

---

### MODULE 10: "EARN WHILE YOU LEARN" (EWYL) & DBT TRAINEE STIPEND ENGINE

#### FR-DBT-001: Automated Output-Linked Stipend Calculation
- **Description:** Automatically calculate trainee financial stipend entitlements based on verified craft output units multiplied by trade piece rates.
- **Primary Actor:** System Calculation Service.
- **Processing Logic:**
$$\text{Stipend Accrued} = \text{Verified Units Crafted} \times \text{Approved Trade Piece Rate}$$
- Creates pending entry in `TraineeStipendLedger`.

#### FR-DBT-002: Direct Benefit Transfer (DBT) Bank Ledger
- **Description:** Maintain official DBT records linking Trainee ID with verified Bank Account Number, Bank IFSC, Aadhaar Seeding Status, and cumulative accrued balance.
- **Endpoint:** `GET /api/v1/incentives/trainee-ledger`.

#### FR-DBT-003: Administrative Disbursement Authorization Workflow
- **Description:** Administrators review pending stipend balances, authorize bulk or individual disbursements, and record bank transaction references.
- **Primary Actor:** Administrator (`ROLE_ADMIN`).
- **Endpoint:** `POST /api/v1/incentives/disburse`.
- **Inputs:** `disbursementIds: [list]`, `bankPaymentReference` (string), `disbursementDate`.
- **Post-conditions:** Transitions ledger records from `PENDING` to `DISBURSED`. Trainee portals update immediately.

#### FR-DBT-004: Trainee Real-Time Earnings Dashboard
- **Description:** Trainees view their historical production contributions, accumulated earnings, pending stipend balance, and completed bank transfer records.
- **Primary Actor:** Trainee (`ROLE_TRAINEE`).
- **Endpoint:** `GET /api/v1/incentives/my-earnings`.

---

### MODULE 11: INSTITUTIONAL NOTICE BOARD & BROADCAST ENGINE

#### FR-NOT-001: Institutional Announcement Authoring
- **Description:** Authorized staff create bulletins with Title, Content, Priority Flag, and Target Audience.
- **Primary Actor:** Administrator (`ROLE_ADMIN`), Trainer (`ROLE_TRAINER`).
- **Endpoint:** `POST /api/v1/notices`.
- **Inputs:** `title` (string), `content` (string), `priority` (`URGENT`, `HIGH`, `NORMAL`), `targetRole` (`ALL`, `ROLE_TRAINEE`, `ROLE_TRAINER`, `ROLE_PRODUCTION_MANAGER`), `expiryDate`.

#### FR-NOT-002: Role-Targeted Notice Rendering
- **Description:** User consoles dynamically filter and display active bulletins relevant to the authenticated user's role.
- **Endpoint:** `GET /api/v1/notices/active`.

---

### MODULE 12: AI-POWERED PRODUCTION DEMAND FORECASTING

#### FR-AI-001: Ingestion of Historical Sales & Inventory Data
- **Description:** Extract time-series sales velocity, production batch logs, and dual-warehouse stock levels for algorithmic processing.
- **Endpoint:** `GET /api/v1/forecast/historical-feed`.

#### FR-AI-002: Time-Series Demand Projection
- **Description:** Compute 30-day predicted demand curves using Holt-Winters exponential smoothing and linear trend regressions.
- **Processing Logic:** Outputs predicted demand $\hat{Y}_{t+k}$ alongside upper and lower confidence intervals.

#### FR-AI-003: Reorder Point (ROP) & Batch Volume Heuristics
- **Description:** Generate recommended production batch sizes and raw material reorder points:
$$\text{ROP} = (\bar{d} \times L) + SS$$
where $\bar{d} = \text{Average Daily Demand}$, $L = \text{Lead Time (Days)}$, and $SS = \text{Safety Stock}$.

#### FR-AI-004: Interactive Decision-Support Visualizations
- **Description:** Render dynamic projection curves in `AIForecasting.jsx` using Recharts SVG components with toggleable comparison overlays.

---

### MODULE 13: PUBLIC INSTITUTIONAL SHOWCASE WEB PORTAL

#### FR-PUB-001: Unauthenticated Institutional Landing View
- **Description:** Render public institutional home page at `/` featuring KISS vocational mission, brand styling (Leaf Green `#48B859`, Royal Indigo `#2D3591`, Warm Gold `#fcb900`), and responsive layouts.

#### FR-PUB-002: Live Community Impact Statistics Counters
- **Description:** Display dynamic counters showcasing total trainees empowered, active trade workshops, and products crafted.

#### FR-PUB-003: Vocational Trade Catalog & Artisan Stories
- **Description:** Interactive showcase highlighting vocational tracks (Tailoring, Terracotta, Bamboo, Food Processing) with artisan photos, craft profiles, and impact testimonials.

#### FR-PUB-004: Prospective Admissions Inquiry Submission
- **Description:** Enable visitors and prospective trainees to submit admission inquiries with Name, Contact, Trade of Interest, and Message.
- **Validation:** Phone and email format validation; displays instant confirmation toast feedback.

#### FR-PUB-005: Contextual Session Bridge ("Back to Console")
- **Description:** The portal automatically inspects client state for an active JWT. If present, renders a prominent "Back to Console" CTA button that preserves session state and routes directly to the user's dashboard.

---

### MODULE 14: SYSTEM ADMINISTRATION & AUDITING

#### FR-ADM-001: Global Account Governance & Password Reset
- **Description:** Administrators can reset forgotten passwords, update user emails, and toggle account access status.
- **Endpoint:** `PUT /api/v1/admin/users/{id}/reset-password`.

#### FR-ADM-002: System Metric Reporting & Export Logs
- **Description:** Generate aggregated system reports covering attendance trends, production yields, sales revenues, and stipend disbursements with CSV/PDF export capability.

---

## 4. REQUIREMENTS TRACEABILITY MATRIX (RTM)

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
|                                                    REQUIREMENTS TRACEABILITY MATRIX (RTM)                                               |
+---------------+-----------------------------------+-----------------------------------+--------------------+----------------------------+
| Req ID        | Functional Requirement Title      | REST API Endpoint                 | Database Table     | Frontend Component View    |
+---------------+-----------------------------------+-----------------------------------+--------------------+----------------------------+
| FR-AUTH-001   | User Login & JWT Issuance         | POST /api/v1/auth/login           | users, roles       | LoginPage.jsx              |
| FR-AUTH-002   | Production Staff Registration     | POST /api/v1/auth/register-staff  | users, staff_prof  | LoginPage.jsx (Reg Tab)    |
| FR-AUTH-003   | Admin User Provisioning           | POST /api/v1/admin/users          | users              | AdminConsole.jsx           |
| FR-TRN-001    | Trainee Profile Governance        | GET,POST /api/v1/trainees         | trainee_profiles   | AdminConsole.jsx           |
| FR-TRN-002    | Trade & Cohort Allocation         | PUT /api/v1/trainees/{id}/cohort  | trainee_profiles   | AdminConsole.jsx           |
| FR-TRN-003    | Trainee Academic Progress         | GET /api/v1/academic/progress     | trainee_profiles   | TraineePortal.jsx          |
| FR-FAC-001    | Trainer Directory                 | GET,POST /api/v1/trainers         | trainer_profiles   | AdminConsole.jsx           |
| FR-FAC-002    | Syllabus Curriculum Definition    | GET,POST /api/v1/syllabus         | syllabus_modules   | TrainerConsole.jsx         |
| FR-ATT-001    | Batch Attendance Marking          | POST /api/v1/attendance/batch     | attendance_records | TrainerConsole.jsx         |
| FR-ATT-002    | Attendance Benchmark Analytics    | GET /api/v1/attendance/analytics  | attendance_records | TrainerConsole / Trainee   |
| FR-LEV-001    | Trainee Leave Application         | POST /api/v1/leaves/apply         | leave_requests     | TraineePortal.jsx          |
| FR-LEV-002    | Trainer Leave Review Drawer       | PUT /api/v1/leaves/{id}/review    | leave_requests     | TrainerConsole.jsx         |
| FR-ASM-001    | Assessment Milestone Definition   | POST /api/v1/assessments          | assessments        | TrainerConsole.jsx         |
| FR-ASM-002    | Practical Multi-Factor Grading    | POST /api/v1/assessments/grades   | assessment_grades  | TrainerConsole.jsx         |
| FR-CAT-001    | Product SKU Catalog Creation      | POST /api/v1/products             | products           | Admin / ProductionUnit     |
| FR-PRD-001    | Production Work Order Scheduler   | POST /api/v1/production/orders    | work_orders        | ProductionUnit.jsx         |
| FR-PRD-002    | BOM Raw Material Deduction        | POST /api/v1/production/bom-deduct| raw_materials      | ProductionUnit.jsx         |
| FR-PRD-003    | Quality Control (QC) Inspection   | POST /api/v1/production/qc        | qc_inspections     | ProductionUnit.jsx         |
| FR-PRD-004    | Trainee Unit Attribution          | POST /api/v1/production/attribute | work_order_contrib | ProductionUnit.jsx         |
| FR-WHS-001    | Warehouse 1 Raw Material Intake   | POST /api/v1/inventory/wh1        | raw_materials      | DualWarehouse.jsx          |
| FR-WHS-002    | Warehouse 1 Reorder Alert Engine  | GET /api/v1/inventory/wh1/alerts  | raw_materials      | DualWarehouse / Admin      |
| FR-WHS-003    | Warehouse 2 Finished Goods Intake | GET,POST /api/v1/inventory/wh2    | finished_goods     | DualWarehouse.jsx          |
| FR-POS-001    | POS Real-Time Catalog Search      | GET /api/v1/sales/pos/search      | finished_goods     | SalesPOS.jsx               |
| FR-POS-002    | POS Dynamic Shopping Cart         | Client-Side React Engine          | Session State      | SalesPOS.jsx               |
| FR-POS-003    | Tax (GST) & Discount Engine       | Client/Server Calculation         | Session State      | SalesPOS.jsx               |
| FR-POS-004    | Multi-Tender Payment Acceptance    | POST /api/v1/sales/pos/checkout   | sales_transactions | SalesPOS.jsx               |
| FR-POS-005    | Invoice Receipt & Stock Deduction  | POST /api/v1/sales/pos/checkout   | finished_goods     | SalesPOS.jsx               |
| FR-DBT-001    | Output-Linked EWYL Stipend Accrual | Calculated On QC Pass             | stipend_ledger     | IncentiveController.java   |
| FR-DBT-002    | Direct Benefit Transfer Ledger     | GET /api/v1/incentives/ledger     | stipend_ledger     | AdminConsole.jsx           |
| FR-DBT-003    | Stipend Disbursement Workflow      | POST /api/v1/incentives/disburse  | stipend_ledger     | AdminConsole.jsx           |
| FR-DBT-004    | Trainee Earnings Dashboard         | GET /api/v1/incentives/my-earnings| stipend_ledger     | TraineePortal.jsx          |
| FR-NOT-001    | Institutional Notice Authoring     | POST /api/v1/notices              | notices            | AdminConsole.jsx           |
| FR-NOT-002    | Role-Targeted Notice Rendering     | GET /api/v1/notices/active        | notices            | All User Consoles          |
| FR-AI-001     | Historical Data Extraction         | GET /api/v1/forecast/feed         | sales, production  | ForecastController.java    |
| FR-AI-002     | Demand Curve Projections           | GET /api/v1/forecast/projections  | Generated In-Memory| AIForecasting.jsx          |
| FR-PUB-001    | Public Showcase Landing View       | GET /                             | Static Assets      | HomePage.jsx               |
| FR-PUB-002    | Live Community Impact Counters     | GET /api/v1/public/metrics        | Aggregated Counts  | HomePage.jsx               |
| FR-PUB-005    | Contextual Session Bridge          | Client JWT Evaluation             | Local Storage      | HomePage.jsx               |
+---------------+-----------------------------------+-----------------------------------+--------------------+----------------------------+
```

---

## 5. BUSINESS RULES & DATA VALIDATION CRITERIA

```
+----------------------------------------------------------------------------------------------------+
|                                    BUSINESS RULES & VALIDATION MATRIX                              |
+-------------+-----------------------------+--------------------------------------------------------+
| Rule ID     | Domain                      | Concrete Validation Rule & System Enforcement          |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-001  | Authentication              | Username: 4-30 chars, alphanumeric. Password: Min 6   |
|             |                             | chars. Passwords stored solely as BCrypt hashes.       |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-002  | Production Staff Reg        | Email must follow standard RFC 5322 format. Username  |
|             |                             | and email must be globally unique across database.     |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-003  | Attendance Benchmark        | Trainee attendance rate calculated per cohort session. |
|             |                             | Rate < 75% raises automatic warning indicator.         |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-004  | Leave Applications          | StartDate <= EndDate. StartDate >= CurrentDate. Cannot |
|             |                             | apply for overlapping date intervals.                  |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-005  | Leave Reconciliation        | Approved leave dates automatically recorded as EXCUSED |
|             |                             | in attendance, bypassing absence penalty calculation.  |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-006  | Work Order Launch           | Work orders require verified BOM recipe. Launch blocks |
|             |                             | if Warehouse 1 raw material stock is insufficient.     |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-007  | QC Inspection Balance       | PassedQuantity + RejectedQuantity == TargetQuantity.   |
|             |                             | Only PassedQuantity transfers to Warehouse 2 stock.    |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-008  | POS Stock Integrity         | POS line-item quantity cannot exceed available stock   |
|             |                             | in Warehouse 2. Zero or negative stock sales blocked.  |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-009  | POS Atomic Checkout         | POS invoice creation, payment recording, and Warehouse |
|             |                             | 2 stock decrement must execute in single transaction.  |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-010  | EWYL Stipend Entitlement    | Stipend earned strictly on PassedQuantity crafts. No   |
|             |                             | stipends awarded for rejected or defective units.      |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-011  | DBT Disbursement Record     | Disbursal requires non-blank bank transaction reference|
|             |                             | number. Ledger status transitions PENDING -> DISBURSED.|
+-------------+-----------------------------+--------------------------------------------------------+
| BR-VAL-012  | Institutional Notices       | Priority flags: URGENT, HIGH, NORMAL. Expired notices   |
|             |                             | are filtered out automatically from user dashboards.   |
+-------------+-----------------------------+--------------------------------------------------------+
```

---

## 6. SIGN-OFF & APPROVAL

This document represents the complete, verified functional specification of the KISS Vocational Training Management System as implemented in the software release.

**Prepared By:** Mansi Sinha  
**Signature:** __________________________  
**Date:** October 7, 2026  

**Faculty / Academic Guide Review:**  
**Name:** __________________________  
**Designation:** School of Computer Science & Engineering, KIIT  
**Signature:** __________________________  
**Date:** __________________________  
