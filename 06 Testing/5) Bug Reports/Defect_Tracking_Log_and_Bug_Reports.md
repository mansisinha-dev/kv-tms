# DEFECT TRACKING LOG & INCIDENT REPORTS
## KISS Vocational Training Management System (KV-TMS)

> **Document ID:** `KV-TMS-STLC-DTL-v1.0`  
> **Version:** 1.0 (IEEE 1044 Defect Classification)  
> **Project Candidate:** Mansi Sinha | **Date:** October 8, 2026  
> **Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
> **Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. Defect Management Policy & IEEE 1044 Lifecycle

### 1.1 Purpose of the Defect Tracking Log
The **Defect Tracking Log & Incident Reports** document provides a formal, transparent record of all software anomalies identified, investigated, rectified, and validated during the development and testing of **KV-TMS**. Adhering to the **IEEE 1044-2009 Standard for Software Anomaly Classification**, this record establishes accountability and verifies that all defects affecting financial calculations, inventory balances, and student welfare were definitively resolved before production sign-off.

### 1.2 Defect State Machine & Classification Standards
* **Defect Lifecycle States:** `NEW &rarr; TRIAGED &rarr; ASSIGNED &rarr; IN_PROGRESS &rarr; FIXED &rarr; RETESTED &rarr; CLOSED`.
* **Severity P1 (Blocker):** Catastrophic failure causing system halt, inventory overselling, or total authentication breach. Must be resolved within 4 hours.
* **Severity P2 (Critical):** Significant failure affecting key business logic (e.g. attendance percentage rounding, work order creation) without viable workaround. Must be resolved within 8 hours.
* **Severity P3 (Major):** Secondary feature failure with existing manual workaround (e.g. tax split precision, CSV formatting). Resolved within 24 hours.
* **Severity P4 (Minor / Cosmetic):** Cosmetic defect, label truncation, or responsive styling nuance. Resolved within 48 hours.

### 1.3 Defect Density & Clearance Metrics

| Defect Severity Level | Total Logged | Fixed & Retested | Verified Closed | Residual Open | Closure Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **P1 - Blocker** | 1 | 1 | 1 | 0 | **100.0%** |
| **P2 - Critical** | 2 | 2 | 2 | 0 | **100.0%** |
| **P3 - Major** | 2 | 2 | 2 | 0 | **100.0%** |
| **P4 - Minor / Cosmetic** | 1 | 1 | 1 | 0 | **100.0%** |
| **TOTAL STLC DEFECTS** | **6** | **6** | **6** | **0** | **100.0%** |

> **Zero Residual Defect Certification:** 100% of all reported defects across functional, security, and performance test runs were successfully remediated and retested. Zero open defects remain in the release build.

---

## 2. Detailed Defect Incident Reports (BUG-001 & BUG-002)

### BUG-001: POS Race Condition Overselling on Single Stock Unit Under Concurrent Requests

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P1 - Blocker** / High |
| **Impacted Module** | `com.kiss.kv_tms.pos` (Retail Checkout Counter) |
| **Reported Date / Status** | October 2, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Initialize inventory table with `available_stock = 1` for craft item `SKU-HND-DHOKRA-01`.<br>2. Simulate two POS counters issuing simultaneous POST `/api/v1/pos/orders` requests for 1 unit each. |
| **Observed Result** | Both transactions read stock = 1 simultaneously; both decremented stock; ending stock reached `-1` (inventory overselling anomaly). |
| **Expected Result** | Only 1 transaction commits successfully; 2nd transaction blocked and receives HTTP 409 Conflict. |
| **Root Cause Analysis** | Missing pessimistic locking on repository query; default `READ COMMITTED` isolation allowed non-repeatable read race condition. |
| **Technical Fix** | Annotated `InventoryRepository.findByIdForUpdate()` with `@Lock(LockModeType.PESSIMISTIC_WRITE)` (PostgreSQL `SELECT ... FOR UPDATE`). |
| **Verification & Regression** | Apache JMeter 50-thread concurrency test verified exactly 1 checkout succeeded and 49 received HTTP 409. |

---

### BUG-002: IEEE 754 Floating-Point Binary Rounding Error in 74.9% Attendance Rule

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P2 - Critical** / High |
| **Impacted Module** | `com.kiss.kv_tms.attendance` (Attendance & DBT Rules) |
| **Reported Date / Status** | October 3, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Create synthetic student profile with 149 attended sessions out of 200 total sessions (mathematically 74.50%).<br>2. Invoke `AttendanceEvaluationService.evaluateDbtEligibility()`. |
| **Observed Result** | Binary double division computed `74.50000000000001`; boundary comparison logic intermittently misclassified student due to floating-point imprecision. |
| **Expected Result** | Exact evaluation of `74.50%`; student flagged `is_at_risk = true` and disqualified from monthly DBT disbursement. |
| **Root Cause Analysis** | Use of IEEE 754 `double` primitive arithmetic in statutory welfare calculation. |
| **Technical Fix** | Refactored mathematical calculation to Java `BigDecimal` with 4-decimal precision and `RoundingMode.HALF_UP`. |
| **Verification & Regression** | Parameterized boundary unit tests (`TC-ATT-03` & `TC-ATT-04`) pass deterministically across all boundary test cases. |

---

## 3. Detailed Defect Incident Reports (BUG-003 & BUG-004)

### BUG-003: Vocational Work Order Permitting Negative Raw Material Warehouse Balances

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P2 - Critical** / Medium |
| **Impacted Module** | `com.kiss.kv_tms.manufacturing` (Manufacturing & BOM) |
| **Reported Date / Status** | October 4, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Warehouse 1 raw material stock for `RM-MTL-BRASS` contains 40.0 kg.<br>2. Trainer creates work order batch of 100 figurines requiring 80.0 kg brass scrap via POST `/api/v1/production/batches`. |
| **Observed Result** | Batch entity saved with status `PLANNED`; warehouse inventory balance decremented to negative (`-40.0 kg`). |
| **Expected Result** | Operation rejected with HTTP 422 Unprocessable Entity; descriptive error message: "Insufficient inventory for Material #203"; batch not persisted. |
| **Root Cause Analysis** | Omission of atomic pre-flight validation pass checking aggregate availability across all BOM items before persisting batch state. |
| **Technical Fix** | Implemented pre-reservation validation pass in `ManufacturingService` throwing custom `InsufficientRawMaterialException`. |
| **Verification & Regression** | Automated MockMvc test `TC-MFG-02` confirms clean HTTP 422 rejection and zero database mutation. |

---

### BUG-004: Central & State GST Split Decimal Truncation on Odd Rupee Retail Invoices

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P3 - Major** / Medium |
| **Impacted Module** | `com.kiss.kv_tms.pos` (GST Invoicing Engine) |
| **Reported Date / Status** | October 5, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Add retail item totaling ₹455.00 subject to 5.0% GST (Total Statutory Tax = ₹22.75).<br>2. Generate GST tax invoice splitting tax equally into CGST (2.5%) and SGST (2.5%). |
| **Observed Result** | CGST computed as ₹11.37 and SGST computed as ₹11.37; Total Split Tax = ₹22.74, creating a ₹0.01 reconciliation deficit against total invoice. |
| **Expected Result** | Sum of CGST and SGST must mathematically equal total tax exactly (₹22.75, e.g. CGST ₹11.38, SGST ₹11.37). |
| **Root Cause Analysis** | Independent truncation of half-cent fractions on split tax line items. |
| **Technical Fix** | Implemented Banker's Rounding (`RoundingMode.HALF_EVEN`) with residual rounding adjustment applied to SGST. |
| **Verification & Regression** | Unit test `TC-POS-02` validated across 50 odd rupee price permutations with zero tax discrepancy. |

---

## 4. Detailed Defect Incident Reports (BUG-005 & BUG-006)

### BUG-005: Holt-Winters 30-Day Demand Projection CSV Export Formatting Anomaly

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P3 - Major** / Low |
| **Impacted Module** | `com.kiss.kv_tms.forecast_dbt` (Predictive Forecasting) |
| **Reported Date / Status** | October 6, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Generate 30-day Holt-Winters demand forecast for handicraft SKUs via POST `/api/v1/forecast/generate`.<br>2. Export historical projection matrix to CSV via GET `/api/v1/forecast/export/csv`.<br>3. Open generated CSV file in spreadsheet readers (Excel / LibreOffice Calc). |
| **Observed Result** | Unquoted commas inside confidence interval vector strings (`[182.5, 190.2]`) split single fields into multiple columns, misaligning spreadsheet headers. |
| **Expected Result** | All data vectors enclosed in RFC 4180 standard quotation marks, preserving tabular alignment. |
| **Root Cause Analysis** | Custom CSV streaming builder wrote raw string concatenations without checking for embedded commas. |
| **Technical Fix** | Refactored export service to utilize Apache Commons CSV printer with automatic RFC 4180 escaping. |
| **Verification & Regression** | Validated CSV exports across multiple product categories with zero delimiter misalignment. |

---

### BUG-006: Student Registration Department Dropdown UI Tooltip Truncation on Mobile Viewport

| Field | Detail |
| :--- | :--- |
| **Severity / Priority** | **P4 - Minor** / Low |
| **Impacted Module** | `com.kiss.kv_tms.frontend` (React Student Form) |
| **Reported Date / Status** | October 7, 2026 / **CLOSED** |
| **Steps to Reproduce** | 1. Open student registration form in mobile browser or viewport emulation (375px width).<br>2. Tap or hover over department selection help icon. |
| **Observed Result** | Floating tooltip text was truncated horizontally by 20px against the right screen boundary. |
| **Expected Result** | Tooltip repositions dynamically to remain fully readable within screen boundaries. |
| **Root Cause Analysis** | Parent card container had `overflow: hidden` and absolute positioning constraint. |
| **Technical Fix** | Migrated tooltip to render via React Portal directly into `document.body` with Popper.js flip modifiers. |
| **Verification & Regression** | Visual testing verified across iPhone, Android, and tablet display resolutions. |

---

## 5. Master Defect Register & Academic Sign-Off Block

### 5.1 Consolidated Master Defect Register Matrix

| Defect ID | Defect Title | Severity | Impacted Module | Reported | Resolved | Status |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| **BUG-001** | POS Concurrency Overselling Race Condition | **P1** | `com.kiss.kv_tms.pos` | 02-Oct-2026 | 03-Oct-2026 | **CLOSED (Verified)** |
| **BUG-002** | Attendance 74.9% Floating-Point Rounding Error | **P2** | `com.kiss.kv_tms.attendance` | 03-Oct-2026 | 04-Oct-2026 | **CLOSED (Verified)** |
| **BUG-003** | BOM Work Order Permitting Negative Balance | **P2** | `com.kiss.kv_tms.manufacturing` | 04-Oct-2026 | 05-Oct-2026 | **CLOSED (Verified)** |
| **BUG-004** | Central & State GST Split Decimal Truncation | **P3** | `com.kiss.kv_tms.pos` | 05-Oct-2026 | 06-Oct-2026 | **CLOSED (Verified)** |
| **BUG-005** | Holt-Winters 30-Day Forecast CSV Formatting | **P3** | `com.kiss.kv_tms.forecast_dbt` | 06-Oct-2026 | 07-Oct-2026 | **CLOSED (Verified)** |
| **BUG-006** | Student Form Tooltip Truncation on Mobile | **P4** | `com.kiss.kv_tms.frontend` | 07-Oct-2026 | 07-Oct-2026 | **CLOSED (Verified)** |

### 5.2 Defect Closure Certification & Academic Sign-Off Block
This Defect Tracking Log certifies that all defects identified during the software testing life cycle of the KISS Vocational Training Management System (KV-TMS) have been definitively rectified, verified through automated regression tests, and closed prior to production release.

| Academic Role | Name & Affiliation | Approval Signature | Sign-Off Date |
| :--- | :--- | :---: | :---: |
| **Project Candidate & Developer** | **Mansi Sinha**, B.Tech CSE | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engg, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |
