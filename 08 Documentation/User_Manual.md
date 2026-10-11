# USER MANUAL & SYSTEM OPERATIONS GUIDE
## KISS Vocational Training Management System (KV-TMS) • Standard Operating Procedure (SOP)

---

**Author & Candidate:** Mansi Sinha (Roll No: 2205160, B.Tech CSE)  
**Institution:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Implementation Partner:** Kalinga Institute of Social Sciences (KISS)  
**Document Reference:** `KV-TMS-UM-08` | **Release:** `v1.0.0-RELEASE` | **Date:** October 8, 2026  
**Audience:** System Administrators, Master Trainers, Student Trainees, Production Supervisors, POS Retail Cashiers  

---

## 1. Executive Summary & Institutional Scope

The KISS Vocational Training Management System (KV-TMS) is a specialized enterprise web application developed to modernize and coordinate vocational instruction, apprentice workshop production, materials warehousing, and commercial retail operations across the Kalinga Institute of Social Sciences. The platform serves over 30,000 indigenous scholars across five premier craft trades: Sewing & Garments, Sambalpuri Handloom, Tribal Bamboo Woodcraft, Terracotta & Pottery, and Organic Food Processing.

> **Key Operational Pillars:**  
> 1. Multi-role authentication with strict Role-Based Access Control (RBAC).  
> 2. Daily practical studio attendance logging enforcing statutory 75% thresholds.  
> 3. Direct Benefit Transfer (DBT) Earn-While-Learn incentive disbursements.  
> 4. Bill of Materials (BOM) recipe automation and dual-warehouse stock integrity.  
> 5. Point-of-Sale (POS) barcode billing with pessimistic stock locking.  
> 6. Machine-learning demand forecasting.  

---

## 2. User Persona Matrix & Role-Based Access Privileges

| User Role | Default Identifier | Primary Operational Responsibilities | Accessible Software Modules |
| :--- | :--- | :--- | :--- |
| **University Administrator** | `KISS-ADM-001` (Mansi Sinha) | System governance, syllabus approval, production batch clearance, user provisioning. | Executive Dashboard, Curriculum Console, User Registration, Stipend Approvals. |
| **Master Instructor / Trainer** | `KISS-FAC-002` (Prof. S. Sinha) | Practical studio instruction, daily biometric attendance, continuous scholar grading. | Faculty Profile, Attendance Marker, Student Roster, Circular Noticeboard. |
| **Student Trainee Scholar** | `KISS-TRN-2026-003` (Bikash Soren) | Practical training, attendance verification, piece-rate incentive ledger monitoring. | Scholar Profile, 75% Attendance Tracker, Exams & DBT Stipend Wallet. |
| **Production Unit Manager** | `KISS-PRD-002` (Rahul Verma) | Workshop scheduling, BOM recipe deductions, apprentice team allocation, QC queues. | Production Line & BOM, Dual Warehouse, Sales Orders, AI Forecaster. |
| **Commercial POS Cashier** | `KISS-POS-001` (Campus Retail) | Customer order booking, barcode scanning, pessimistic stock locks, GST invoice issue. | Sales POS Counter, Inventory Stock Checks, GST Receipt Print Generator. |

---

## 3. System Access Endpoints & Client Prerequisites

* **Supported Web Browsers:** Microsoft Edge 120+, Google Chrome 120+, Mozilla Firefox 125+, Apple Safari 17+.
* **Display Resolution:** Optimized for 1920×1080 (Full-HD); fully responsive down to 375×812 mobile viewports.
* **Portal Access Endpoints:**
  * Public Portal: `http://localhost:4173/?view=home`
  * Multi-Role Login: `http://localhost:4173/?view=login`
  * Authenticated Operations Console: `http://localhost:4173/?view=portal`

---

## 4. Public Information Portal & Campus Landing (Screen 01)

> **Module Identifier:** `MOD-PUB-01` • **Route:** `/?view=home` • **Access Level:** Unauthenticated Public  
> **Screenshot Artifact:** [01_Public_Landing_Portal.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/1)%20Authentication%20%26%20Public%20Portal/01_Public_Landing_Portal.png)

### Step-by-Step User Instructions
1. **Launch Application:** Navigate to the root URL in any modern web browser. The system displays official university credentials, the NAAC Grade ‘A’ institutional seal, and founder Prof. Achyuta Samanta's welcome message.
2. **Explore Vocational Trades:** Scroll to the vocational craft section to inspect active training disciplines (Apparel, Handloom, Bamboo, Terracotta, Food Processing) including course durations, syllabus credits, and workshop studio photos.
3. **Access Academic Portals:** Click the **"Sign In to Portal"** button in the navigation header to open the role-based login screen, or click **"Launch Authenticated Workspace"** to enter authorized modules.

| Interactive Control | Visual Placement | Functional Behavior & Target Destination |
| :--- | :--- | :--- |
| **Go to Home / Website** | Top Header Left | Navigates back to the root institutional showcase page from any public view. |
| **Trade Catalog Cards** | Main Body Center | Expands interactive curriculum cards detailing practical workshop hours and competencies. |
| **Portal Entry CTA** | Top Header Right & Hero Banner | Redirects browser session to the multi-role login interface (`/?view=login`). |

---

## 5. Multi-Role Authentication & Access Control Console (Screen 02)

> **Module Identifier:** `MOD-AUTH-02` • **Route:** `/?view=login` • **Access Level:** Secure Gatekeeper  
> **Screenshot Artifact:** [02_Multi_Role_Login_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/1)%20Authentication%20%26%20Public%20Portal/02_Multi_Role_Login_Console.png)

### Step-by-Step User Instructions
1. **Select Designated Role:** Click the tab matching your institutional assignment: *University Admin*, *Trainer / Faculty*, *Student Trainee*, or *Production Staff*.
2. **Input Credentials:** Enter your official College ID Number (e.g. `KISS-ADM-001`, `KISS-FAC-002`, or `KISS-TRN-2026-003`) and your password. (Examiners may click the one-click demo auto-fill button).
3. **Authorize Session:** Click **"Sign In to Portal"**. The system verifies credentials against the Spring Boot BCrypt password encoder, receives a signed JWT token, and redirects to your authorized role workspace.
4. **Session Persistence:** Verified JWT claims and profile data are stored securely in browser local storage for 24 hours.

| Field / Control Name | Input Specification | Validation Rule & System Response |
| :--- | :--- | :--- |
| **Role Switcher Tabs** | Tab Selector (4 Roles) | Switches active authentication scope and updates field placeholders dynamically. |
| **College ID / Username** | Alphanumeric (e.g. KISS-ADM-001) | Must match registered institutional database ID; sanitizes SQL injection strings. |
| **Password Field** | Masked Character String | Validated via Spring Security `DaoAuthenticationProvider` using BCrypt. |

---

## 6. University Executive Analytics & KPI Command Center (Screen 03)

> **Module Identifier:** `MOD-EXEC-03` • **Route:** `/?view=portal&tab=dashboard` • **Target Persona:** Vice-Chancellor & Admin  
> **Screenshot Artifact:** [03_Executive_Analytics_Dashboard.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/2)%20Administration%20%26%20Executive%20Dashboards/03_Executive_Analytics_Dashboard.png)

### Step-by-Step User Instructions
1. **Audit Institutional Vital Signs:** Inspect the top summary cards for real-time counters: Total Enrolled Scholars (5), Vocational Courses (5), Active Production Batches (7), Raw Material SKUs (10), and Finished Stock (55 units).
2. **Review Commercial Velocity:** Monitor commercial POS sales order volume (2 Orders) and real-time revenue figures.
3. **Track Welfare Disbursals:** Verify the cumulative Direct Benefit Transfer (DBT) apprentice stipends disbursed to tribal scholars.
4. **Access Predictive Analytics:** Click the **"View AI Demand Forecast →"** shortcut button to jump directly to machine learning recommendations.

| Dashboard KPI Card | Current System Value | Database Source & Analytical Purpose |
| :--- | :--- | :--- |
| **Total Enrolled Scholars** | 5 Verified Scholars | Live count of active trainees across all five trades registered in `trainees` table. |
| **Active Raw Materials** | 10 Material SKUs | Live inventory SKUs tracked across both central and workshop store ledgers. |
| **Finished Goods Stock** | 55 Units Ready for Sale | Finished artisan units cleared by administration and available at the retail POS counter. |
| **Commercial Orders** | 2 Orders Logged | Completed and dispatched sales orders recorded in the `sales_orders` registry. |

---

## 7. Central System Administration & Curriculum Console (Screen 04)

> **Module Identifier:** `MOD-ADM-04` • **Route:** `/?view=portal&tab=courses` • **Target Persona:** System Admin (Mansi Sinha)  
> **Screenshot Artifact:** [04_Central_Admin_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/2)%20Administration%20%26%20Executive%20Dashboards/04_Central_Admin_Console.png)

### Step-by-Step User Instructions
1. **Filter & Search Curriculum:** Use the live search bar or filter buttons (All, Active, Deactivated) to locate vocational trades.
2. **Inspect Trade Modules:** Review credit hours, syllabus breakdown, and active scholar enrollment for each trade card.
3. **Register New Vocational Trade:** Click **"+ Add Course with Syllabus"** to launch the curriculum onboarding dialog.
4. **Manage Trade Lifecycle:** Click **"Deactivate"** to temporarily pause admissions or **"Activate"** to resume enrollment.

| Interface Control | Visual State | Functional Operational Procedure |
| :--- | :--- | :--- |
| **Add Course with Syllabus** | Purple Action Button | Opens modal to register trade title, code (VOC-XXX-10X), duration, and module hours. |
| **View Syllabus Drawer** | Outlined Button | Expands the module breakdown table showing individual practical topics and hours. |
| **Activate / Deactivate** | Yellow / Green Toggle | Toggles trade availability in database; deactivated courses hide from trainee enrollment. |
| **Pagination Selector** | Dropdown (4 / page) | Controls displayed card density per page with responsive client-side pagination. |

---

## 8. Master Trainer Studio & Attendance Marker Console (Screen 05)

> **Module Identifier:** `MOD-TRN-05` • **Route:** `/?view=portal&role=trainer&tab=trainer-attendance` • **Persona:** Prof. S. Sinha  
> **Screenshot Artifact:** [05_Trainer_Attendance_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/3)%20Academic%20%26%20Trainee%20Portals/05_Trainer_Attendance_Console.png)

### Step-by-Step User Instructions
1. **Select Training Session Date:** The date defaults to current system date (`2026-10-08`). Use shortcuts *Today* or *Yesterday*.
2. **Review Student Roster:** Inspect all scholars assigned to your trade (Demo, Student2, Bikash Soren, Biram Soren 9225, Arav).
3. **Mark Present / Absent:** Click the green **"PRESENT"** button to toggle status to red **"ABSENT"** as applicable. The top counter updates in real time.
4. **Finalize & Commit to Database:** Click **"Save & Finalize Attendance"**. The records are committed to MySQL table `attendance_records`.

| Console Element | Displayed Value | Business Logic & Compliance Safeguards |
| :--- | :--- | :--- |
| **Trainer Window Lock** | 7-Day Active Period | Instructors can only record/modify attendance within 7 days; older dates require Admin unlock. |
| **Scholar Toggle Button** | PRESENT (Green) / ABSENT | Tactile one-click state toggle. Default state initializes as PRESENT for all enrolled scholars. |
| **Live Attendance Counter** | Present: 5 • Absent: 0 | Instant client-side tally providing immediate visual feedback before transactional commit. |
| **Save & Finalize Action** | Full-width Green CTA | Sends atomic batch JSON payload; recalculates trainee cumulative attendance towards 75%. |

---

## 9. Student Trainee Portal & Welfare DBT Ledger (Screen 06)

> **Module Identifier:** `MOD-STU-06` • **Route:** `/?view=portal&role=trainee&tab=trainee-profile` • **Persona:** Bikash Soren  
> **Screenshot Artifact:** [06_Student_Trainee_Portal_DBT.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/3)%20Academic%20%26%20Trainee%20Portals/06_Student_Trainee_Portal_DBT.png)

### Step-by-Step User Instructions
1. **Verify Scholar Credentials:** Check your permanent Roll Number (`KISS-TRN-2026-003`), enrolled trade (Handicrafts & Tribal Art), joining date, and projected completion date.
2. **Confirm Welfare Status:** Verify that the **"100% Free Education (KISS Trust)"** and **"Active & In-Training"** badges are active.
3. **Track 75% Attendance Compliance:** Navigate to the *Attendance* tab in the left sidebar to audit cumulative attendance. Scholars maintaining ≥75% remain fully eligible for production workshop stipends.
4. **Monitor Earn-While-Learn DBT Ledger:** Click *Stipends & Incentives* to view piece-rate payouts earned from artisan production batches.

| Scholar Card Field | Recorded Value | Institutional Purpose & Trainee Guidance |
| :--- | :--- | :--- |
| **Full Legal Name** | Bikash Soren | Official scholar identity registered with KISS Deemed to be University records. |
| **College Roll Number** | KISS-TRN-2026-003 | Unique permanent key linked to all academic, attendance, and DBT banking transactions. |
| **Enrolled Trade** | VOC-ART-102 (Handicrafts) | Designates active practical workshop lab, assigned master instructor, and syllabus track. |
| **Print Identity Card** | Green Action Button | Generates a standardized printable scholar identity card with barcode and NAAC credentials. |

---

## 10. Vocational Production Line & Bill of Materials (BOM) (Screen 07)

> **Module Identifier:** `MOD-PRD-07` • **Route:** `/?view=portal&role=production&tab=production` • **Persona:** Rahul Verma  
> **Screenshot Artifact:** [07_Vocational_Production_BOM.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/4)%20Manufacturing%20%26%20Inventory/07_Vocational_Production_BOM.png)

### Step-by-Step User Instructions
1. **Select Active Workshop Lab:** Choose from the 5 specialized workshops (e.g. *Workshop Lab #1: Sewing & Textiles*).
2. **Review Standard BOM Recipe:** Inspect the material requirements per finished unit (Pure Cotton Fabric: 2.5m/unit; Wooden Buttons: 4 pcs/unit) alongside live store stocks.
3. **Schedule Production Batch:** Enter target production quantity. The system automatically formats the batch code (e.g. `BATCH-2026-SEW-003`), calculates total working hours (18 Hours for 10 units), and suggests apprentice team size (3 Scholars).
4. **Launch & Reserve Materials:** Click **"Auto Material Deduct"** to launch the batch. Required raw materials are reserved from the warehouse.

| Shop Floor Control | Configured Value | Automated System Action & Shop Floor Impact |
| :--- | :--- | :--- |
| **Batch Code Auto-Format** | BATCH-2026-SEW-003 | Generates unique batch identifier encoding craft code, calendar year, and run sequence. |
| **BOM Recipe Calculation** | 2.5m Fabric + 4 Buttons | Calculates exact materials required; blocks launch if warehouse stock is insufficient. |
| **Apprentice Team Size** | 3 Recommended Scholars | Balances work-in-progress to ensure all scholars log verified practical workshop hours. |
| **Estimated Time Limit** | 18 Working Hours (~3 Days) | Calculates completion target based on empirical apprentice throughput rates. |

---

## 11. Dual-Warehouse Materials & Finished Stock Inventory (Screen 08)

> **Module Identifier:** `MOD-INV-08` • **Route:** `/?view=portal&tab=inventory` • **Target Persona:** Warehouse Head & Admin  
> **Screenshot Artifact:** [08_Dual_Warehouse_Inventory.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/4)%20Manufacturing%20%26%20Inventory/08_Dual_Warehouse_Inventory.png)

### Step-by-Step User Instructions
1. **Inspect Raw Materials Vault:** Review the left panel tracking 10 Raw Material SKUs (Cotton Fabric, Buttons, Silk Yarn, Bamboo Stalks, Clay, Food Ingredients) categorized across the 5 workshop craft lines.
2. **Verify Reorder Thresholds:** Confirm that material levels are marked with green *Adequate* tags or amber *Low Stock* warnings.
3. **Inward Restocking:** Click **"+ Inward / Restock Material"** to record supplier deliveries and update store ledger balances.
4. **Audit Finished Goods Ready for Sale:** The right panel displays quality-cleared finished products (55 total units, valuation ₹41,600) ready for commercial POS billing: Handcrafted Kurtis (38 pcs), Sambalpuri Stoles (7 pcs), Bamboo Lamps (10 pcs).

| Inventory Ledger | Current Stock Units | Operational Management Guidelines |
| :--- | :--- | :--- |
| **Pure Cotton Fabric** | 312.5 Meters on Hand | BOM Recipe: 2.5m/unit. Minimum reorder threshold: 50m. Unit cost: ₹120.00. |
| **Wooden Buttons** | 540 Pieces on Hand | BOM Recipe: 4 pcs/unit. Minimum reorder threshold: 100 pcs. Unit cost: ₹5.00. |
| **Handcrafted Cotton Kurti** | 38 Finished Units | Commercial MRP: ₹650.00. Valuation: ₹24,700. Buffer Safety threshold: 5 pcs. |
| **Sambalpuri Stole** | 7 Finished Units | Commercial MRP: ₹1200.00. Valuation: ₹8,400. Quality inspection cleared. |

---

## 12. Commercial Sales Order & Retail POS Terminal (Screen 09)

> **Module Identifier:** `MOD-POS-09` • **Route:** `/?view=portal&tab=sales` • **Target Persona:** POS Counter Cashier  
> **Screenshot Artifact:** [09_POS_Retail_Counter_Billing.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/5)%20Commercial%20POS%20Retail/09_POS_Retail_Counter_Billing.png)

### Step-by-Step User Instructions
1. **Verify Available Warehouse Stock:** The terminal indicates live warehouse clearance (e.g. *Stock Available: 38 Units*).
2. **Enter Customer Information:** Input Customer / Organization Name, 10-digit mobile number, email, and delivery address.
3. **Select Finished Product & Quantity:** Choose from cleared artisan products (e.g. Handcrafted Cotton Kurti @ ₹650.00). Use ± steppers to adjust order quantity. The system automatically computes total payable amount and remaining stock balance.
4. **Confirm Order & Lock Inventory:** Click the confirmation button to book the order. The system applies a pessimistic lock to decrement warehouse stock atomically.

| Terminal Form Field | Input Format | Transaction Validation & Inventory Lock Logic |
| :--- | :--- | :--- |
| **Customer Name** | Text (e.g. Tribal Exhibition) | Required field; mapped to the retail buyer registry in `customers` table. |
| **Contact Phone** | 10-Digit Numeric | Validates Indian mobile format; used for SMS dispatch notifications. |
| **Order Quantity** | Positive Integer | Capped at live warehouse stock; prevents overselling or inventory overdrafts. |
| **Scheduled Dispatch Date** | Date Picker | Sets handover milestone; flagged in warehouse order fulfillment queue. |

---

## 13. GST Tax Invoice Generation & Receipt Printing (Screen 10)

> **Module Identifier:** `MOD-INV-10` • **Route:** `/?view=portal&tab=sales&invoice=1` • **Target Persona:** Cashier & Auditor  
> **Screenshot Artifact:** [10_GST_Tax_Invoice_Receipt.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/5)%20Commercial%20POS%20Retail/10_GST_Tax_Invoice_Receipt.png)

### Step-by-Step User Instructions
1. **Open Invoice Modal:** In the Sales POS order history, click **"View Details"** on any booked order. The invoice dialog opens with backdrop blur.
2. **Verify Order Reference:** Confirm the unique system order code (e.g. `ORD-1791010251290`) and client dispatch status (*Dispatched to Client*).
3. **Audit Line Items & Tax Totals:** Inspect itemized product descriptions (Sambalpuri Handloom Stole × 3), unit prices (₹1200.00), and grand total invoiced (₹3600.00).
4. **Print Customer Receipt:** Click **"Print Receipt"** to trigger standard 80mm thermal receipt or A4 invoice printing. Click **"Close"** to exit.

| Invoice Component | Sample Value | Audit Compliance & Legal Receipt Requirements |
| :--- | :--- | :--- |
| **Order Reference ID** | ORD-1791010251290 | Permanent unique transaction reference formatted for institutional auditing. |
| **Customer Information** | KISS Tribal Craft Exhibition | Includes mobile number (9876543210), email, and pavilion stall delivery address. |
| **Itemized Product Table** | Stole × 3 @ ₹1200.00 | Itemized description, SKU (PRD-SAM-02), quantity, and calculated subtotal. |
| **Grand Total Invoiced** | ₹3,600.00 | Inclusive statutory total; recorded in executive dashboard revenue ledgers. |

---

## 14. AI Demand Forecasting & "What-If" Simulation (Screen 11)

> **Module Identifier:** `MOD-AI-11` • **Route:** `/?view=portal&tab=forecast` • **Target Persona:** Production Planner  
> **Screenshot Artifact:** [11_Holt_Winters_Demand_Forecasting.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/6)%20AI%20Forecasting%20%26%20Intelligence/11_Holt_Winters_Demand_Forecasting.png)

### Step-by-Step User Instructions
1. **Select Target Craft Product:** Choose a product SKU from the dropdown (e.g. *Handcrafted Cotton Kurti [PRD-KURTI-01]*).
2. **Analyze Predictive Model Outputs:** Review the Predicted Demand metric (6 Units / Period, 88% Confidence), Safety Buffer (+1 Unit cushion), and Live Warehouse Stock (38 Units on hand).
3. **Review Automated Decision Advisory:** The system evaluates the mathematical reorder formula: `Q_reorder = max(0, (6 + 1) - 38) = 0`. The AI advises that current inventory is sufficient, preventing capital tie-up.
4. **Run Interactive "What-If" Simulations:** Move the simulated market demand slider (1 to 50 units) to test exhibition spikes and observe instantaneous recalculation of recommended batch quantities.

| Forecasting Parameter | Algorithm / Value | Mathematical Formula & Decision Support Impact |
| :--- | :--- | :--- |
| **Predictive Analytics Engine** | OLS Regression + Smoothing | Ordinary Least Squares trend analysis paired with exponential weight smoothing. |
| **Reorder Mathematical Law** | Q = max(0, (D + B) - S) | Reorder quantity equals projected demand plus safety buffer minus stock on hand. |
| **Autonomous Recommendation** | 0 Units Needed | Prevents unnecessary production runs when finished stock comfortably covers demand. |
| **Interactive Market Simulator** | Dynamic Slider (1-50 Units) | Allows production managers to simulate festival surges and pre-schedule apprentice teams. |

---

## 15. System Administration, Maintenance & Troubleshooting Guide

### 15.1 Frequently Encountered Operational Scenarios & Resolutions

| Observed Symptom | Root Operational Cause | Prescribed Step-by-Step Resolution |
| :--- | :--- | :--- |
| **Attendance Date Disabled** | Session date exceeds the 7-day retrospective trainer editing window. | Request an administrative override from the System Administrator (Mansi Sinha) to unlock the historical session in `attendance_records`. |
| **POS Insufficient Stock Error** | Requested quantity exceeds available finished goods in warehouse. | Check *Dual Warehouse* tab to confirm stock balance; submit a production batch work order or reduce order quantity. |
| **JWT Authentication Expired** | The 24-hour browser security session token has lapsed. | Click **"Logout"** in the header and re-authenticate via the multi-role login screen (`/?view=login`). |
| **BOM Launch Blocked** | Warehouse raw material stock is lower than recipe requirements. | Inward fresh raw materials via the *Dual Warehouse → Inward / Restock Material* dialog before scheduling batch. |

### 15.2 Routine System Maintenance & Backup Directives
* **Database Backups:** Execute nightly MySQL logical dumps: `mysqldump -u root -p kvtms_db > backup_YYYYMMDD.sql`.
* **Audit Log Reviews:** Periodically review Spring Boot access logs to verify role-based authorization integrity and prevent privilege escalation.
* **Helpdesk Contacts:** KV-TMS Central Operations • Email: `admin.testing@kiss.ac.in` • Campus Helpdesk: Vocational Training Directorate, KISS Bhubaneswar.

---

## 16. Formal Academic Certification & Operational Sign-Off

I hereby certify that this User Manual accurately describes the operational workflows, role access boundaries, and interface behaviors of the KISS Vocational Training Management System (KV-TMS) as implemented and verified for my B.Tech Computer Science & Engineering capstone project.

| Academic Role | Name & Affiliation | Approval Signature | Sign-Off Date |
| :--- | :--- | :--- | :--- |
| **Project Candidate & Developer** | Mansi Sinha, B.Tech CSE (Roll: 2205160) | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engineering, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |

---
*KV-TMS v1.0.0-RELEASE • School of Computer Science & Engineering, KIIT Deemed to be University • Kalinga Institute of Social Sciences (KISS)*
