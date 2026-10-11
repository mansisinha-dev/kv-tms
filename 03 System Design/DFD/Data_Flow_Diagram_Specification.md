# DATA FLOW DIAGRAM (DFD) SPECIFICATION
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-DFD-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Concise Specification)  
**Date:** October 8, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. INTRODUCTION & NOTATION STANDARDS

### 1.1 Purpose of Data Flow Diagrams
The **Data Flow Diagram (DFD) Specification** models the structural information flow, functional decomposition, external entities, transformation processes, and data stores governing the **KISS Vocational Training Management System (KV-TMS)**. 

DFDs illustrate **how data enters the system, how it transforms across internal business processes, where it is stored, and what outputs are generated** for stakeholders—without getting bogged down in physical hardware or programming logic.

### 1.2 DFD Notational Conventions (Gane & Sarson / Yourdon)
* **External Entities (Rectangles):** People, organizations, or external actors interacting with the system (`TRAINEE`, `TRAINER / FACULTY`, `ADMINISTRATOR`, `PRODUCTION MANAGER`).
* **Processes (Rounded Rectangles):** Transformations of incoming data into outgoing data, numbered hierarchically (`0.0`, `1.0` through `14.0`).
* **Data Stores (Open Rectangles / Parallel Lines):** Repositories where information rests (`D1 Central Database`).
* **Data Flows (Directed Arrows):** Directional paths showing the movement of structured packets of data.

---

## 2. DFD LEVEL 0: CONTEXT DIAGRAM

The **Context Diagram (Level 0 DFD)** defines the global boundary of the KV-TMS platform. It abstracts the entire software into a single central process (`0.0`) and models all primary data exchanges with external entities.

![KV-TMS DFD Level 0 Context Diagram](KV-TMS%20DFD%20Level%200.png)  
*Figure 2.1: KV-TMS DFD Level 0 Context Diagram*

### External Entities & Data Flow Catalog

| External Entity | Inbound Data Flows to KV-TMS | Outbound Data Flows from KV-TMS |
| :--- | :--- | :--- |
| **Trainee (Student)** | Registration/Login credentials, leave applications, daily attendance confirmation. | Module syllabi, personal attendance %, craftsmanship grades, DBT stipend ledger. |
| **Trainer / Faculty** | Cohort attendance logs, competency scores, leave review decisions, notice posts. | Student batch rosters, 75% attendance alerts, performance trends. |
| **Administrator** | User account provisioning, DBT disbursement approvals, master system configurations. | Financial audit logs, institutional DBT ledgers, inventory valuations, notice broadcasts. |
| **Production Manager** | Work order parameters, BOM recipes, QC inspection pass/reject yields, POS sales. | Raw material stock levels, batch status, finished SKU barcodes, POS invoices. |

---

## 3. DFD LEVEL 1: SUBSYSTEM FUNCTIONAL DECOMPOSITION

The **Level 1 DFD** decomposes the central `0.0 KV-TMS` process into **14 specialized operational sub-processes**, showing how data interacts with the central data repository (`D1 Central Database`).

![KV-TMS DFD Level 1 Subsystem Decomposition Diagram](KV-TMS%20DFD%20Level%201.png)  
*Figure 3.1: KV-TMS DFD Level 1 Subsystem Functional Decomposition Diagram*

### Functional Process Catalog (Processes 1.0 to 14.0)

| Process ID | Process Name | Primary Inputs | Internal Transformation Logic | Primary Outputs |
| :---: | :--- | :--- | :--- | :--- |
| **1.0** | **Authentication & Auth** | User credentials (username, password) | Validates credentials against BCrypt hash, evaluates roles, signs JWT. | Signed JWT token, authenticated session profile. |
| **2.0** | **Trainee Management** | Student demographic profile, Aadhaar, bank details | Validates tribal eligibility, provisions student profile, assigns cohort. | Trainee record, batch enrollment confirmation. |
| **3.0** | **Trainer Management** | Faculty qualifications, trade specialization | Provisions instructor account, maps teacher to vocational workshops. | Instructor profile, assigned course batches. |
| **4.0** | **Course & Training** | Vocational curricula, trade modules, schedules | Structures module syllabi, lesson milestones, and workshop hours. | Active course schedules, trade curriculum cards. |
| **5.0** | **Attendance Mgmt** | Daily batch attendance marks, student leave requests | Computes cumulative attendance %, evaluates statutory 75% floor. | Attendance audit records, 75% warning alerts. |
| **6.0** | **Assessment Mgmt** | Practical craftsmanship scores, evaluation remarks | Evaluates multi-factor competency rubric, generates ratings. | Competency report cards, certified skill grades. |
| **7.0** | **Product Creation** | Craft SKU specifications, material recipes, piece rates | Registers finished good catalog, maps trade category & stipend rates. | Product SKU records, BOM definition entries. |
| **8.0** | **Production Mgmt** | Batch work orders, machine/loom allocations | Validates WH-1 raw stock, executes atomic BOM deduction, tracks jobs. | Active work orders, material consumption logs. |
| **9.0** | **Inventory Mgmt** | Raw material receipts, QC passed transfers | Manages two-tier warehouse balances (WH-1 Raw vs WH-2 Finished). | Real-time stock counts, reorder alerts. |
| **10.0** | **Sales & Distribution** | POS barcode scans, payment tenders (Cash/UPI/Card) | Verifies WH-2 stock, calculates GST taxes, decrements retail stock. | Sequential tax invoices (`INV-...`), sales receipts. |
| **11.0** | **Earn While Learn (DBT)** | QC verified passed units per student artisan | Multiplies verified units by piece rates, accrues pending stipend. | Student DBT ledgers, disbursement audit trails. |
| **12.0** | **Reports & Analytics** | Historical logs across attendance, stock, and sales | Aggregates operational KPIs, financial summaries, and yield metrics. | Administrative dashboards, CSV/PDF reports. |
| **13.0** | **AI Forecasting** | Historical sales velocity, current dual-warehouse stock | Computes 30-day demand curves via Holt-Winters exponential smoothing. | Demand curve projections, ROP recommendations. |
| **14.0** | **System Administration** | Institutional notices, global system configurations | Enforces role policies, broadcasts bulletins, manages system backups. | Notice board bulletins, audit event logs. |

---

## 4. DATA STORE CATALOG (`D1 CENTRAL DATABASE`)

All 14 sub-processes store and retrieve persistent records through **D1: Central Relational Database**, organized into six major logical entities:

| Data Entity Group | Governed Tables | Interacting Processes | Purpose & Integrity Controls |
| :--- | :--- | :--- | :--- |
| **Identity & Users** | `users`, `user_roles` | 1.0, 2.0, 3.0, 14.0 | BCrypt password hashes, role authorities, unique usernames. |
| **Academics & Attendance** | `trainees`, `attendance_records`, `leave_requests` | 2.0, 4.0, 5.0, 6.0 | Trainee profiles, daily cohort marks, attendance threshold triggers. |
| **Workshop & BOM** | `work_orders`, `bill_of_materials`, `raw_materials` | 7.0, 8.0, 9.0 | Raw material stock, recipe consumption, atomic BOM decrements. |
| **QC & Finished Goods** | `qc_inspections`, `finished_goods` | 8.0, 9.0, 11.0 | Pass/reject inspection yields, Warehouse 2 inventory, SKU barcodes. |
| **Retail POS Sales** | `pos_sales`, `pos_sale_items`, `invoices` | 9.0, 10.0, 12.0 | Immutable invoice logs, GST breakdown, atomic stock deductions. |
| **Stipends & Welfare** | `dbt_stipend_ledgers`, `dbt_disbursements` | 11.0, 12.0 | Output-linked piece-rate earnings, bank transaction tracking. |

---

## 5. CRITICAL DATA FLOW PATHWAYS

### Pathway 1: Workshop Production & QC Transfer Lifecycle
* **Work Order Launch (8.0)** &rarr; **Atomic Stock Deduction from WH-1 (9.0)** &rarr; **Trainee Fabrication** &rarr; **QC Inspection Audit (8.0)**
  * *If Passed:* Automatically transferred into Warehouse 2 Finished Stock (9.0) & triggers EWYL Stipend Accrual (11.0).
  * *If Rejected:* Logged in Defect Records & routed to raw material scrap or workshop rework.

### Pathway 2: POS Retail Commercialization & Demand Forecasting
* **Barcode Scan / SKU Search (10.0)** &rarr; **Verifies & Deducts WH-2 Stock (9.0)** &rarr; **Generates Tax Invoice (INV-YYYYMMDD-XXXX)**
  * *Sales Velocity Stream:* Real-time sales transactions asynchronously feed the AI Forecasting Engine (13.0).
  * *Demand Curves:* Holt-Winters model generates 30-day recommended production batch sizes for Workshop Production (8.0).

---

## 6. SIGN-OFF & VERIFICATION

This Data Flow Diagram Specification accurately reflects the functional information flow and process decomposition of the KISS Vocational Training Management System (KV-TMS).

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 8, 2026  

**Faculty Guide Review:**  
**Department:** School of Computer Science & Engineering, KIIT  
**Signature:** ____________________________  
**Date:** ____________________________  
