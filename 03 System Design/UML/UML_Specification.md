# UNIFIED MODELING LANGUAGE (UML) SPECIFICATION
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-UML-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Concise Specification)  
**Date:** October 8, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. INTRODUCTION & UML MODELING SCOPE

### 1.1 Purpose of UML Architectural Specifications
The **Unified Modeling Language (UML) Specification** establishes the formal object-oriented software engineering models for the **KISS Vocational Training Management System (KV-TMS)**. It models both the dynamic runtime interactions between human stakeholders and the static structural organization of domain objects.

While high-level architecture defines physical infrastructure and DFDs illustrate functional transformations, UML provides the **developer-facing implementation blueprint**: defining classes, inheritance hierarchies, private states, public method contracts, actor boundaries, and execution sequences.

### 1.2 Key Architectural Perspectives
* **Behavioral Modeling (Use Case Model):** Formulates the platform's automated system boundary, catalogs 4 external actor roles, and specifies 16 core use cases along with `<<include>>` and `<<extend>>` dependencies.
* **Structural Domain Modeling (Class Diagram):** Specifies 15 foundation classes partitioned into 4 architectural packages (Identity & RBAC, Academics, Production, Commercial Intelligence) with attributes, operations, and multiplicity.
* **Transactional Interaction Dynamics:** Models atomic workflow lifecycles across Bill of Materials deduction, craftsmanship quality inspection, Earn While Learn (EWYL) stipend accrual, and POS checkout.

### 1.3 Alignment with Institutional Mandate
KV-TMS digitizes vocational skill development for indigenous tribal students at KISS, operating across trades like Tailoring, Carpentry, and Handicrafts. By translating pedagogical milestones, workshop fabrication, two-tier inventory, and direct benefit transfer (DBT) into formal UML abstractions, the system ensures architectural robustness, testability, and seamless code maintainability.

---

## 2. USE CASE MODEL SPECIFICATION

The **Use Case Model** defines the operational boundaries of the KV-TMS web application and models how external human actors interact with internal business capabilities.

![KV-TMS UML Use Case Diagram](KV-TMS%20Use%20Case%20Diagram.png)  
*Figure 2.1: KV-TMS UML Use Case Diagram (Actor Roles, Boundary & Functional Scope)*

### 2.1 Primary Actors & Interaction Catalog

| Actor Role | Institutional Responsibilities | Associated Use Cases |
| :--- | :--- | :--- |
| **Trainee (Student)** | Tribal student artisan enrolled in vocational trade cohorts at KISS campus workshops. | Auth & RBAC (UC01), Profile & Enrollment (UC02), Trade Syllabus (UC03), Attendance Tracking (UC04), Practical Assessment (UC05), EWYL DBT (UC06), Dashboard (UC07). |
| **Trainer / Faculty** | Vocational trade instructor managing workshop practicals, attendance, and skill evaluations. | Auth & RBAC (UC01), Trade Syllabus (UC03), Attendance Tracking (UC04), Practical Assessment (UC05), Role Dashboard (UC07). |
| **Production Manager** | Workshop supervisor governing BOM formulations, fabrication runs, QC audits, and POS store. | Product Catalog & BOM (UC08), Production Orders (UC09), QC Audit (UC10), Dual-Stock (UC11), AI Forecast (UC12), POS Sales (UC13). |
| **Administrator** | Institutional governance authority managing user provisioning, security, and DBT payouts. | Auth & RBAC (UC01), EWYL DBT Payout (UC06), Role Dashboard (UC07), Reports (UC14), User Provisioning (UC15), Notice Board (UC16). |

### 2.2 Core Stereotype Relationships
* **`<<include>>` (Mandatory Dependencies):**
  * `UC09 Production Orders` &rarr; `UC08 Product Catalog & BOM`: Executing a work order requires loading the predefined material recipe.
  * `UC09 Production Orders` &rarr; `UC10 QC Inspection Audit`: Work order completion mandates formal quality pass/reject tallying.
  * `UC13 POS Retail Sales` &rarr; `UC11 Dual-Warehouse Stock`: Generating a tax invoice mandates atomic finished goods stock decrement.
* **`<<extend>>` (Conditional Triggers):**
  * `UC10 QC Inspection` &rarr; `UC06 Earn While Learn (DBT)`: QC-passed units conditionally trigger piece-rate stipend ledger credits for student artisans.
  * `UC12 AI Demand Forecast` &rarr; `UC09 Production Work Orders`: Forecasted demand spikes trigger recommended production work order schedules.

---

## 3. DOMAIN CLASS MODEL SPECIFICATION

The **Domain Class Diagram** models the structural backbone of KV-TMS, capturing 15 core entities partitioned into 4 cohesive packages, including inheritance, associations, and multiplicity constraints.

![KV-TMS UML Class Diagram](KV-TMS%20Class%20Diagram.png)  
*Figure 3.1: KV-TMS UML Class Diagram (Domain Architecture, Inheritance & Associations)*

### 3.1 Architectural Package Decomposition

| Architectural Package | Governed Domain Classes | Design Patterns & Responsibilities |
| :--- | :--- | :--- |
| **Identity & RBAC**<br>`#2D3591 (Royal Indigo)` | `User`, `Trainee`, `Trainer`, `Administrator`, `Report` | Generalization hierarchy. Root class `User` provides BCrypt authentication and JWT claims, specialized into `Trainee`, `Trainer`, and `Administrator`. |
| **Academics & Training**<br>`#0F766E (Teal)` | `CourseTrade`, `Syllabus`, `Training`, `Attendance`, `Assessment` | Curriculum composition. `CourseTrade` encapsulates modules and daily workshop logs, enforcing the statutory 75% attendance floor and skill rubrics. |
| **Production & Inventory**<br>`#166534 (Leaf Green)` | `Product`, `Production`, `Inventory` | Manufacturing execution. Governs Bill of Materials recipes, workshop fabrication jobs, QC pass/reject audit yields, and two-tier warehouse stock tracking. |
| **Commercial Intelligence**<br>`#B45309 (Warm Amber)` | `SalesOrder`, `Forecast` | Retail commercialization. Powers POS barcode counter checkout, GST invoice creation, and Holt-Winters triple exponential smoothing demand curves. |

---

## 4. STRUCTURAL ASSOCIATIONS & TRANSACTIONAL DYNAMICS

### 4.1 Class Structural Relationships & Multiplicity Catalog

| Relationship Type | Source Class | Target Class | Multiplicity & Semantics |
| :--- | :--- | :--- | :--- |
| **Generalization (&Delta;)** | `Trainee`, `Trainer`, `Admin` | `User` | Subclasses inherit credentials, passwords, role claims, and base profile methods. |
| **Composition (&diams;)** | `CourseTrade` | `Syllabus` | **1 to 1..*** (A trade must contain one or more instructional syllabus modules). |
| **Association (&mdash;)** | `Trainer` | `Training` | **1 to 0..*** (An instructor conducts zero or multiple workshop sessions). |
| **Association (&mdash;)** | `Training` | `Attendance` | **1 to 0..*** (Each training session logs daily attendance for enrolled trainees). |
| **Association (&mdash;)** | `Product` | `Production` | **1 to 0..*** (A registered product SKU is fabricated in batch work orders). |
| **Association (&mdash;)** | `Production` | `Inventory` | **0..* to 1..2** (Deducts WH-1 raw material stock; replenishes WH-2 finished goods). |
| **Association (&mdash;)** | `SalesOrder` | `Inventory` | **0..* to 1** (A retail POS purchase transaction decrements WH-2 finished goods). |
| **Association (&mdash;)** | `Forecast` | `Production` | **0..* to 0..*** (AI demand projections recommend batch work order run quantities). |

### 4.2 Key Transactional Sequence Dynamics

#### Dynamic 1: Workshop Production, QC Audit & EWYL Stipend Accrual Lifecycle
1. **Job Launch:** `ProductionManager` triggers `Production.recordProduction()` &rarr; verifies BOM formula &rarr; executes atomic deduction from Warehouse 1 Raw Stock via `Inventory.updateStock(-qty)`.
2. **Fabrication:** Trainees perform workshop manufacturing (weaving, carpentry, tailoring) under faculty mentorship.
3. **QC Inspection:** Supervisor executes `Production.inspectQcPassReject(pass, reject)`.
4. **Stock Transfer & Stipend Credit:** Passed units atomically transfer to Warehouse 2 Finished Stock via `Inventory.transferFinishedStock()`, triggering immediate credit to `Trainee.stipendBalance += (pass * pieceRate)`.
5. **DBT Disbursement:** `Administrator` audits accumulated ledgers and executes direct bank disbursements.

#### Dynamic 2: POS Retail Checkout & Asynchronous AI Demand Sync
1. **Counter Checkout:** POS clerk scans product barcode &rarr; `SalesOrder.createOrder()` validates SKU pricing and tax.
2. **Tender & Billing:** Payment received &rarr; invokes `SalesOrder.processSale()` &rarr; prints sequential invoice (`INV-YYYYMMDD-XXXX`) &rarr; atomically decrements WH-2 Finished Stock.
3. **Demand Intelligence:** Real-time checkout velocity streams into `Forecast.predictDemand()`.
4. **Production Sizing:** Holt-Winters statistical model projects 30-day demand curves, recommending batch work orders.

---

## 5. REQUIREMENTS TRACEABILITY & ACADEMIC SIGN-OFF

### 5.1 Comprehensive Requirements Traceability Matrix

| System Requirement | Addressed Use Cases | Governing Domain Classes | Compliance Verification |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | UC01 (Auth), UC02 (Profile), UC15 (User Admin) | `User`, `Trainee`, `Trainer`, `Administrator` | Role hierarchy enforced via BCrypt hashing & signed JWT tokens. |
| **Academics & Attendance** | UC03 (Syllabus), UC04 (Attendance), UC05 (Assess) | `CourseTrade`, `Syllabus`, `Training`, `Attendance`, `Assessment` | Statutory 75% floor alerts & multi-factor skill competency cards. |
| **Workshop & Dual Stock** | UC08 (BOM), UC09 (Production), UC11 (Stock) | `Product`, `Production`, `Inventory` | Atomic BOM raw material deductions & dual-warehouse reconciliation. |
| **EWYL DBT Welfare** | UC06 (Earn While Learn DBT), UC10 (QC Audit) | `Trainee`, `Production`, `Inventory` | Output-linked piece-rate stipend ledger credits & bank payouts. |
| **POS & AI Forecasting** | UC12 (AI Forecast), UC13 (POS Retail Sales) | `SalesOrder`, `Inventory`, `Forecast` | Barcode scanner checkout & Holt-Winters 30-day demand projections. |

### 5.2 Academic Verification

This UML Specification document accurately details the object-oriented architectural models, behavioral interactions, and structural relationships of the KISS Vocational Training Management System (KV-TMS) in full accordance with B.Tech CSE capstone design guidelines.

**Prepared By:** Mansi Sinha  
**Roll Number:** 21051515  
**Degree:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Signature:** ____________________________  
**Date:** October 8, 2026  

**Faculty Guide Review:**  
**Academic Guide:** Faculty Advisor, School of Computer Science & Engineering  
**Institution:** KIIT Deemed to be University  
**Host Organization:** Kalinga Institute of Social Sciences (KISS)  
**Signature:** ____________________________  
**Date:** ____________________________  
