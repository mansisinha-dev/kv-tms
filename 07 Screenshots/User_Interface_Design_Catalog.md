# USER INTERFACE DESIGN CATALOG & SPECIFICATION
## KISS Vocational Training Management System (KV-TMS) • Enterprise Frontend Architecture

---

**Author & Candidate:** Mansi Sinha (Roll No: 2205160, B.Tech CSE)  
**Institution:** School of Computer Science & Engineering, KIIT Deemed to be University  
**Implementation Partner:** Kalinga Institute of Social Sciences (KISS)  
**Document Reference:** `KV-TMS-UI-SPEC-07` | **Version:** 1.0.0-RELEASE | **Date:** October 8, 2026  
**Standards Compliance:** WCAG 2.1 AA / Responsive HTML5 / React 18 SPA Architecture  

---

## 1. UI/UX Architecture & Institutional Design Philosophy

The Kalinga Institute of Social Sciences Vocational Training Management System (KV-TMS) user interface is engineered to bridge enterprise academic oversight with accessible, human-centric workflows tailored for tribal students, master artisans, and academic administrators. Operating across five specialized operational disciplines (Sewing & Apparel, Sambalpuri Handloom, Tribal Bamboo Woodcraft, Terracotta & Pottery, and Food Processing), the interface enforces clean visual hierarchies, unambiguous typography, and high-contrast color standards to eliminate operational cognitive load.

> **Frontend Architectural Foundations:**  
> Built upon **React 18.2** and **Vite 5** utilizing a modular Single Page Application (SPA) paradigm. State is coordinated via asynchronous Axios interceptors connecting to the Spring Boot 3 RESTful microservices tier. Component styling leverages **Tailwind CSS 3.4** utility architectures with **Lucide-React** iconography and **Recharts 2.12** for executive data visualizations.

---

## 2. Design System Tokens, Color Palette & Typography

The design system is anchored in official institutional colors that reflect academic prestige and the rich indigenous heritage of Odisha. Every token complies strictly with WCAG 2.1 Level AA color contrast ratios (minimum 4.5:1 for body copy and 7:1 for headers).

| Design Token | Hex Value | Role / Surface | Institutional Context & Accessibility Verification |
| :--- | :--- | :--- | :--- |
| **KISS Indigo (Primary)** | `#2D3591` | Primary Brand & Nav | Main navigation bars, headers, primary action buttons, and active tabs. Contrast ratio 8.4:1 against white background. |
| **Heritage Ochre (Accent)** | `#B45309` | Accent & Production | Highlights vocational shop-floor notices, craft metrics, and pending administrative authorizations. Contrast ratio 4.9:1. |
| **Forest Emerald (Success)** | `#006837` | Clearance & Disbursal | Approved batches, attendance confirmation badges, and completed Direct Benefit Transfer (DBT) payouts. Ratio 6.2:1. |
| **Neutral Canvas** | `#F8FAFC` | Workspace Canvas | Low-glare background surface designed to minimize visual fatigue during prolonged data-entry operations. |
| **Slate Charcoal (Text)** | `#1E293B` | Primary Typography | High-legibility text color for all functional tables, data inputs, and system notifications. Contrast ratio 14.2:1. |

---

## 3. Typography Hierarchy, Layout Grid & WCAG Accessibility Compliance

Typography employs the *Segoe UI*, *Calibri*, and *Inter* geometric sans-serif family, optimized for cross-platform rendering across Windows and mobile operating systems. The layout utilizes a 12-column responsive flex grid with fixed left navigation drawers and fluid, independent content scrolling zones.

* **H1 Page Display:** 24px (1.5rem) SemiBold • Color: `#2D3591` • Primary module workspace headers.
* **H2 Section Headers:** 18px (1.125rem) SemiBold • Color: `#1E293B` • Sub-panel and data grid divisions.
* **Body Copy & Table Cells:** 13px (0.8125rem) Regular • Color: `#334155` • Standard density functional text.
* **Micro-Badges & Metadata:** 11px (0.6875rem) Bold Uppercase • High-contrast status badges (Active, Dispatched, Approved).
* **Keyboard Accessibility & Screen Readers:** Full ARIA semantic tagging (`aria-label`, `role="tab"`, `aria-live="polite"`), focus rings with 2px solid `#2D3591` outline, and keyboard tab-indexing across all modal interfaces.

---

## 4. Authentication & Public Information Architecture (Screens 01 & 02)

Public-facing and entry interfaces are engineered to welcome scholars, guardians, and university visitors while maintaining strict cryptographic role-based access control (RBAC) boundaries for registered stakeholders.

| Screen ID & File | Route & Viewport | User Roles / Audience | Functional Components, Data Bindings & UI Interactions |
| :--- | :--- | :--- | :--- |
| **Screen 01:**<br>[01_Public_Landing_Portal.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/1)%20Authentication%20%26%20Public%20Portal/01_Public_Landing_Portal.png) | `/?view=home`<br>1920×1080 Full-HD | General Public, Tribal Trainees, University Guests | **Institutional Showcase:** Official KISS Deemed to be University banner, Founder Prof. Achyuta Samanta welcome address, NAAC Grade ‘A’ accredited branding, 5 vocational trade stream cards with live course hours, direct "Launch Authenticated Workspace" and "Sign In to Portal" action buttons. |
| **Screen 02:**<br>[02_Multi_Role_Login_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/1)%20Authentication%20%26%20Public%20Portal/02_Multi_Role_Login_Console.png) | `/?view=login`<br>1920×1080 Full-HD | Admin, Trainer, Trainee, Production, POS Staff | **Enterprise Multi-Role Authentication:** Dynamic tab selector toggling role archetypes, College Roll Number / Email validator, BCrypt encrypted password input, "Demo Auto-Fill" convenience helper for examiners, JWT authentication session token persistence in `localStorage`, instant error toast on credential mismatch. |

---

## 5. Executive Governance & Central Administrative Consoles (Screens 03 & 04)

The administrative workspace serves as the operational nerve center for university governance, student records, and vocational curriculum management.

| Screen ID & File | Route & Viewport | User Roles / Audience | Functional Components, Data Bindings & UI Interactions |
| :--- | :--- | :--- | :--- |
| **Screen 03:**<br>[03_Executive_Analytics_Dashboard.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/2)%20Administration%20%26%20Executive%20Dashboards/03_Executive_Analytics_Dashboard.png) | `/?view=portal&tab=dashboard`<br>1920×1080 Full-HD | Vice-Chancellor, Registrar, System Admin (Mansi Sinha) | **Executive KPI Command Center:** 8 real-time aggregated metrics sourced from `/api/v1/reports/executive-dashboard` (Total Enrolled Scholars: 5, Active Courses: 5, Raw Material SKUs: 10, Finished Stock: 55 units, Total POS Orders: 2, Revenue: ₹0.00, Stipends Paid: ₹0.00). Recharts interactive visual graphs, quick-navigation links to AI demand forecaster. |
| **Screen 04:**<br>[04_Central_Admin_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/2)%20Administration%20%26%20Executive%20Dashboards/04_Central_Admin_Console.png) | `/?view=portal&tab=courses`<br>1920×1080 Full-HD | University System Administrator, Academic Dean | **Vocational Curriculum & User Master:** Interactive course catalog cards (Sewing, Handicrafts, Food Processing, Carpentry) displaying credit hours, active syllabus modules preview, enrolled scholar counter, "Add Course with Syllabus" modal trigger, live search filter bar, and active/deactivate toggle controls. |

> **Administrative Role-Based Security Controls:**  
> All administrative viewports implement route-level guards verifying the `ROLE_ADMIN` JWT claim. Unauthorized access attempts trigger automated redirection to the public portal accompanied by audit logging in the backend security interceptor.

---

## 6. Master Trainer Studio & Attendance Marker Console (Screen 05)

The Trainer Console provides vocational instructors with dedicated tools to track daily studio attendance, log apprentice practical marks, and manage course syllabi in real time.

> **Screen 05 Technical Metadata:**  
> **File:** [05_Trainer_Attendance_Console.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/3)%20Academic%20%26%20Trainee%20Portals/05_Trainer_Attendance_Console.png) • **Route:** `/?view=portal&role=trainer&tab=trainer-attendance`  
> **Active Instructor Persona:** Prof. S. Sinha (`KISS-FAC-002`), Master Instructor • **Department:** Handicrafts & Tribal Art (VOC-ART-102)  
> **Backend Data Sync:** Spring Boot REST endpoint `/api/v1/attendance` mapped to MySQL table `attendance_records`.

| UI Component / Area | Visual Controls | Operational Logic & Verification Safeguards |
| :--- | :--- | :--- |
| **Faculty Verification Header** | Instructor Badge • NAAC ‘A’ Accredited Seal • Sync Trigger | Displays authenticated instructor credentials, trade specialization, active scholar count (5 Scholars), and real-time database connection status badge. |
| **Daily Practical Attendance Marker** | Calendar Date Picker • "Today" / "Yesterday" Shortcuts • Live Status Tally | Controls the recording date (defaults to current system date). Enforces a strict 7-day retrospective edit window; earlier historical dates require administrative override. Displays instant Present (5) / Absent (0) counters. |
| **Apprentice Scholar Roster** | Interactive Scholar Cards • One-Click Status Buttons | Lists enrolled scholars (Demo, Student2, Bikash Soren, Biram Soren 9225, Arav) with trade mappings. Instructors toggle Present/Absent via high-contrast tactile buttons with zero page reload. |
| **Finalization Action Bar** | Sticky Green Action Button: "Save & Finalize Attendance" | Dispatches batch JSON payload to backend. Commits transactional records and recalculates trainee cumulative attendance percentages against statutory 75% thresholds. |

---

## 7. Student Trainee Self-Service & Direct Benefit Transfer (DBT) Portal (Screen 06)

The Trainee Portal empowers tribal scholars with transparent visibility into their academic progression, attendance compliance, and direct financial incentives earned through vocational production.

> **Screen 06 Technical Metadata:**  
> **File:** [06_Student_Trainee_Portal_DBT.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/3)%20Academic%20%26%20Trainee%20Portals/06_Student_Trainee_Portal_DBT.png) • **Route:** `/?view=portal&role=trainee&tab=trainee-profile`  
> **Enrolled Scholar Persona:** Bikash Soren (`KISS-TRN-2026-003`) • **Institutional Category:** Scheduled Tribe (KISS Scholar)  
> **Welfare Verification:** 100% Free Education (KISS Trust) status with NAAC Grade ‘A’ residential education backing.

| Scholar Information Card | Data Attribute | System Source & Institutional Governance Function |
| :--- | :--- | :--- |
| **Official Scholar Profile** | Bikash Soren (KISS-TRN-2026-003) | Permanent institutional identity registered with KISS Deemed to be University. Includes candidate photo placeholder and "Active & In-Training" status badge. |
| **Academic & Trade Details** | VOC-ART-102 (Handicrafts & Tribal Art) | Tracks joining date (2026-10-04) and projected passout date (2027-04-04). Connects directly to the official handicraft and terracotta workshop curriculum. |
| **Attendance & 75% Rule Engine** | Session Logs & Biometric Records | Autonomous evaluation rule: scholars falling below 75% practical attendance trigger advisory alerts and are temporarily restricted from production stipend disbursements. |
| **Earn-While-Learn DBT Ledger** | Direct Benefit Transfer (DBT) Wallet | Calculates accumulated piece-rate incentives accrued from approved workshop batches. Automatically populates student bank account transfer queues upon admin sign-off. |

---

## 8. Manufacturing Operations & Bill of Materials (BOM) Console (Screen 07)

The Production Unit interface coordinates artisan workshop scheduling, computes exact raw material consumption recipes, and tracks apprentice labor contributions.

> **Screen 07 Technical Metadata:**  
> **File:** [07_Vocational_Production_BOM.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/4)%20Manufacturing%20%26%20Inventory/07_Vocational_Production_BOM.png) • **Route:** `/?view=portal&role=production&tab=production`  
> **Production Manager Persona:** Rahul Verma (`KISS-PRD-002`) • **Active Workshop:** Workshop Lab #1 (Sewing & Textiles)  
> **Core Capabilities:** Batch Scheduling, Dynamic BOM Recipe Deduction, Apprentice Team Allocation, Quality Assurance Queue.

| Production Component | UI Controls & Data Fields | Operational Engineering Logic |
| :--- | :--- | :--- |
| **Workshop Lab Selector** | Dropdown Selector (5 Labs) • "Propose New Workshop" | Switches dynamically between Sewing, Sambalpuri Handloom, Bamboo Craft, Terracotta, and Food Processing. Updates material dependencies instantly. |
| **Standard BOM Recipe Card** | Pure Cotton Fabric (2.5m/unit) • Wooden Buttons (4 pcs/unit) | Displays exact per-unit raw material consumption rates alongside live warehouse stock levels (Fabric: 312.5m live stock; Buttons: 540 pcs live stock). |
| **Batch Scheduling Engine** | Batch Code (`BATCH-2026-SEW-003`) • Target Quantity • Time Estimator | Calculates estimated production duration (18 Working Hours for 10 units), recommends optimal apprentice scholar team size (3 scholars), and activates automated material deduction. |
| **Administrative Clearance Queue** | Approval Status • Handover to POS | Finished batches enter a strict approval holding state awaiting university administration review before transfer to commercial finished goods stock. |

---

## 9. Dual-Warehouse Materials Inventory & Commercial POS Retail (Screens 08, 09 & 10)

Ensures absolute separation between raw manufacturing inputs and finished artisan goods ready for public sale, integrated with high-speed barcode checkout and GST invoicing.

| Screen ID & File | Route & Viewport | User Roles / Audience | Functional Components, Data Bindings & UI Interactions |
| :--- | :--- | :--- | :--- |
| **Screen 08:**<br>[08_Dual_Warehouse_Inventory.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/4)%20Manufacturing%20%26%20Inventory/08_Dual_Warehouse_Inventory.png) | `/?view=portal&tab=inventory`<br>1920×1080 Full-HD | Warehouse Supervisor, Production Head, Admin | **Dual-Vault Inventory Management:** Strict compartmentalization: Left panel monitors 10 Raw Material SKUs across 5 workshop craft lines with reorder thresholds. Right panel tracks Finished Goods Stock (55 units ready for sale, valuation ₹41,600: Cotton Kurti 38 pcs, Sambalpuri Stole 7 pcs, Bamboo Lamp 10 pcs). "Inward / Restock Material" action modal. |
| **Screen 09:**<br>[09_POS_Retail_Counter_Billing.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/5)%20Commercial%20POS%20Retail/09_POS_Retail_Counter_Billing.png) | `/?view=portal&tab=sales`<br>1920×1080 Full-HD | POS Retail Cashier, Sales Manager | **Commercial Sales Order & Billing Terminal:** Real-time available stock checking (38 units), customer booking form (Name, Phone, Email, Delivery Address), scheduled dispatch date picker, product selector with unit price (₹650.00), automatic total calculation, and recent order register. |
| **Screen 10:**<br>[10_GST_Tax_Invoice_Receipt.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/5)%20Commercial%20POS%20Retail/10_GST_Tax_Invoice_Receipt.png) | `/?view=portal&tab=sales&invoice=1`<br>1920×1080 Full-HD | POS Retail Cashier, Customer, Auditor | **GST Tax Invoice & Print Modal:** Modal overlay with backdrop blur. Order Ref `ORD-1791010251290`, Customer: KISS Tribal Craft Exhibition, Itemized breakdown (Sambalpuri Stole × 3 @ ₹1200.00 = ₹3600.00), dispatch status indicator, and browser print receipt trigger. |

---

## 10. AI Demand Forecasting Engine & Predictive Analytics (Screen 11)

The AI Forecasting console implements Ordinary Least Squares (OLS) regression and Holt-Winters triple exponential smoothing to eliminate inventory stock-outs and guide seasonal workshop scheduling.

> **Screen 11 Technical Metadata:**  
> **File:** [11_Holt_Winters_Demand_Forecasting.png](file:///C:/Users/hp/OneDrive/Desktop/KISS%20Vocational%20Training%20Management%20System/07%20Screenshots/6)%20AI%20Forecasting%20%26%20Intelligence/11_Holt_Winters_Demand_Forecasting.png) • **Route:** `/?view=portal&tab=forecast`  
> **Algorithmic Models:** OLS Trend Regression + Exponential Smoothing • **Confidence Metric:** 88% Confidence Interval  
> **Mathematical Reorder Law:** `Q_reorder = max(0, (Predicted_Demand + Safety_Buffer) - Current_Stock)`

| Forecasting Element | Live Metric / Formula | Decision Support Logic & Automated Advisory |
| :--- | :--- | :--- |
| **Target Craft SKU Selector** | PRD-KURTI-01 (Cotton Kurti) | Dynamically loads past retail velocity across 7-day, 30-day, and quarterly exhibition cycles from the database. |
| **Predicted Demand (D)** | 6 Units / Period (88% Conf.) | Analyzes historical sales trends to project immediate replenishment requirements for the upcoming sales week. |
| **Safety Buffer (B)** | +1 Unit (15% cushion) | Mitigates sudden retail demand surges during university cultural festivals and tribal art exhibitions. |
| **Autonomous Decision Advisory** | Q_reorder = max(0, (6 + 1) - 38) = 0 | Since warehouse holds 38 units on hand, the engine recommends 0 units needed, preventing capital lock-up in excess inventory. |
| **Interactive What-If Simulator** | Dynamic Range Slider (1–50 units) | Enables managers to simulate exhibition spikes (e.g. 50 units) to observe instantaneous recalculation of recommended batch runs. |

---

## 11. Multi-Device Responsive Viewport Matrix & Compatibility Verification

| Device Category | Resolution | Layout Adaptation | Verified Browsers & Rendering Status |
| :--- | :--- | :--- | :--- |
| **Executive Desktop** | 1920×1080 (16:9) | Full 12-col grid, persistent left drawer | Edge 124+, Chrome 124+, Firefox 125+ • Certified Pass |
| **Institutional Laptop** | 1366×768 | Compact tables, scrollable data grids | Edge 124+, Chrome 124+, Safari 17+ • Certified Pass |
| **Workshop Tablet** | 768×1024 | Collapsible drawer, touch-friendly rows | Mobile Safari, Chrome Mobile • Certified Pass |
| **Mobile Device** | 375×812 | Single-column flex, bottom action bars | iOS Safari, Android Chrome • Certified Pass |

---

## 12. UI/UX Specification Formal Academic Certification & Sign-Off

I hereby certify that all eleven user interface screens documented herein represent actual, functioning frontend components developed for the KISS Vocational Training Management System (KV-TMS). Every screen has been captured at 1920×1080 Full-HD resolution directly from the running software, verified against WCAG 2.1 AA accessibility guidelines, and integrated with the Spring Boot microservices backend.

| Academic Role | Name & Affiliation | Approval Signature | Sign-Off Date |
| :--- | :--- | :--- | :--- |
| **Project Candidate & Developer** | Mansi Sinha, B.Tech CSE (Roll No: 2205160) | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engineering, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |

---
*KV-TMS v1.0.0-RELEASE • School of Computer Science & Engineering, KIIT Deemed to be University • Kalinga Institute of Social Sciences (KISS)*
