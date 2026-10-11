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