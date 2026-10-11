# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-BRD-v1.0  
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
This Business Requirements Document (BRD) defines the foundational strategic objectives, institutional rationale, business problems, target outcomes, operational workflows, business rules, and value propositions of the **KISS Vocational Training Management System (KV-TMS)**.

While subsequent technical specifications (SRS, FRD, NFRD) detail the software's functional and architectural mechanics, this document articulates the **business vision and organizational value**. It defines why the system exists, what institutional challenges it overcomes, how it transforms vocational education into a sustainable social enterprise, and how success is measured through concrete Key Performance Indicators (KPIs).

### 1.2 Institutional Context & Vision
Kalinga Institute of Social Sciences (KISS) is the world's largest residential academic institution dedicated exclusively to indigenous (tribal) children, providing free education, accommodation, healthcare, and vocational training to over 30,000 students.

Vocational training at KISS is not a detached classroom exercise; it is an active bridge to livelihood generation and financial dignity. Students acquire specialized, market-relevant trades—including Apparels & Tailoring, Terracotta & Pottery, Bamboo & Handicrafts, Food Processing, and Allied Trades—under master craftsmen. 

KV-TMS transforms this ecosystem by establishing a closed-loop digital pipeline:
$$\text{Skill Training} \longrightarrow \text{Workshop Production} \longrightarrow \text{Dual-Warehouse Supply Chain} \longrightarrow \text{POS Retail Sales} \longrightarrow \text{Earn While Learn (DBT) Stipends} \longrightarrow \text{AI Demand Planning}$$

---

## 2. BUSINESS PROBLEM STATEMENT & CURRENT STATE ANALYSIS

### 2.1 The Legacy Challenge ("As-Is" State)
Prior to the implementation of KV-TMS, vocational training, workshop operations, material stocking, and retail sales were administered through manual paper logbooks and disconnected spreadsheets. This created critical business friction points:

1. **Disconnected Training and Production Records:** Academic attendance records had zero linkage to workshop fabrication. It was impossible to determine which trainee crafted which finished good.
2. **Untracked Material Shrinkage & Reorder Failures:** Workshop supervisors lacked visibility into raw material inventory in real time. Workshops experienced sudden stockouts of fabric, thread, or clay, halting production, while other materials suffered shelf degradation.
3. **Delayed & Error-Prone Trainee Stipend Calculations:** Under the "Earn While You Learn" (EWYL) initiative, students receive piece-rate stipends for verified crafts. Manually aggregating handwritten production slips caused significant calculation delays, calculation disputes, and delayed bank disbursements.
4. **Lost Retail Revenue & Lack of Sales Controls:** Finished goods sold at the KISS campus boutique or cultural exhibitions were recorded on paper receipts, creating cash reconciliation discrepancies and delayed inventory deductions.
5. **Reactive Rather than Predictive Production:** Production runs were scheduled reactively without historical demand data, causing overproduction of slow-moving items and stockouts of popular tribal crafts.
6. **Absence of Institutional Showcase:** Prospective students, visiting dignitaries, and patrons lacked a central digital portal to inspect vocational offerings, impact metrics, and artisan stories.

### 2.2 The Transformed Solution ("To-Be" State)
KV-TMS centralizes all operational, logistics, financial, and academic functions into a unified web enterprise platform:

```
+---------------------------------------------------------------------------------------------------------+
|                                    AS-IS VS. TO-BE BUSINESS TRANSFORMATION                              |
+-----------------------------------+-----------------------------------+---------------------------------+
| Operational Dimension             | Legacy Process ("As-Is")          | KV-TMS Transformed ("To-Be")    |
+-----------------------------------+-----------------------------------+---------------------------------+
| Trainee Attendance & Leaves       | Physical paper registers          | Daily digital batch attendance  |
|                                   | frequent log discrepancies        | with 75% benchmark alert engine |
+-----------------------------------+-----------------------------------+---------------------------------+
| Material Requisition (BOM)        | Manual verbal requests;           | Automatic BOM calculation and   |
|                                   | unmeasured material waste         | atomic Warehouse 1 deduction    |
+-----------------------------------+-----------------------------------+---------------------------------+
| Quality Control (QC) & Inventory  | Unrecorded visual inspection;     | Two-tier Dual Warehouse model;  |
|                                   | single mixed storage room         | QC pass/reject audit & barcodes |
+-----------------------------------+-----------------------------------+---------------------------------+
| Trainee Stipends (EWYL)           | Monthly manual ledger calculation;| Output-linked automated accrual;|
|                                   | delayed cash payouts              | Direct Benefit Transfer (DBT)   |
+-----------------------------------+-----------------------------------+---------------------------------+
| Retail Commercialization          | Paper bill books; untracked stock;| High-speed POS terminal; dynamic|
|                                   | manual cash reconciliation        | cart, GST, multi-tender payment |
+-----------------------------------+-----------------------------------+---------------------------------+
| Demand Planning                   | Intuition-based guesswork;        | AI time-series forecasting;     |
|                                   | frequent stock imbalance          | Holt-Winters trend & ROP engine |
+-----------------------------------+-----------------------------------+---------------------------------+
| Public Visibility                 | Offline brochures & word of mouth | Public showcase portal, live    |
|                                   |                                   | impact counters & online contact|
+-----------------------------------+-----------------------------------+---------------------------------+
```

---

## 3. STRATEGIC BUSINESS OBJECTIVES & SUCCESS KPIS

KV-TMS was engineered to fulfill six high-priority strategic business objectives:

```
+---------------------------------------------------------------------------------------------------------+
|                                  STRATEGIC BUSINESS OBJECTIVES & KPIS                                   |
+-------------------------------------+---------------------------------+---------------------------------+
| Strategic Objective                 | Target Business Outcome         | Key Performance Indicator (KPI) |
+-------------------------------------+---------------------------------+---------------------------------+
| 1. Student Financial Empowerment    | Complete transparency in piece- | 100% of verified output units   |
|    & Welfare Delivery               | rate earnings; zero payout leak | credited to student DBT ledger  |
+-------------------------------------+---------------------------------+---------------------------------+
| 2. Supply Chain Optimization &      | Eliminate workshop stockouts;   | 40% reduction in raw material   |
|    Waste Minimization               | prevent overstock degradation   | holding waste via BOM deduction |
+-------------------------------------+---------------------------------+---------------------------------+
| 3. High-Integrity Quality Control   | Ensure commercial-grade crafts; | 100% QC traceability linking    |
|    & Defect Segregation             | isolate defects prior to retail | finished SKUs to trainee & run  |
+-------------------------------------+---------------------------------+---------------------------------+
| 4. Retail Modernization & Revenue   | Accelerate campus retail sales; | < 15 second POS checkout time;  |
|    Realization                      | automated GST tax compliance    | zero negative inventory sales   |
+-------------------------------------+---------------------------------+---------------------------------+
| 5. Predictive Demand Planning       | Eliminate production guesswork  | 85%+ demand projection accuracy |
|    via Applied AI                   | through historical smoothing    | using Holt-Winters smoothing    |
+-------------------------------------+---------------------------------+---------------------------------+
| 6. Institutional Brand Outreach &   | Increase admissions outreach &  | Real-time verified metrics;     |
|    Digital Transparency             | donor confidence worldwide      | seamless session-bridge UX      |
+-------------------------------------+---------------------------------+---------------------------------+
```

---

## 4. STAKEHOLDER BENEFIT & VALUE PROPOSITION ANALYSIS

KV-TMS delivers distinct, measurable value propositions across every stakeholder segment:

### 4.1 Value Proposition for Trainees / Indigenous Students
- **Direct Financial Empowerment:** Trainees earn transparent, output-linked monetary stipends under the "Earn While You Learn" program, building personal savings while acquiring trade skills.
- **Academic Progress Transparency:** Real-time visibility into syllabus module milestones, daily attendance percentages, and practical craftsmanship evaluations.
- **Formalized Leave Rights:** Digital leave application system allowing students to request excused absences without administrative friction.

### 4.2 Value Proposition for Trainers & Master Craftsmen
- **Automated Academic Administration:** Instant daily cohort attendance marking, eliminating tedious paperwork.
- **Benchmark Alerting:** Automated visual warnings when a trainee's attendance drops below $75\%$, enabling timely faculty mentorship.
- **Objective Grading Standards:** Digital evaluation scorecards supporting multi-factor assessments, qualitative feedback, and 5-star craftsmanship ratings.

### 4.3 Value Proposition for Workshop Supervisors & Production Managers
- **Standardized Work-Order Scheduling:** Clear digital tracking of batch manufacturing targets, loom/machine assignments, and deadlines.
- **Precise Material Accounting:** Automated Bill of Materials (BOM) raw material calculation and atomic deduction from Warehouse 1, preventing unauthorized material leakage.
- **Defect Isolation & Yield Auditing:** Formal Quality Control (QC) logging segregating passed crafts from rework/scrap.

### 4.4 Value Proposition for Institutional Management & Central Administration
- **Complete Financial Auditability:** Immutable transaction logs across POS retail sales and student DBT stipend disbursements.
- **Two-Tier Dual Warehouse Control:** Total separation and real-time reconciliation between bulk raw inputs and retail finished goods.
- **Data-Driven Capital Allocation:** AI-assisted production recommendations optimizing procurement spend and labor allocation.

### 4.5 Value Proposition for Community Visitors, Donors & Public Patrons
- **Transparent Institutional Showcase:** Public visibility into verified social impact metrics (total trainees empowered, active trades, crafts produced).
- **Artisan Storytelling:** Authentic narratives celebrating tribal culture, artisan empowerment, and sustainable indigenous craft traditions.
- **Frictionless Admissions Inquiries:** Dedicated digital contact channel for prospective students and vocational candidates.

---

## 5. MACRO BUSINESS PROCESS WORKFLOWS

KV-TMS coordinates six core enterprise business workflows:

```
+---------------------------------------------------------------------------------------------------------+
|                                     MACRO BUSINESS PROCESS FLOWS                                        |
+---------------------------------------------------------------------------------------------------------+
```

### PROCESS 1: Trainee Onboarding, Cohort Training & Attendance Monitoring
- **Trigger:** Admission of an eligible indigenous student to KISS.
- **Business Actors:** Administrator, Trainer, Trainee.
- **Workflow:**
  1. Administrator records demographic profile, Aadhaar number, and verified bank account/IFSC details.
  2. Trainee is assigned to a vocational trade track (e.g. Apparels & Tailoring) and cohort batch.
  3. Trainer administers module syllabi and logs daily attendance.
  4. System computes attendance rates; students below $75\%$ trigger faculty intervention.
  5. Students submit leave requests; approved leaves automatically reconcile as excused in attendance.

### PROCESS 2: Work Order Scheduling, BOM Material Requisition & Shop-Floor Fabrication
- **Trigger:** Demand forecast recommendation or administrative batch production order.
- **Business Actors:** Production Manager, Warehouse 1 Logistics, Trainees.
- **Workflow:**
  1. Production Manager creates a work order specifying target quantity, product SKU, and machine assignment.
  2. System BOM engine calculates required raw materials and checks Warehouse 1 stock.
  3. If stock is sufficient, system atomically decrements Warehouse 1 inventory and launches the work order.
  4. Trainees execute hands-on cutting, stitching, pottery shaping, or weaving under supervision.

### PROCESS 3: Quality Control (QC) Inspection & Two-Tier Warehouse Segregation
- **Trigger:** Completion of a shop-floor batch production run.
- **Business Actors:** Production Manager, Warehouse 2 Logistics.
- **Workflow:**
  1. Production Manager inspects finished items against quality standards.
  2. Logs Passed Quantity and Rejected Quantity with defect remarks.
  3. Passed items are automatically transferred into Warehouse 2 (Finished Goods Hub) inventory with generated SKU barcodes.
  4. Defective items are routed to scrap or material rework.

### PROCESS 4: Earn While You Learn (EWYL) Direct Benefit Transfer (DBT) Payouts
- **Trigger:** Formal QC approval of finished crafts.
- **Business Actors:** Production Manager, Calculation Engine, Administrator, Trainee.
- **Workflow:**
  1. Production Manager logs verified units crafted per participating student artisan.
  2. System automatically multiplies verified units by approved piece rates, creating pending stipend ledger entries.
  3. Administrator reviews cumulative balances in the DBT Console, authorizes disbursement, and records bank transaction reference numbers.
  4. Trainee portal reflects updated balance and disbursed status in real time.

### PROCESS 5: Point of Sale (POS) Retail Commercialization & Inventory Sync
- **Trigger:** Retail customer purchases crafts at the KISS campus boutique or exhibition.
- **Business Actors:** Retail Cashier / Administrator, Customer.
- **Workflow:**
  1. Cashier scans product barcode or searches SKU on the POS terminal.
  2. Cart calculates subtotal, applied discounts, and configurable GST taxes.
  3. Customer tenders payment via Cash, UPI QR code, or Credit/Debit Card.
  4. System executes atomic checkout: generates unique invoice `INV-YYYYMMDD-XXXX`, prints receipt, and decrements sold quantity from Warehouse 2.
  5. Sales velocity feeds directly into the AI demand forecasting module.

### PROCESS 6: AI-Assisted Demand Planning & Strategic Procurement
- **Trigger:** Periodic administrative planning cycle.
- **Business Actors:** AI Forecasting Engine, System Administrator.
- **Workflow:**
  1. Forecasting engine ingests historical sales, production velocity, and current dual-warehouse stock.
  2. Computes 30-day demand curves using Holt-Winters exponential smoothing and Reorder Points (ROP).
  3. Administrator reviews recommendations to authorize upcoming raw material procurement and batch sizes.

---

## 6. BUSINESS RULES CATALOG

To ensure organizational discipline and legal compliance, KV-TMS enforces the following non-negotiable business rules:

```
+----------------------------------------------------------------------------------------------------+
|                                    BUSINESS RULES & POLICIES CATALOG                               |
+-------------+-----------------------------+--------------------------------------------------------+
| Rule ID     | Business Policy Domain      | Concrete Policy Statement & Enforcement Mechanism      |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-001  | Student Eligibility         | Enrolled trainees must be registered tribal students at|
|             |                             | KISS with verified Aadhaar and bank account records.   |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-002  | Academic Attendance Floor   | Trainees must maintain >= 75% attendance to qualify for|
|             |                             | practical certification and workshop participation.    |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-003  | Material Pre-Requisition    | Work orders cannot launch without sufficient raw       |
|             |                             | materials in Warehouse 1. Negative stock is blocked.   |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-004  | Strict QC Segregation       | Finished goods cannot enter Warehouse 2 or retail POS  |
|             |                             | without formal QC inspection and supervisor sign-off.  |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-005  | Output-Linked Stipends      | EWYL stipends are accrued strictly on Passed Quantity; |
|             |                             | zero stipends are awarded for defective crafts.        |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-006  | Segregation of Duties (SoD) | Production managers verify units; only System          |
|             |                             | Administrators have authority to disburse DBT funds.   |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-007  | POS Zero-Negative Stock     | POS checkout cannot sell items exceeding available     |
|             |                             | Warehouse 2 stock. Out-of-stock sales are blocked.     |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-008  | Financial Immutability      | Completed POS invoices and DBT disbursements are       |
|             |                             | permanent and immutable; audit adjustments required.   |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-009  | Statutory Tax Compliance    | All POS sales must compute applicable GST tax rates    |
|             |                             | and render compliant invoice receipts.                 |
+-------------+-----------------------------+--------------------------------------------------------+
| BR-POL-010  | Brand Identity Adherence    | Public portal and internal consoles must adhere to the |
|             |                             | approved KISS palette: Leaf Green #48B859 & Indigo.    |
+-------------+-----------------------------+--------------------------------------------------------+
```

---

## 7. BUSINESS SCOPE BOUNDARIES

### 7.1 In-Scope Capabilities
- Digital enrollment, cohort management, and demographic profiling.
- Trade curriculum structuring, daily attendance logging, and leave approval workflows.
- Practical craftsmanship competency grading and digital student report cards.
- Scheduled production work orders, automated BOM raw material deductions, and QC inspection audits.
- Two-tier Dual Warehouse logistics management (Warehouse 1 Raw Materials and Warehouse 2 Finished Goods).
- Point of Sale (POS) retail billing terminal with barcode search, GST taxes, and multi-tender payments.
- Automated Earn While You Learn stipend calculation and Direct Benefit Transfer (DBT) disbursement ledgers.
- Institutional notice board engine with priority and role-targeted routing.
- AI-driven time-series production demand forecasting and Reorder Point (ROP) heuristics.
- Public institutional showcase web portal with live impact counters and contextual session bridging.

### 7.2 Out-of-Scope Capabilities (Design Boundaries)
- Physical machinery operation, weaving loom automation, or ceramic kiln telemetry.
- Physical material transport, freight logistics, and campus parcel delivery.
- External automated banking gateway clearing (DBT payouts are verified and authorized internally; physical bank NEFT/RTGS batch processing occurs via banking channels).
- E-commerce international shipping and customs clearance (planned for future expansion).

---

## 8. BUSINESS RISKS & MITIGATION STRATEGIES

```
+----------------------------------------------------------------------------------------------------+
|                                    BUSINESS RISK ASSESSMENT MATRIX                                 |
+--------------------------+----------+--------------------------------------------------------------+
| Identified Business Risk | Severity | Proactive Mitigation Strategy                                |
+--------------------------+----------+--------------------------------------------------------------+
| Intermittent Workshop    | Moderate | Client-side caching of session tokens; optimistic UI updates |
| Network Connectivity     |          | and graceful error handling on reconnect.                    |
+--------------------------+----------+--------------------------------------------------------------+
| Trainee Digital Literacy | Moderate | Highly visual UI design; icon-based navigation; minimal text |
| Barriers                 |          | input requirements; mobile-friendly responsive portal.       |
+--------------------------+----------+--------------------------------------------------------------+
| Raw Material Price       | Low      | Configurable product cost price models; periodic inventory   |
| Fluctuations             |          | valuation reviews and dynamic piece-rate configurations.     |
+--------------------------+----------+--------------------------------------------------------------+
| Over-Production of       | Moderate | AI demand forecasting engine aligns scheduled production     |
| Slow-Moving SKUs         |          | batch quantities with verified historical sales velocity.    |
+--------------------------+----------+--------------------------------------------------------------+
| Cash Discrepancies at    | High     | Mandatory multi-tender recording (Cash/UPI/Card); daily POS  |
| Retail POS Registers     |          | shift settlement reports; immutable transaction numbering.   |
+--------------------------+----------+--------------------------------------------------------------+
```

---

## 9. SIGN-OFF & VERIFICATION

This Business Requirements Document represents the verified institutional specification of the KISS Vocational Training Management System (KV-TMS) as implemented.

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 7, 2026  

**Faculty Guide Review:**  
**Name & Designation:** School of Computer Science & Engineering, KIIT  
**Signature:** ____________________________  
**Date:** ____________________________  
