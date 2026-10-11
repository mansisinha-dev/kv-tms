# TEST DATA SPECIFICATION & SYNTHETIC FIXTURES CATALOG
## KISS Vocational Training Management System (KV-TMS)

> **Document ID:** `KV-TMS-STLC-TDS-v1.0`  
> **Version:** 1.0 (Test Fixture Standards)  
> **Project Candidate:** Mansi Sinha | **Date:** October 8, 2026  
> **Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
> **Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. Test Data Management Strategy & Architecture

### 1.1 Purpose of the Test Data Specification
The **Test Data Specification** defines the synthetic datasets, edge-case fixtures, database seed scripts, and boundary payloads required to execute automated unit, integration, and concurrency tests for **KV-TMS**. Deterministic test data ensures that every test execution is reproducible, isolated, and immune to ambient state drift.

All test datasets are maintained in physical machine-readable files located directly in `06 Testing/Test_Data/`, including JSON schemas, CSV matrices, and automated SQL initialization scripts (`data-test.sql`).

### 1.2 Data Privacy & DPDP Act 2023 Compliance Framework
KV-TMS manages the academic, biometric, and financial records of over 40,000 indigenous tribal students. In accordance with the **Digital Personal Data Protection (DPDP) Act, 2023** and institutional ethics guidelines, production PII is strictly prohibited in testing harnesses:
* **Synthetic Aadhaar Numbers:** Real 12-digit UIDAI numbers are strictly replaced with deterministic synthetic tokens (e.g. `XXXX-XXXX-9011`) that satisfy Luhn validation algorithms without representing real citizens.
* **Pseudo Banking Credentials:** DBT bank account numbers and IFSC codes use simulated sandbox identifiers (e.g. `tok_bank_axis_01`, `UTIB0000001`) preventing unauthorized financial routing.
* **Biometric Template Simulation:** Real fingerprint minutiae and iris patterns are replaced with simulated 32-character hexadecimal UID hashes generated via SHA-256 for RFID/biometric mock scanners.
* **Synthetic Identity Persona:** Student names, tribal designations, and roll numbers are programmatically synthesized to represent regional demographics while preserving complete individual privacy.

> **Test Data Isolation Guarantee:** Automated integration tests leverage Spring Boot's `@Transactional` rollback mechanism and in-memory H2 databases (PostgreSQL compatibility mode). The baseline state is seeded via `data-test.sql` and discarded immediately upon test completion.

---

## 2. Identity, RBAC & Attendance Boundary Datasets

### 2.1 Multi-Role User Authentication Dataset (`auth_users_test_data.json`)
Test user accounts represent each role in the RBAC hierarchy with pre-computed bcrypt password hashes and simulated RFID access tags.

| User ID | Username | Assigned RBAC Role | Plaintext Password | RFID UID | Testing Purpose & Verification Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **USR-01** | `admin_mansi` | `ROLE_ADMIN` | `AdminPass@2026` | `A1B2C3D4` | Full administrative permissions; user provisioning; system audit inspection. |
| **USR-02** | `trainer_sanatan` | `ROLE_INSTRUCTOR` | `TrainerPass@2026` | `E5F6G7H8` | Batch initiation; manual attendance review; student trade grade submission. |
| **USR-03** | `pos_kalinga_01` | `ROLE_POS_OPERATOR` | `PosPass@2026` | `I9J0K1L2` | Retail barcode scanning; multi-terminal checkout concurrency stress testing. |
| **USR-04** | `qa_inspector_das` | `ROLE_QA_OFFICER` | `QaPass@2026` | `M3N4O5P6` | Batch tolerance inspection gate; verdict authorization (Pass/Fail/Quarantine). |
| **USR-05** | `student_birsa` | `ROLE_STUDENT` | `StudentPass@2026` | `Q7R8S9T0` | Biometric tap simulation; read-only attendance checks; RBAC escalation blocking. |

### 2.2 Student Attendance Boundary Dataset (`students_attendance_test_data.csv`)
This dataset exercises the statutory **75.0% attendance rule** governing trade certification and Direct Benefit Transfer (DBT) welfare payouts.

| Student ID | Student Name | Vocational Trade | Sessions Attended | Attd % | DBT Status | Boundary Condition Test Role |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **STU-001** | Birsa Munda | Tribal Handicrafts | 150 / 200 | 75.00% | **QUALIFIED** | Exact 75.0% boundary test; qualified for monthly stipend. |
| **STU-002** | Sunita Kisku | Tribal Handicrafts | 149 / 200 | 74.50% | **DISQUALIFIED** | Immediate boundary failure (74.5%); flagged at risk & DBT denied. |
| **STU-003** | Mangal Soren | Apparel & Textile | 148 / 200 | 74.00% | **DISQUALIFIED** | Sub-boundary failure; DBT payout blocked by rule engine. |
| **STU-004** | Pravati Majhi | Apparel & Textile | 192 / 200 | 96.00% | **QUALIFIED** | Exemplary attendance cohort; instant welfare clearance. |
| **STU-005** | Rabi Hembram | Woodworking | 170 / 200 | 85.00% | **QUALIFIED** | Standard compliant student profile above statutory requirement. |
| **STU-006** | Laxmi Oram | Woodworking | 120 / 200 | 60.00% | **DISQUALIFIED** | Chronic absentee cohort; mandatory counseling triggered. |
| **STU-011** | Chandra Marandi | Tribal Handicrafts | 150 / 200 | 75.00% | **QUALIFIED** | Restored to 75.0% via approved medical excuse override audit. |

---

## 3. Manufacturing, BOM & Quality Inspection Datasets

### 3.1 Raw Material Inventory Baseline (Warehouse 1 Fixtures)
The table below defines the warehouse inventory levels used to test Bill of Materials (BOM) stock reservation and stockout conditions.

| Material Code | Material Description | Unit | Current Stock | Unit Cost (₹) | Reorder Lvl | Test Condition |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `RM-FAB-COTTON` | Organic Cotton Yarn | KG | 250.0 | ₹180.00 | 50.0 | **Sufficient Stock** |
| `RM-DYE-NATURAL` | Vegetable Indigo Dye Extract | LITER | 15.0 | ₹320.00 | 30.0 | **Low Stock Alert** |
| `RM-MTL-BRASS` | Recycled Brass Scrap Metal | KG | 40.0 | ₹420.00 | 100.0 | **Deficient Stock** |
| `RM-WD-TEAK` | Seasoned Teak Timber Blocks | SQ_FT | 500.0 | ₹150.00 | 80.0 | **Sufficient Stock** |

### 3.2 Bill of Materials (BOM) Consumption Matrix
Maps the raw material consumption ratios required per finished artisan craft unit.

| Finished Product SKU | Product Name | Batch Size | Required Material | Qty / Unit | Expected Test Outcome |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `SKU-APP-SAMBAL-02` | Sambalpuri Ikat Scarf | 50 Units | `RM-FAB-COTTON`<br>`RM-DYE-NATURAL` | 0.40 KG<br>0.05 L | **Batch Created (201 Created)**<br>Materials reserved cleanly. |
| `SKU-HND-DHOKRA-01` | Dhokra Brass Figurine | 100 Units | `RM-MTL-BRASS` | 0.80 KG | **Blocked (422 Unprocessable)**<br>Deficit: 80kg needed, only 40kg in stock. |

### 3.3 Quality Assurance Parameters & Inspection Standards
Thresholds enforced by the Quality Control module before goods transition to retail inventory.

| Trade Department | Inspection Parameter | Tolerance Limit | Pass Action | Failure / Quarantine Action |
| :--- | :--- | :---: | :--- | :--- |
| **Apparel & Textile** | Weave Density & Dimensional Check | &plusmn; 5.0% Variance | Increment Warehouse 2 Retail Stock (+48) | Route to rework or textile recycling scrap. |
| **Metal Craft & Dhokra** | Casting Surface & Alloy Integrity | &plusmn; 8.0% Variance | Generate EAN-13 retail barcode tags | Quarantine in holding area for re-melting. |
| **Woodworking** | Moisture Content & Joinery Finish | &le; 12.0% Moisture | Release to retail showroom inventory | Hold in seasoning kiln; notify supervisor. |

---

## 4. Commercial POS Retail & Time-Series Forecasting Datasets

### 4.1 POS Product Catalog & Concurrency Stress Fixture (`inventory_pos_test_data.json`)
The product catalog below is specifically curated to validate barcode scanning, statutory GST calculations, and pessimistic row locking under concurrent load.

| EAN-13 Barcode | Product Name | Category | Unit Price | GST Rate | Stock | Concurrency & Test Role |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `8901234567890` | Dhokra Brass Figurine | Tribal Handicrafts | ₹450.00 | 12.0% | **1 Unit** | **Concurrency Stress Target (TC-POS-03):** Simultaneous checkout; verifies `SELECT FOR UPDATE`. |
| `8901234567891` | Sambalpuri Ikat Scarf | Apparel & Textile | ₹850.00 | 5.0% | 25 Units | Standard POS sale flow with 5% textile GST tier. |
| `8901234567892` | Teakwood Desk Organizer | Woodworking | ₹350.00 | 12.0% | **0 Units** | **Zero-Stock Rejection (TC-POS-04):** Tests HTTP 409 Conflict rejection. |
| `8901234567893` | Forest Wild Honey (500g) | Food Processing | ₹280.00 | 5.0% | 50 Units | Food processing category testing 5% agricultural rate. |
| `8901234567894` | Bell Metal Ritual Lamp | Metal Craft | ₹1200.00 | 18.0% | 12 Units | 18% GST tier testing dual Cash + UPI split billing. |

### 4.2 Historical 12-Month Sales Time-Series Dataset for AI Forecasting Engine
Provides ground-truth historical training data to evaluate the Holt-Winters triple exponential smoothing algorithm ($\alpha=0.2, \beta=0.1, \gamma=0.3$) against festival sales spikes.

| Month | Base Trend Demand | Seasonal Factor | Recorded Sales (Units) | Operational Event & Forecast Validation Target |
| :--- | :---: | :---: | :---: | :--- |
| **Oct 2025** | 120 Units | 1.45 (Festival Peak) | 174 Units | Durga Puja & Diwali artisan fair sales spike. |
| **Nov 2025** | 122 Units | 1.30 (Wedding Season) | 158 Units | Post-festival wedding gifting demand surge. |
| **Dec 2025** | 125 Units | 1.10 (Winter Expo) | 138 Units | National tribal exposition craft demand. |
| **Jan 2026** | 128 Units | 0.95 (Post-Winter) | 122 Units | Normalization of seasonal retail purchasing. |
| **Feb 2026** | 130 Units | 0.90 (Off-Season) | 117 Units | Standard baseline academic semester volume. |
| **Mar 2026** | 132 Units | 0.85 (Off-Season) | 112 Units | Annual inventory audit and academic recess. |
| **30-Day Pred** | **135 Units** | **1.35 (Projected)** | **182 &plusmn; 8 Units** | **Holt-Winters Output Target:** Accurately predicts festival surge. |

---

## 5. Database Seeding Scripts, Teardown & Academic Sign-Off

### 5.1 Integration Test Seeding Architecture (`data-test.sql`)
The automated test harness utilizes `data-test.sql` to instantiate a clean relational baseline prior to integration test suite runs.
* **Foreign Key Order Teardown:** Deletions execute in exact dependency sequence (`dbt_disbursements &rarr; sales_orders &rarr; quality_inspections &rarr; production_batches &rarr; attendance &rarr; inventory &rarr; products &rarr; users`) to prevent constraint violations.
* **Identity Sequence Reset:** Auto-incrementing identity columns are explicitly set to predetermined IDs (1 to 5) so that test assertions can query exact entity keys deterministically.
* **Spring Profile Binding:** In `src/test/resources/application-test.yml`, Spring Data JPA is configured with:
  `spring.sql.init.mode=always` and `spring.sql.init.data-locations=classpath:data-test.sql`.

### 5.2 Test Teardown Invariants & Sanitization Policy
* **Atomic Rollback:** Every integration test method executes within a dedicated Spring transaction annotated with `@Transactional`. Any changes made to the database during test execution roll back immediately upon completion.
* **Context Isolation:** Tests that modify Spring application context or static cache instances are marked with `@DirtiesContext` to prevent state leakage into adjacent suites.
* **Production Defense:** Database connection strings are validated during initialization; if the active JDBC URL matches a production hostname or cloud endpoint, the test runner immediately aborts execution.

### 5.3 Specification Verification & Academic Sign-Off Block
This Test Data Specification accurately documents the synthetic test data architecture, DPDP Act 2023 privacy safeguards, and deterministic test fixtures for the KISS Vocational Training Management System (KV-TMS).

| Academic Role | Name & Affiliation | Approval Signature | Sign-Off Date |
| :--- | :--- | :---: | :---: |
| **Project Candidate & Developer** | **Mansi Sinha**, B.Tech CSE | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engg, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |
