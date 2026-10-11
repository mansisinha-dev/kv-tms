# UML ACTIVITY DIAGRAM SPECIFICATION
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-ACT-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Procedural Workflow Model)  
**Date:** October 8, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. INTRODUCTION & BUSINESS PROCESS ARCHITECTURE

### 1.1 Purpose of Procedural Activity Diagrams
The **UML Activity Diagram Specification** models the procedural control flows, business logic branching, parallel task concurrency, decision guards, and lifecycle end states governing the **KV-TMS** platform.

Activity diagrams serve as formal behavioral flowcharts detailing **how data transitions from state to state** across human actors, application micro-services, and database layers &mdash; providing clarity on edge cases, validation rejections, parallel synchronization, and transaction commits.

### 1.2 Multi-Tier Swimlane Partitioning
Each activity workflow is visually segregated across three operational swimlanes:
1. **Client / Actor Swimlane (React 19 SPA):** Captures user triggers, form inputs, local state mutations, and presentation views.
2. **Business Engine Swimlane (Spring Boot Service):** Enforces transaction orchestration, mathematical algorithms, role permissions, and validation logic.
3. **Persistence & External Gateway Swimlane (PostgreSQL / PFMS):** Handles atomic ACID storage, pessimistic locks (`FOR UPDATE`), and external banking communications.

---

## 2. ACTIVITY 01: USER AUTHENTICATION & ROLE-BASED NAVIGATION

Models the step-by-step security workflow from login submission to credential verification, token issuance, and dashboard routing:

![Activity Diagram 01: User Authentication](KV-TMS%20Activity%2001%20-%20Authentication.png)  
*Figure 2.1: KV-TMS Activity Diagram 01 — User Authentication & Role-Based Navigation*

### Procedural Workflow Catalog

| Node | Responsible Swimlane | Action State / Decision Guard | Operational Logic & State Transition |
| :---: | :--- | :--- | :--- |
| **Start** | 1. Client / User (React) | Initial Trigger Node | User accesses KV-TMS web application login page (`/login`). |
| **Act-1** | 1. Client / User (React) | Enter Credentials &rarr; Submit | Captures username and password; client runs non-empty field validation. |
| **Act-2** | 2. Security & Auth Service | Sanitize & Validate Input | Intersects payload via Spring Security filter; guards against SQL injection / XSS. |
| **Dec-1** | 3. Persistence (PostgreSQL) | `[User Exists?]` | Queries `users` table. If No &rarr; logs failure, throws 401, displays error banner, and terminates. |
| **Act-3** | 2. Security & Auth Service | Verify BCrypt Password | Applies BCrypt hashing with salt. Checks match against persisted password hash. |
| **Dec-2** | 2. Security & Auth Service | `[Password Match?]` | If No &rarr; logs bad credentials, returns 401 error. If Yes &rarr; generates signed JWT token. |
| **Final** | 1. Client / User (React) | Store JWT &rarr; Role Redirection | Stores token in LocalStorage; routes user to assigned dashboard (Admin, Faculty, Trainee, PM). |

---

## 3. ACTIVITY 02: DAILY ATTENDANCE MARKING & 75% STATUTORY COMPLIANCE

Models cohort batch marking, concurrent persistence, cumulative percentage computation, and statutory compliance alert generation:

![Activity Diagram 02: Attendance](KV-TMS%20Activity%2002%20-%20Attendance.png)  
*Figure 3.1: KV-TMS Activity Diagram 02 — Attendance Marking & 75% Statutory Compliance Rule*

### Procedural Workflow Catalog

| Node | Responsible Swimlane | Action State / Decision Guard | Operational Logic & State Transition |
| :---: | :--- | :--- | :--- |
| **Start** | 1. Trainer / Faculty | Select Trade Cohort & Date | Loads active vocational trade student roster for scheduled workshop session. |
| **Act-1** | 1. Trainer / Faculty | Mark Status &rarr; Submit Batch | Marks Present, Absent, or Leave for each trainee; submits batch payload to backend API. |
| **Fork** | 2. Attendance Engine | Parallel Fork Bar (&HorizontalLine;) | Splits execution into two concurrent operations: persistence and statistical calculation. |
| **Branch A** | 3. Database & Notifications | Insert Attendance Records | Persists immutable daily records into PostgreSQL `attendance_records` table. |
| **Branch B** | 2. Attendance Engine | Compute Cumulative % | Calculates `(attendedCount / totalSessions) * 100` across current vocational semester. |
| **Dec-1** | 2. Attendance Engine | `[Attendance < 75%?]` | Evaluates statutory certification floor. If &ge; 75% &rarr; bypasses alert; if &lt; 75% &rarr; flags `is_at_risk=true`. |
| **Final** | 1. Trainer / Faculty | Render Submission Toast | Returns 200 OK summary; React UI highlights at-risk students with Amber compliance badges. |

---

## 4. ACTIVITY 03: WORKSHOP PRODUCTION WORK ORDER & DUAL-WAREHOUSE LIFECYCLE

Models BOM raw stock reservation from Warehouse 1, artisan workshop run, multi-point QC audit, and WH-2 finished goods transfer:

![Activity Diagram 03: Production](KV-TMS%20Activity%2003%20-%20Production.png)  
*Figure 4.1: KV-TMS Activity Diagram 03 — Production Work Order & Dual-Warehouse Lifecycle*

### Procedural Workflow Catalog

| Node | Responsible Swimlane | Action State / Decision Guard | Operational Logic & State Transition |
| :---: | :--- | :--- | :--- |
| **Start** | 1. Production Manager | Launch Work Order | Supervisor specifies craft SKU (e.g. Tribal Shawl), target batch (50), and BOM recipe. |
| **Dec-1** | 2. Production Engine | `[Raw Stock Sufficient?]` | Checks WH-1 inventory. If No &rarr; aborts and flags procurement alert; if Yes &rarr; deducts raw stock. |
| **Act-1** | 3. Workshop Artisans | Fabricate Workshop Batch | Student artisans execute craft job on workshop looms and workstations. |
| **Act-2** | 3. Workshop Artisans & QC | Conduct QC Inspection Audit | Audits 50 fabricated units against craftsmanship standards (Pass=48, Reject=2). |
| **Fork** | 3. Workshop Artisans & QC | Parallel Fork Bar (&HorizontalLine;) | Splits handling between passed commercial units and rejected defect scrap. |
| **Branch A** | 2. Production Engine | WH-2 Intake & EWYL Accrual | Increments Warehouse 2 (+48 finished goods); accrues piece-rate stipend in DBT ledger. |
| **Final** | 1. Production Manager | Close Work Order & Refresh UI | Updates order status to `COMPLETED`; refreshes real-time dual-warehouse inventory widgets. |

---

## 5. ACTIVITY 04: BARCODE POS RETAIL SALE & REAL-TIME STOCK DECREMENT

Models barcode checkout, pessimistic stock verification, GST tax calculation, sequential invoicing, and AI velocity feeds:

![Activity Diagram 04: POS Retail](KV-TMS%20Activity%2004%20-%20POS%20Retail.png)  
*Figure 5.1: KV-TMS Activity Diagram 04 — Barcode POS Retail Sale & Real-Time Stock Decrement*

### Procedural Workflow Catalog

| Node | Responsible Swimlane | Action State / Decision Guard | Operational Logic & State Transition |
| :---: | :--- | :--- | :--- |
| **Start** | 1. Cashier / Buyer (POS) | Scan Barcode on SKU | Cashier scans barcode (`BAR-SHAWL-01`) on finished handicraft item. |
| **Dec-1** | 3. Database & Async Feeds | `[Stock Available?]` | Queries WH-2 catalog. If No &rarr; displays out-of-stock alert; if Yes &rarr; adds item to cart. |
| **Act-1** | 1. Cashier / Buyer (POS) | Collect Payment Tender | Collects customer tender (UPI, Card, Cash); submits checkout request. |
| **Act-2** | 2. POS Checkout Engine | Pessimistic Lock & Decrement | Acquires `SELECT ... FOR UPDATE` lock; atomically decrements WH-2 stock balance. |
| **Act-3** | 2. POS Checkout Engine | Taxes & Sequential Invoicing | Computes 5% handloom GST; mints sequential tax invoice (`INV-20261008-0142`). |
| **Fork** | 3. Database & Async Feeds | Parallel Fork Bar (&HorizontalLine;) | Triggers thermal receipt printing while asynchronously dispatching `SaleCompletedEvent`. |
| **Final** | 1. Cashier / Buyer (POS) | Clear Register & Open Drawer | Concludes transaction with 201 Created response; resets cash register for next patron. |

---

## 6. ACTIVITY 05: AI DEMAND FORECASTING ENGINE & EWYL DIRECT BENEFIT TRANSFER

Models Holt-Winters triple exponential demand projections, auto-reorder thresholds, and PFMS/NPCI stipend payouts:

![Activity Diagram 05: AI & DBT](KV-TMS%20Activity%2005%20-%20AI%20Forecasting%20&%20DBT.png)  
*Figure 6.1: KV-TMS Activity Diagram 05 — AI Demand Forecasting Engine & EWYL DBT Payout*

### Procedural Workflow Catalog

| Node | Responsible Swimlane | Action State / Decision Guard | Operational Logic & State Transition |
| :---: | :--- | :--- | :--- |
| **Fork** | 1. Admin / PM | Operational Sub-Workflows | Parallel split into Workflow A (AI Demand Forecasting) and Workflow B (EWYL DBT Payout). |
| **AI-1** | 2. AI Forecasting Core | Ingest 90-Day Sales Velocity | Extracts daily POS transaction volume vector for targeted craft SKU. |
| **AI-2** | 2. AI Forecasting Core | Holt-Winters Smoothing | Calculates level (&alpha;), trend (&beta;), and seasonality (&gamma;); outputs 30-day projected curve. |
| **AI-3** | 2. AI Forecasting Core | Calculate Safety Stock & ROP | Computes Reorder Point ($ROP = (d \times L) + SS = 85$ units). If stock &le; ROP &rarr; flags reorder. |
| **DBT-1** | 1. Admin / PM | Authorize Batch Payout | Admin audits verified piece-rate ledgers; clicks "Pay Batch" (Rs. 1,85,000 for 120 trainees). |
| **DBT-2** | 3. Banking Gateway | Execute DBT Transfer | Submits payment payload to PFMS/NPCI; receives banking UTR; marks ledgers `DISBURSED`. |
| **Final** | 1. Admin / PM | Render Success & Push Alert | Displays payout summary; dispatches in-app credit push alerts to Trainee Passbooks. |

---

## 7. SPECIFICATION VERIFICATION & SIGN-OFF

This Activity Diagram Specification accurately reflects the procedural control workflows and decision logic of the KISS Vocational Training Management System (KV-TMS).

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 8, 2026  

**Faculty Guide Review:**  
**Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Signature:** ____________________________  
**Date:** ____________________________  
