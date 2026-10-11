# USER ROLES AND RESPONSIBILITIES SPECIFICATION (URRD)
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-URRD-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Initial System Specification)  
**Date:** October 7, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. DOCUMENT CONTROL & EXECUTIVE OVERVIEW

### 1.1 Purpose of the Document
This User Roles and Responsibilities Document (URRD) establishes the authoritative operational framework, organizational personas, access scopes, permission hierarchies, duty boundaries, handoff protocols, and governance policies governing the **KISS Vocational Training Management System (KV-TMS)**.

In an integrated enterprise software environment spanning academic vocational training, shop-floor manufacturing, supply chain logistics, retail Point of Sale (POS) commerce, and Direct Benefit Transfer (DBT) student stipends, clearly defined user roles and strict Segregation of Duties (SoD) are vital. This document provides a granular operational blueprint defining:
- The exact profile, objectives, and dedicated workspace consoles for each user class.
- The precise CRUD (Create, Read, Update, Delete) permissions across all system entities.
- The cross-functional operational handoffs linking trainers, students, workshop managers, and administrators.
- The security constraints and conflict-of-interest prevention rules enforced by the system.

### 1.2 System Scope & Institutional Context
Kalinga Institute of Social Sciences (KISS) empowers over 30,000 indigenous students through holistic education and vocational skill building. KV-TMS digitizes this ecosystem, connecting academic learning with commercial workshop fabrication (Apparels & Tailoring, Terracotta & Pottery, Bamboo & Handicrafts, Food Processing, and Allied Trades). 

To ensure financial transparency, student welfare, inventory accuracy, and smooth workshop operations, KV-TMS divides all user interactions across five strictly governed personas:
1. **System Administrator (`ROLE_ADMIN`)**
2. **Trainer / Faculty Member (`ROLE_TRAINER`)**
3. **Production Manager / Workshop Staff (`ROLE_PRODUCTION_MANAGER`)**
4. **Trainee / Vocational Student (`ROLE_TRAINEE`)**
5. **Public Visitor / Prospective Applicant (`ROLE_PUBLIC`)**

---

## 2. ORGANIZATIONAL PERSONAS & ROLE PROFILES

```
+---------------------------------------------------------------------------------------------------------+
|                                    USER PERSONA & CONSOLE HIERARCHY                                     |
+--------------------------+-----------------------+-----------------------+------------------------------+
| Role Name                | Authority Identifier  | Primary Console View  | Primary Functional Domain    |
+--------------------------+-----------------------+-----------------------+------------------------------+
| System Administrator     | ROLE_ADMIN            | AdminConsole.jsx      | Governance, POS, DBT, Audits |
| Trainer / Faculty        | ROLE_TRAINER          | TrainerConsole.jsx    | Curriculum, Attendance, Eval |
| Production Manager       | ROLE_PRODUCTION_      | ProductionUnit.jsx    | Work Orders, BOM, QC, Yield  |
| / Workshop Staff         | MANAGER               |                       |                              |
| Trainee / Student        | ROLE_TRAINEE          | TraineePortal.jsx     | Learning, Leaves, EWYL / DBT |
| Public Visitor           | ROLE_PUBLIC           | HomePage.jsx          | Showcase, Admissions, Bridge |
+--------------------------+-----------------------+-----------------------+------------------------------+
```

---

### PERSONA 1: SYSTEM ADMINISTRATOR (`ROLE_ADMIN`)

#### 1.1 Role Overview & Identity
- **Primary Objective:** Ensure continuous, secure, and accurate operation of the KV-TMS enterprise platform across academic, commercial, logistics, and financial domains.
- **User Demographics:** Central institutional administrators, IT coordinators, and vocational department heads at KISS.
- **Dedicated Console:** `AdminConsole.jsx` (accessible at `/admin`).

#### 1.2 Access Scope & Route Clearance
- **Cleared Routes:** Full access to all authenticated routes: `/admin`, `/inventory`, `/pos`, `/forecast`, `/production`.
- **Restricted Actions:** Administrative users cannot falsify practical academic grades without trainer attribution, nor bypass physical QC verification logs.
- **Authentication:** Authenticates via `POST /api/v1/auth/login` receiving signed JWT with `ROLE_ADMIN` authority claim.

#### 1.3 Core Responsibilities & Daily Tasks
- **User Account Governance:** Provision, maintain, and deactivate user accounts for Trainees, Trainers, and Production Staff. Manage role allocations and temporary password resets.
- **Trade Curriculum Catalog:** Configure active vocational trade tracks, durations, and competency standards.
- **Dual-Warehouse Governance:** Oversee inventory balances across Warehouse 1 (Raw Materials Depot) and Warehouse 2 (Finished Goods Hub); review low-stock reorder alerts.
- **Point of Sale (POS) Retail Administration:** Manage retail checkout transactions, inspect cashier shift reports, review tax (GST) receipts, and monitor store revenue.
- **Direct Benefit Transfer (DBT) Authorization:** Review verified trainee production stipends under the Earn While You Learn program; authorize financial disbursements and record bank transaction reference numbers.
- **Institutional Notice Board:** Publish campus-wide and role-targeted official announcements with priority indicators (`URGENT`, `HIGH`, `NORMAL`).
- **AI Forecasting & Planning:** Inspect 30-day algorithmic demand projections to guide institutional raw material purchasing and production volume planning.

---

### PERSONA 2: TRAINER / FACULTY MEMBER (`ROLE_TRAINER`)

#### 2.1 Role Overview & Identity
- **Primary Objective:** Deliver practical vocational education, administer syllabus competencies, monitor daily cohort attendance, evaluate craftsmanship, and review trainee leaves.
- **User Demographics:** Expert vocational instructors, master artisans, and faculty members across tailoring, ceramics, bamboo craft, and food technology.
- **Dedicated Console:** `TrainerConsole.jsx` (accessible at `/trainer`).

#### 2.2 Access Scope & Route Clearance
- **Cleared Routes:** `/trainer`, `/academic`, personal profile views.
- **Restricted Routes:** Blocked from POS retail checkout, financial DBT bank disbarments, and global system user management (`HTTP 403 Forbidden`).
- **Authentication:** Authenticates via `POST /api/v1/auth/login` receiving signed JWT with `ROLE_TRAINER` authority claim.

#### 2.3 Core Responsibilities & Daily Tasks
- **Curriculum & Syllabus Administration:** Structure trade courses into progressive theory and practical modules, tracking completed hours and learning outcomes.
- **Daily Batch Attendance Logging:** Mark daily cohort attendance for all enrolled trainees (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- **Attendance Benchmark Monitoring:** Monitor cohort attendance rates; identify students falling below the mandatory $75\%$ attendance threshold.
- **Trainee Leave Review Drawer:** Review pending student leave applications; approve or reject requests with feedback remarks. Approved leaves automatically log as excused in attendance.
- **Practical Competency Evaluation:** Conduct practical craftsmanship assessments; record numerical scores, qualitative feedback, and 1-to-5 star skill ratings on trainee digital report cards.
- **Academic Bulletins:** Publish trade-specific notices for enrolled cohort students.

---

### PERSONA 3: PRODUCTION MANAGER / WORKSHOP STAFF (`ROLE_PRODUCTION_MANAGER`)

#### 3.1 Role Overview & Identity
- **Primary Objective:** Oversee shop-floor manufacturing runs, allocate machines and batches, log raw material Bill of Materials (BOM) consumption, enforce Quality Control (QC), and attribute verified outputs to student artisans.
- **User Demographics:** Workshop supervisors, shop-floor engineers, production foremen, and artisan workshop leads.
- **Dedicated Console:** `ProductionUnit.jsx` (accessible at `/production`).

#### 3.2 Access Scope & Route Clearance
- **Cleared Routes:** `/production`, `/inventory` (Warehouse 1 requisition and Warehouse 2 handoff).
- **Self-Registration Gateway:** Self-registers via `POST /api/v1/auth/register-production-staff` at `LoginPage.jsx`.
- **Restricted Routes:** Blocked from academic grading, student leave approvals, and bank disbursement execution (`HTTP 403 Forbidden`).

#### 3.3 Core Responsibilities & Daily Tasks
- **Work-Order Scheduling:** Create and monitor manufacturing work orders specifying target quantities, product SKUs, batch lot numbers, machine allocations, and deadlines.
- **Bill of Materials (BOM) Requisition:** Trigger automatic calculation and deduction of raw materials from Warehouse 1 upon launching work orders.
- **Shop-Floor Run Monitoring:** Supervise active batch manufacturing, machine operational status, and student hands-on participation.
- **Quality Control (QC) Inspection:** Execute formal inspections on finished batches, segregating Passed Quantity from Rejected Quantity and recording defect remarks.
- **Warehouse 2 Finished Goods Transfer:** Transfer QC-approved units directly into Warehouse 2 (Finished Goods Hub) inventory with SKU barcodes.
- **Trainee Output Attribution:** Log verified units crafted per student artisan, feeding directly into the Earn While You Learn (DBT) incentive calculation engine.

---

### PERSONA 4: TRAINEE / VOCATIONAL STUDENT (`ROLE_TRAINEE`)

#### 4.1 Role Overview & Identity
- **Primary Objective:** Acquire hands-on vocational skills, track curriculum progression, maintain attendance benchmarks, participate in workshop production, and earn monetary stipends under the Earn While You Learn program.
- **User Demographics:** Indigenous vocational students and apprentices enrolled at KISS.
- **Dedicated Console:** `TraineePortal.jsx` (accessible at `/portal`).

#### 4.2 Access Scope & Route Clearance
- **Cleared Routes:** `/portal`, personal profile, my-attendance, my-leaves, my-grades, my-earnings.
- **Restricted Routes:** Strictly blocked from editing attendance, approving leaves, modifying inventory, launching work orders, or inspecting other trainees' PII data.
- **Authentication:** Authenticates via `POST /api/v1/auth/login` receiving signed JWT with `ROLE_TRAINEE` authority claim.

#### 4.3 Core Responsibilities & Daily Tasks
- **Academic Curriculum Tracking:** Inspect personal trade syllabus, module completion milestones, and upcoming training sessions.
- **Attendance Self-Monitoring:** Track personal attendance percentages in real time to ensure compliance with the $75\%$ benchmark.
- **Leave Application Submission:** Submit formal leave requests with start/end dates, categorical justifications (Medical, Personal, Academic), and explanatory reasons.
- **Competency Scorecard Review:** Review practical evaluation marks, skill star ratings, and craftsmanship remarks assigned by faculty.
- **Earn While You Learn (EWYL) Tracking:** Track personal verified craft output units, accrued piece-rate stipend balance, and completed Direct Benefit Transfer (DBT) bank disbursements.
- **Institutional Bulletins:** View official notices and trade alerts published by faculty and administrators.

---

### PERSONA 5: PUBLIC VISITOR / PROSPECTIVE APPLICANT (`ROLE_PUBLIC`)

#### 5.1 Role Overview & Identity
- **Primary Objective:** Explore KISS vocational initiatives, inspect verified community impact metrics, review available trade tracks, read artisan success narratives, and submit admission inquiries.
- **User Demographics:** Prospective students, tribal community members, partner organizations, government delegates, and general visitors.
- **Dedicated Interface:** `HomePage.jsx` (accessible at `/`).

#### 5.2 Access Scope & Route Clearance
- **Cleared Routes:** Public landing page (`/`), public trade directory, artisan spotlight, admissions contact gateway.
- **Restricted Routes:** All internal `/api/v1/*` transactional endpoints require authentication; direct access attempts redirect to `/login`.
- **Session Bridge:** If the user has an active JWT token stored in browser memory, the public interface presents a prominent "Back to Console" CTA button that returns them to their authenticated workspace without re-login.

#### 5.3 Core Responsibilities & Community Capabilities
- **Institutional Showcase Exploration:** Learn about the history, vision, and mission of KISS vocational training.
- **Impact Metrics Verification:** Inspect verified dynamic counters (total trainees empowered, active trade tracks, craft products produced).
- **Trade Catalog Exploration:** Browse vocational offerings across Apparels & Tailoring, Terracotta Pottery, Bamboo Crafts, and Food Processing.
- **Artisan Narrative Inspection:** Review featured trainee profiles, handcrafted products, and sustainable livelihoods stories.
- **Admissions Inquiry Submission:** Submit prospective student applications with name, contact details, trade preference, and inquiry messages.

---

## 3. GRANULAR CRUD PERMISSIONS MATRIX (MASTER ACCESS CONTROL LIST)

```
+-------------------------------------------------------------------------------------------------------------------------------+
|                                      MASTER ENTITY CRUD PERMISSIONS MATRIX                                                    |
+------------------------------+-------------------+-------------------+-----------------------+-------------------+------------+
| Entity / Functional Domain   | Administrator     | Trainer / Faculty | Production Manager    | Trainee / Student | Public User|
+------------------------------+-------------------+-------------------+-----------------------+-------------------+------------+
| User Accounts & Credentials  | Full Control      | No Access         | Self-Registration     | View Self         | No Access  |
| Trainee Profiles & Demography| Full Control      | View Assigned     | View Workshop Assigned| View Self         | No Access  |
| Trainer Profiles & Specialty | Full Control      | View / Edit Self  | View Directory        | View Assigned     | View Roster|
| Vocational Trades & Syllabi  | Full Control      | Create / Edit Own | View Reference        | View Enrolled     | View Catalog
| Daily Cohort Attendance      | Full Control      | Create / Edit Own | View Workshop         | View Self         | No Access  |
| Trainee Leave Requests       | Full Control      | Review & Approve  | View Workshop         | Create / View Self| No Access  |
| Competency Marks & Grading   | Full Control      | Create / Edit Own | No Access             | View Self         | No Access  |
| Product Master Catalog & SKUs| Full Control      | View Reference    | Create / Edit Catalog | View Catalog      | View Catalog
| Production Work Orders       | Full Control      | View Reference    | Create / Manage Batch | View Assigned Run | No Access  |
| Quality Control (QC) Checks  | Full Control      | No Access         | Create / Verify QC    | No Access         | No Access  |
| Warehouse 1 (Raw Materials)  | Full Control      | View Reference    | Requisition / Intake  | No Access         | No Access  |
| Warehouse 2 (Finished Goods) | Full Control      | View Reference    | QC Intake Transfer    | No Access         | No Access  |
| POS Sales & Retail Invoicing | Full Control      | No Access         | No Access             | No Access         | No Access  |
| EWYL / DBT Stipend Ledgers   | Approve & Disburse| View Cohort Report| Verify Crafted Units  | View Self Earnings| No Access  |
| Institutional Notice Board   | Full Control      | Create Trade Alert| Create Workshop Alert | View Targeted     | No Access  |
| AI Demand Forecasting Studio | Full Control      | View Summary      | View Batch Projection | No Access         | No Access  |
| Admissions Inquiries         | Full Control      | View Trade Inbound| No Access             | No Access         | Create     |
+------------------------------+-------------------+-------------------+-----------------------+-------------------+------------+
```

*Legend: **Full Control** (Create, Read, Update, Delete), **No Access** (Endpoint blocked with HTTP 403 Forbidden).*

---

## 4. CROSS-FUNCTIONAL OPERATIONAL HANDOFF PROTOCOLS

The five user roles interact through structured, closed-loop operational handoffs:

```
+---------------------------------------------------------------------------------------------------------+
|                                    OPERATIONAL HANDOFF WORKFLOWS                                        |
+---------------------------------------------------------------------------------------------------------+
```

### WORKFLOW 1: Academic Enrollment & Batch Allocation
1. **Public Visitor** explores trade tracks on `HomePage.jsx` and submits an admission inquiry.
2. **Administrator** reviews the application in `AdminConsole.jsx`, verifies eligibility, creates the `TraineeProfile`, and assigns the student to a specific trade track (e.g. Apparels & Tailoring) and cohort batch.
3. **Trainer** receives the newly enrolled trainee on their cohort roster in `TrainerConsole.jsx`.
4. **Trainee** logs into `TraineePortal.jsx` to view their curriculum syllabus, schedule, and trainer contact information.

### WORKFLOW 2: Attendance, Leave & Excused Absence Reconciliation
1. **Trainer** marks daily cohort attendance on `TrainerConsole.jsx`.
2. **Trainee** monitors attendance percentage on `TraineePortal.jsx`. If sick or traveling, submits a formal leave application specifying date range and reason.
3. **Trainer** receives a pending badge in their leave review drawer, assesses justification, and marks the request `APPROVED`.
4. **System Attendance Engine** automatically converts the specified dates to `EXCUSED` status, preserving student compliance benchmarks.

### WORKFLOW 3: Production Run, BOM Requisition & Quality Control
1. **Production Manager** creates a scheduled work order for 100 shirts in `ProductionUnit.jsx`.
2. **System BOM Engine** computes fabric, button, and thread requirements and atomically checks and deducts stock from Warehouse 1 (Raw Materials Depot).
3. **Trainees** participate in shop-floor cutting and stitching under workshop supervision.
4. **Production Manager** conducts Quality Control (QC) inspection upon completion, logging 95 Passed and 5 Rejected units.
5. **Warehouse 2 Hub** receives the 95 approved shirts with generated SKU barcodes ready for sale.

### WORKFLOW 4: Earn While You Learn (DBT) Stipend Disbursal
1. **Production Manager** attributes the 95 approved shirts to participating trainees (e.g., Trainee A: 20 units).
2. **System Calculation Engine** multiplies verified units by approved piece rate ($20 \text{ units} \times ₹25 = ₹500$) and records the entitlement in the `TraineeStipendLedger` as `PENDING`.
3. **Administrator** reviews accrued ledger balances in `AdminConsole.jsx`, authorizes bulk or individual disbursement, and enters the bank transaction reference number.
4. **Trainee** receives real-time balance update on `TraineePortal.jsx` reflecting status `DISBURSED` with transaction date and reference.

### WORKFLOW 5: Point of Sale (POS) Retail Commercialization
1. **Administrator / Cashier** searches products by SKU or barcode on `SalesPOS.jsx`.
2. Adds items to cart, applies tax (GST), and selects customer payment tender (Cash, UPI QR, or Card).
3. On transaction confirmation, the system generates invoice `INV-YYYYMMDD-XXXX`, prints digital receipt, and atomically decrements finished stock from Warehouse 2.
4. **AI Forecasting Module** ingests the sales transaction record to update demand curves and reorder alerts.

---

## 5. SEGREGATION OF DUTIES (SOD) & CONFLICT-OF-INTEREST RULES

To maintain financial integrity, student safety, and operational credibility, the system strictly enforces the following non-bypassable constraints:

- **Rule SoD-01 (No Student Self-Grading):** Trainees cannot evaluate themselves, mark their own attendance, or approve their own leave applications.
- **Rule SoD-02 (No Self-Certified Quality Control):** Trainees participating in manufacturing runs cannot perform the official Quality Control (QC) inspection on their own batches; QC must be conducted by a Production Manager.
- **Rule SoD-03 (Financial Disbursal Separation):** Production Managers who verify manufacturing quantities cannot disburse financial bank payments. Final DBT authorization is strictly restricted to System Administrators.
- **Rule SoD-04 (Zero Stock POS Prevention):** Retail store cashiers cannot process POS sales for items that are not in stock in Warehouse 2 (`availableStock >= qtySold`). Negative inventory transactions are strictly rejected.
- **Rule SoD-05 (Immutable Financial History):** Completed DBT stipend records and POS sales receipts cannot be deleted or overwritten by any user, including administrators. Corrections must be handled via audited compensatory transactions.

---

## 6. SIGN-OFF & VERIFICATION

This User Roles and Responsibilities Document represents the verified operational specification of the KISS Vocational Training Management System (KV-TMS) as implemented.

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 7, 2026  

**Faculty Guide Review:**  
**Name & Designation:** School of Computer Science & Engineering, KIIT  
**Signature:** ____________________________  
**Date:** ____________________________  
