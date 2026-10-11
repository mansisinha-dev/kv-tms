# KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)
### Decoupled 3-Tier Enterprise Platform for Vocational Education, Dual-Warehouse Supply Chains, POS Retail & Applied AI Demand Forecasting

```
========================================================================================
   _  ___     __   _____ __  __ ____    _   _ _   _ _____ _   _ _____ ____  ____ _____ _____ 
  | |/ /\ \   / /  |_   _|  \/  / ___|  | | | | \ | |_   _| | | | ____|  _ \/ ___|_   _|_   _|
  | ' /  \ \ / /____ | | | |\/| \___ \  | | | |  \| | | | | | | |  _| | |_) \___ \ | |   | |  
  | . \   \ V /_____|| | | |  | |___) | | |_| | |\  | | | | |_| | |___|  _ < ___) || |   | |  
  |_|\_\   \_/       |_| |_|  |_|____/   \___/|_| \_| |_|  \___/|_____|_| \_\____/ |_|   |_|  
========================================================================================
```

---

## 🎓 ACADEMIC SUBMISSION METADATA

- **Candidate Name:** Mansi Sinha
- **Roll Number:** `2205160`
- **Degree Program:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)
- **School:** School of Computer Science & Engineering
- **University:** KIIT Deemed to be University, Bhubaneswar, Odisha, India
- **Partner Institution:** Kalinga Institute of Social Sciences (KISS)
- **Academic Session:** 2025 – 2026
- **Submission Type:** B.Tech Major Capstone Project Repository & Viva Voce Submission

---

## 🏛️ INSTITUTIONAL CONTEXT & SOCIETAL MISSION

The **Kalinga Institute of Social Sciences (KISS)** is the world's largest free residential educational institution for indigenous tribal children, home to over 30,000 students representing 62 distinct tribes (including 13 Particularly Vulnerable Tribal Groups / PVTGs). 

Alongside comprehensive academic schooling (KG to PG), KISS operates vocational trade workshops across:
- **Tailoring & Apparel Fabrication**
- **Traditional Handloom Weaving**
- **Bamboo & Wood Craft Carving**
- **Terracotta & Pottery Art**
- **Food Processing & Agro-packaging**

Under the institutional **Earn While You Learn (EWYL)** mandate, student artisans participate in production workshops, earning financial stipends credited directly to their bank accounts to support their families. Finished goods are sold through campus showrooms and national cultural exhibitions.

**KV-TMS** replaces legacy paper ledgers and disconnected spreadsheets with an enterprise-grade platform unifying student academic progress, raw material allocation, workshop manufacturing, high-concurrency retail showroom sales, and algorithmic Direct Benefit Transfer (DBT) stipend disbursements.

---

## 📁 COMPLETE SUBMISSION REPOSITORY STRUCTURE (01 to 10)

This repository is organized into ten standardized submission modules:

```
KISS Vocational Training Management System/
│
├── 01 SRS/                                   # Software Requirements Specification
│   ├── KISS Vocational Training Management System SRS.docx (72 Pages, Comprehensive IEEE-830 Specification)
│   ├── KISS Vocational Training Management System SRS.pdf  (1.01 MB)
│   └── KISS Vocational Training Management System SRS.md   (Full source)
│
├── 02 Requirements/                          # Requirements Engineering & Traceability
│   ├── KV-TMS Requirements Document.docx    # 12 Pages (FRs, NFRs, RTM, Domain Rules)
│   ├── KV-TMS Requirements Document.pdf     # (312 KB)
│   └── KV-TMS Requirements Document.md      # (Full source)
│
├── 03 System Design/                         # High-Resolution Architectural & Visual Models
│   ├── Architecture/                         # System Architecture (PNG, PUML, Draw.io)
│   │   ├── KV-TMS System Architecture.png   # Full 3-Tier Multi-Layer Topology
│   │   ├── KV-TMS System Architecture.puml  # PlantUML source
│   │   └── KV-TMS System Architecture.drawio# Editable vector XML
│   ├── DFD/                                  # Data Flow Diagrams
│   │   ├── KV-TMS DFD Level 0.png           # Level 0 Global Context Diagram
│   │   ├── KV-TMS DFD Level 1.png           # Level 1 Decomposition (Proc 1.0 to 14.0, Stores D1-D9)
│   │   └── Sources (.puml & .drawio)
│   ├── UML/                                  # Unified Modeling Language Suite
│   │   ├── KV-TMS Use Case Diagram.png      # 4 Actors, 12 Use Cases, <<include>> links
│   │   ├── KV-TMS Class Diagram.png         # 4 Packages, Domain entities & DTOs
│   │   ├── KV-TMS Sequence 01 - Auth.png    # JWT stateless authentication handshake
│   │   ├── KV-TMS Sequence 02 - Attendance.png # 75% rule evaluation sequence
│   │   ├── KV-TMS Sequence 03 - Production.png # BOM deduction & QA sequence
│   │   ├── KV-TMS Sequence 04 - POS.png     # Pessimistic locking & GST billing
│   │   └── Sequence sources (.puml & .drawio)
│   └── ER Diagram/                           # Entity-Relationship Modeling
│       ├── KV-TMS_ER_Diagram.png             # Full 3NF ER Diagram (13 Relational Tables)
│       └── KV-TMS_ER_Diagram.puml            # PlantUML source
│
├── 04 Database/                              # Production SQL Scripts & DDL/DML Schemas
│   ├── schema.sql                            # Complete DDL: 13 tables, indexes, constraints
│   ├── seed_data.sql                         # Realistic DML: 50+ records across all trades
│   └── data_dictionary.md                   # Field-by-field schema reference
│
├── 05 Software/                              # Fully Executable Source Code
│   ├── backend/                              # Java 17 / Spring Boot 3.2.0 REST API
│   │   ├── src/main/java/com/kiss/kvtms/     # 4 Domain packages: security, academic, production, commercial
│   │   ├── pom.xml                           # Maven dependencies (Spring Boot, Security 6, JPA, JaCoCo)
│   │   └── application.properties            # MySQL connection pool, JWT secret, logging
│   └── frontend/                             # React 18 / Vite 5 / Tailwind CSS SPA
│       ├── src/components/                   # UI Modules: Auth, Admin, Workshop, POS, Portal
│       ├── package.json                      # NPM dependencies (React, Vite, Lucide, Axios)
│       └── tailwind.config.js                # Institutional theme palette
│
├── 06 Testing/                               # Software Testing Life Cycle (STLC)
│   ├── KV-TMS Testing Document.docx          # 9 Pages (IEEE 829 Standard Test Plan)
│   ├── KV-TMS Testing Document.pdf           # (260 KB)
│   ├── KV-TMS Testing Document.md            # (Full source)
│   └── test_suites/                          # JUnit 5 automated test classes (37 test cases)
│
├── 07 Screenshots/                           # Full-HD UI Showcase (11 Screenshots across 5 Workflows)
│   ├── 1) Authentication & Public Portal/   # Public landing portal & JWT login screen
│   ├── 2) Administration & Executive Dashboards/ # Executive KPI metrics & course setup
│   ├── 3) Trainee Management & Attendance/   # Attendance ingestion & 75% eligibility badge
│   ├── 4) Manufacturing & Inventory/         # Dual-warehouse stock & BOM work orders
│   └── 5) Commercial POS Retail/             # Barcode POS terminal & GST tax invoice
│
├── 08 Documentation/                         # Academic Master Reports & Technical Guides
│   ├── Final_Project_Report.docx (20 Pages, 8 physically embedded diagrams, 1,061.7 KB)
│   ├── Final_Project_Report.pdf  (20 Pages, 1.71 MB)
│   ├── System_Design_Document.docx (15 Pages, 16 physically embedded diagrams, 1,541.7 KB)
│   ├── System_Design_Document.pdf  (15 Pages, 2.58 MB)
│   ├── User_Manual.docx (13 Pages, 11 embedded Full-HD screenshots, 3,564.2 KB)
│   ├── User_Manual.pdf  (13 Pages, 2.20 MB)
│   ├── Installation_Guide.docx (5 Pages, 163 KB) & .pdf
│   ├── Software_Documentation.docx (6 Pages, 188 KB) & .pdf
│   ├── Testing_Document.docx (9 Pages, 260 KB) & .pdf
│   └── Source markdown (.md) documents
│
├── 09 Handwritten Material/                  # 15-Page Work Diary & 13 Topical Outline Subfolders
│   ├── Handwritten_Project_Work_Diary.docx   # Exactly 15 Pages, 6 embedded diagrams (715 KB)
│   ├── Handwritten_Project_Work_Diary.pdf    # (1.3 MB)
│   ├── Handwritten_Project_Work_Diary.md     # (Full source)
│   ├── 01_Project_Introduction/ through 13_Project_Notes/ # 13 modular drafting chapters
│   └── Embedded visual draft PNGs
│
└── 10 Presentation/                          # Viva Voce Defense Deck & Examiner Preparation Guide
    ├── Final_Project_Presentation.pptx       # 20 Widescreen 16:9 Slides with embedded diagrams (2.38 MB)
    ├── Final_Project_Presentation.pdf        # (2.20 MB)
    ├── Presentation_Speaker_Notes_and_Viva_Guide.docx # Complete slide scripts & 25 Q&As (37.2 KB)
    ├── Presentation_Speaker_Notes_and_Viva_Guide.pdf  # (278.2 KB)
    └── Presentation_Speaker_Notes_and_Viva_Guide.md   # (Full source)
```

---

## ⚡ CORE ENGINEERING HIGHLIGHTS

### 1. Concurrency Safety & Pessimistic Write Locking (Defect BUG-001 Resolution)
In high-volume retail showroom checkout scenarios, concurrent threads attempting to purchase the last available craft unit could oversell inventory past zero. We enforced row-level pessimistic write locking at the persistence layer:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT i FROM InventoryItem i WHERE i.id = :id AND i.warehouseType = 'WH2_FG'")
Optional<InventoryItem> findByIdForUpdate(@Param("id") Long id);
```
Verified via Apache JMeter under 50 concurrent threads: exactly 1 thread acquired the lock and committed; 49 threads were safely rejected with `HTTP 409 Conflict`. Zero inventory leakage.

### 2. Elimination of Floating-Point Drift in Academic Attendance
To evaluate the statutory 75% minimum attendance requirement without IEEE 754 binary floating-point rounding errors (where `0.749999999` could disqualify an eligible student), attendance is calculated strictly via Java `BigDecimal`:
```java
BigDecimal present = BigDecimal.valueOf(totalPresentDays);
BigDecimal total = BigDecimal.valueOf(totalWorkingDays);
BigDecimal rate = present.divide(total, 4, RoundingMode.HALF_UP);
boolean isEligible = rate.compareTo(new BigDecimal("0.7500")) >= 0;
```

### 3. Atomic Bill of Materials (BOM) Stock Deduction
Raw material reservation occurs within an ACID `@Transactional` boundary preventing inventory starvation:
$$\Delta Q_{raw,i} = Q_{batch} \times BOM\_Ratio_i \times (1 + ScrapRate_i)$$
A pre-flight verification asserts:
$$\forall i, \quad Q_{available,i} \ge \Delta Q_{raw,i}$$
If any component is insufficient, the transaction rolls back cleanly with zero database side-effects.

### 4. Applied AI Demand Forecasting & Reorder Point (ROP) Calculation
An in-engine statistical linear regression module computes optimal replenishment points based on historical showroom sales:
$$\beta_1 = \frac{\sum_{i=1}^N (t_i - \bar{t})(Y_i - \bar{Y})}{\sum_{i=1}^N (t_i - \bar{t})^2}, \quad \beta_0 = \bar{Y} - \beta_1 \cdot \bar{t}$$
$$ROP = (\bar{d} \times L) + SS$$
Automatically alerts administrators when finished craft stock in Warehouse 2 requires batch production scheduling.

---

## 📊 SOFTWARE TESTING SCORECARD & QUALITY GATE (IEEE 829)

- **Total Automated Test Cases:** 37 / 37 Passed (100% Pass Rate)
- **JaCoCo Line Code Coverage:** 88.41% (3,050 / 3,450 lines) [Target SLA: $\ge 85.0\%$]
- **JaCoCo Branch Coverage:** 84.08% (412 / 490 branches) [Target SLA: $\ge 80.0\%$]
- **JMeter Stress Latency (50 Users):** Average 38.2 ms | P95 Latency: 95.0 ms [SLA: $< 500$ ms]
- **Unhandled Error Rate under Stress:** 0.00%
- **Defects Investigated & Closed:** 6 / 6 (BUG-001 through BUG-006)

---

## 🚀 QUICK-START INSTRUCTIONS FOR EXAMINERS

### Prerequisites:
- Java Development Kit (JDK) 17 or higher
- Apache Maven 3.8+
- MySQL Server 8.0+
- Node.js 18+ & NPM

### Step 1: Database Initialization
```bash
mysql -u root -p < "04 Database/schema.sql"
mysql -u root -p < "04 Database/seed_data.sql"
```

### Step 2: Launch Backend API (Port 8080)
```bash
cd "05 Software/kv-tms"
.\mvnw.cmd spring-boot:run
```
*API Base URL: `http://localhost:8080/api/v1`*  
*Swagger Documentation: `http://localhost:8080/swagger-ui.html`*

### Step 3: Launch Frontend Application (Port 5173)
```bash
cd "05 Software/frontend"
npm install
npm run dev
```
*Web Application Portal: `http://localhost:5173`*

### Default User Personas for Demonstration (Password Rule: `[College_ID]@123`):
| Role / Persona | College ID | Email | Password | Access Scope |
| :--- | :--- | :--- | :---: | :--- |
| **Administrator** | `KISS-ADM-001` | `admin@kiss.ac.in` | `KISS-ADM-001@123` | Executive oversight, approvals, DBT exports |
| **Faculty Trainer** | `KISS-FAC-001` | `trainer@kiss.ac.in` | `KISS-FAC-001@123` | Studio workshops, daily attendance, scholar grading |
| **Production Unit** | `KISS-PRD-001` | `production@kiss.ac.in` | `KISS-PRD-001@123` | BOM calculations, manufacturing batches, retail stock |
| **Vocational Scholar** | `KISS-TRN-2026-001` | `laxman.majhi@kiss.ac.in` | `KISS-TRN-2026-001@123` | Trainee portal, 75% attendance badge, stipend advice |

---

## 🔒 SECURITY & UNBLOCK AUDIT

All `.docx`, `.pdf`, `.pptx`, `.sql`, and script files in this repository have been cryptographically unblocked via PowerShell:
```powershell
Get-ChildItem -Path "." -Recurse | Unblock-File
```
Files can be opened directly across Windows Microsoft Office 2016/2019/2021/365, Adobe Acrobat Reader, and modern web browsers without security zone warnings.

---

*Submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science & Engineering, KIIT Deemed to be University, Bhubaneswar.*
