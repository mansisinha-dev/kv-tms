# KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)
## Capstone Project Viva Voce Defense Guide & Speaker Notes

**Candidate:** Mansi Sinha (Roll No: **2205160**)  
**Degree Program:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Department:** School of Computer Science & Engineering, KIIT Deemed to be University, Bhubaneswar  
**Institutional Partner:** Kalinga Institute of Social Sciences (KISS)  
**Academic Year:** 2025 – 2026  
**Presentation Deck:** `Final_Project_Presentation.pptx` (20 Slides, 16:9 Widescreen)  
**Allocated Viva Duration:** 15 Minutes Presentation + 10 Minutes Defense Q&A  

---

## PART 1: MASTER DEFENSE STRATEGY & TIME ALLOCATION

```
Total Presentation Time: 15 Minutes (900 Seconds)
+-----------------------+-----------------------------+--------------------+---------------+
| Segment               | Slide Numbers               | Target Duration    | Cumulative    |
+-----------------------+-----------------------------+--------------------+---------------+
| 1. Motivation & Scope | Slides 1 - 5                | 3 Minutes (180s)   | 00:00 - 03:00 |
| 2. Methodology & Arch | Slides 6 - 8                | 2.5 Minutes (150s) | 03:00 - 05:30 |
| 3. Detailed Design    | Slides 9 - 13               | 3.5 Minutes (210s) | 05:30 - 09:00 |
| 4. Algorithms & Math  | Slide 14                    | 1.5 Minutes (90s)  | 09:00 - 10:30 |
| 5. System UI Showcase | Slides 15 - 16              | 2 Minutes (120s)   | 10:30 - 12:30 |
| 6. Testing & Quality  | Slides 17 - 18              | 1.5 Minutes (90s)  | 12:30 - 14:00 |
| 7. Impact & Summary   | Slides 19 - 20              | 1 Minute (60s)     | 14:00 - 15:00 |
+-----------------------+-----------------------------+--------------------+---------------+
Followed by: 10 Minutes Technical Q&A with External & Internal Examiners
```

### Golden Rules for the Defense:
1. **Never Read the Slides Word-for-Word:** Use the slide text as anchor points; explain the *engineering rationale* behind each design decision.
2. **Anchor Everything to Real KISS Operations:** Emphasize that this is not an abstract textbook project—it solves tangible operational problems for 30,000 indigenous tribal students and active handicraft workshops.
3. **Lead with Engineering Rigor:** Highlight mathematical determinism (`BigDecimal`), concurrency safety (`@Lock(LockModeType.PESSIMISTIC_WRITE)`), and empirical test metrics (88.41% JaCoCo coverage, 95ms P95 latency).
4. **Maintain Composure:** If an examiner challenges a design decision, acknowledge the trade-off, explain the constraint that led to your choice, and discuss how alternatives compare.

---

## PART 2: SLIDE-BY-SLIDE SPEAKER SCRIPT & TALKING POINTS

### Slide 1: Title Slide (Presentation Opening)
- **Time Target:** 00:00 – 00:35 (35 seconds)
- **Visual Cue:** High-contrast Indigo and Amber institutional title layout.
- **Verbatim Speaking Script:**
  > "Respected external examiner, departmental faculty members, and project guides: Good morning. My name is **Mansi Sinha**, Roll Number **2205160**, final-year B.Tech student in Computer Science & Engineering at KIIT Deemed to be University.
  > Today, I am proud to present my capstone project: the **KISS Vocational Training Management System (KV-TMS)**. 
  > This is a decoupled three-tier enterprise web platform engineered specifically for the Kalinga Institute of Social Sciences. It unifies vocational education, raw material inventory allocation, workshop craft manufacturing, high-concurrency retail showroom point-of-sale billing, and predictive demand forecasting. Let us begin by examining the institutional context and operational imperatives that inspired this engineering endeavor."

---

### Slide 2: Institutional Background & Tribal Empowerment
- **Time Target:** 00:35 – 01:10 (35 seconds)
- **Visual Cue:** Overview of KISS institutional scope and EWYL mandate.
- **Verbatim Speaking Script:**
  > "To understand the architecture of KV-TMS, one must appreciate the unique operational scale of the **Kalinga Institute of Social Sciences (KISS)**. KISS is the world’s largest residential educational institution for indigenous tribal children, providing completely free education, boarding, and healthcare to over thirty thousand students representing sixty-two distinct tribes.
  > Alongside academic schooling, KISS operates active vocational training studios—ranging from Tailoring and Apparel to Handloom Weaving, Bamboo and Woodcraft, and Terracotta pottery. Under the institutional **Earn While You Learn (EWYL)** program, student artisans produce commercial-grade handcrafted goods, earning financial stipends that directly support their families. These products are then sold through campus retail outlets and cultural exhibitions. However, running these interconnected activities created massive operational bottlenecks."

---

### Slide 3: Problem Statement & Operational Inefficiencies
- **Time Target:** 01:10 – 01:50 (40 seconds)
- **Visual Cue:** Four major operational bottlenecks list.
- **Verbatim Speaking Script:**
  > "Prior to KV-TMS, operations were managed via paper rosters, disconnected physical ledgers, and standalone spreadsheets. This created four acute vulnerabilities:
  > First, attendance tracking was error-prone. Verifying the statutory seventy-five percent minimum attendance required to release student stipends required twelve hours of manual record audits per department, causing stipend disbursement delays of forty-five to sixty calendar days.
  > Second, workshops had no automated Bill of Materials deduction. Raw materials like yarn, fabric, and brass alloys were issued without formal reservation, leading to untracked material leakage.
  > Third, showroom craft sales were recorded on paper slips, causing multi-day inventory lag and frequent stockouts of fast-moving items.
  > Fourth, production scheduling was based on subjective guesswork rather than historical sales velocity."

---

### Slide 4: Project Objectives & Functional Scope
- **Time Target:** 01:50 – 02:25 (35 seconds)
- **Visual Cue:** Five core engineering deliverables.
- **Verbatim Speaking Script:**
  > "To solve these systemic bottlenecks, I formulated five core engineering objectives:
  > First, engineer a responsive web platform with role-based access control governing four primary personas: Administrator, Trainer, Trainee, and Production/POS Manager.
  > Second, implement deterministic seventy-five percent attendance verification using high-precision BigDecimal arithmetic and export banking-ready Direct Benefit Transfer files.
  > Third, enforce atomic Bill of Materials deduction within database transactions, locking Warehouse 1 raw materials upon work order release.
  > Fourth, deploy a high-concurrency barcode POS checkout terminal with pessimistic database write locking to prevent inventory overselling.
  > Fifth, integrate an in-engine statistical AI demand forecasting module utilizing Ordinary Least Squares linear regression to calculate thirty-day replenishment targets."

---

### Slide 5: Literature Survey & Comparative Analysis
- **Time Target:** 02:25 – 03:00 (35 seconds)
- **Visual Cue:** Comparative matrix (Generic ERP vs LMS vs KV-TMS).
- **Verbatim Speaking Script:**
  > "During our preliminary literature survey, existing enterprise platforms were evaluated against KISS requirements.
  > Commercial ERPs such as SAP and Odoo offer sophisticated manufacturing features, but their heavy licensing costs, complex configuration overhead, and lack of tribal student attendance-linked stipend workflows make them impractical for a philanthropic institution.
  > Conversely, academic Learning Management Systems like Moodle or Canvas manage course curricula and exams, but lack any awareness of physical workshop production, raw material BOMs, or retail POS cash registers.
  > KV-TMS bridges this divide. It provides a lightweight, tailor-made, zero-license architecture unifying student pedagogy, workshop manufacturing, dual-warehouse inventory, and retail commerce into one cohesive ecosystem."

---

### Slide 6: Software Development Lifecycle (SDLC) Methodology
- **Time Target:** 03:00 – 03:40 (40 seconds)
- **Visual Cue:** Hybrid Agile/V-Model sprint timeline.
- **Verbatim Speaking Script:**
  > "We adopted a hybrid Agile/V-Model software development methodology across seven two-week sprints.
  > Agile gave us the flexibility to iterate on the user interface and incorporate feedback from workshop trainers. Simultaneously, V-Model verification was applied to the core transactional backend, ensuring that database constraints, financial stipend calculations, and concurrency locking adhered to strict IEEE 829 verification standards.
  > As shown on the slide, the project progressed systematically from field requirements in Sprint 1, through backend authentication, academic registration, workshop BOM, retail POS, AI regression, and culminated in Sprint 7 with automated JUnit test suites and Apache JMeter stress benchmarking."

---

### Slide 7: High-Level System Architecture (3-Tier Topology)
- **Time Target:** 03:40 – 04:30 (50 seconds)
- **Visual Cue:** Embedded high-resolution System Architecture diagram.
- **Verbatim Speaking Script:**
  > "Slide 7 illustrates the high-level system architecture of KV-TMS, structured into three clean, decoupled tiers:
  > On the client side in Tier 1, we implemented a modern Single Page Application using React 18, Vite 5, and Tailwind CSS. All communications pass through an Axios HTTP client equipped with request and response interceptors that automatically attach stateless JWT bearer tokens.
  > In Tier 2, the application layer is powered by Java 17 and Spring Boot 3.2.0. Inbound HTTP requests traverse a Spring Security 6 filter chain. Controllers delegate business logic to transactional service beans, including the custom OLS Forecasting Engine.
  > In Tier 3, data persistence is handled by an enterprise MySQL 8.0 relational database with the InnoDB storage engine, managed through Spring Data JPA and optimized via a HikariCP connection pool. Cross-cutting concerns like SLF4J structured logging and global exception handlers ensure robust observability."

---

### Slide 8: Data Flow Design — DFD Level 0 (Global Context)
- **Time Target:** 04:30 – 05:10 (40 seconds)
- **Visual Cue:** Embedded DFD Level 0 diagram.
- **Verbatim Speaking Script:**
  > "Slide 8 shows the Level 0 Context Diagram representing the system boundaries.
  > Process 0.0 represents the entire KV-TMS system boundary interacting with four external entities:
  > The Administrator configures user roles, course catalog definitions, and receives audit logs and DBT banking export summaries.
  > The Trainer submits daily biometric/session attendance rosters and grading assessments, receiving low-attendance alerts.
  > The Trainee queries their attendance percentage, academic schedule, and monthly EWYL stipend advice slips.
  > The Production and POS Staff initiates raw material work orders, submits QA inspection passes, and processes showroom retail customer checkouts."

---

### Slide 9: Functional Decomposition — DFD Level 1
- **Time Target:** 05:10 – 05:50 (40 seconds)
- **Visual Cue:** Embedded DFD Level 1 diagram detailing processes 1.0 to 14.0.
- **Verbatim Speaking Script:**
  > "Expanding Process 0.0 yields the DFD Level 1 diagram shown on Slide 9, decomposing system logic into fourteen discrete processes and nine persistent data stores labeled D1 through D9:
  > Processes 1.0 to 3.0 manage authentication, student enrollment, and daily attendance ingestion.
  > Process 4.0 executes the automated 75% attendance rule engine, flagging ineligible candidates before Process 14.0 computes monthly EWYL stipends.
  > Processes 6.0 through 8.0 orchestrate workshop manufacturing: validating available stock in Warehouse 1 (D5), locking raw materials, and deducting BOM components atomically.
  > Processes 9.0 and 10.0 inspect finished goods and transfer certified units into Warehouse 2 (D6).
  > Finally, Processes 11.0 and 12.0 handle retail POS barcode lookups and GST tax invoice generation, while Process 13.0 feeds 30-day historical sales into the demand forecasting engine."

---

### Slide 10: Behavioral Modeling — UML Use Case Diagram
- **Time Target:** 05:50 – 06:30 (40 seconds)
- **Visual Cue:** Embedded UML Use Case diagram showing actors and relationships.
- **Verbatim Speaking Script:**
  > "Slide 10 presents the UML Use Case Model.
  > It formalizes interactions across the four primary human actors through twelve core use cases.
  > Notice the critical `<<include>>` relationships:
  > Whenever a workshop manager triggers 'Schedule Work Order', the system unconditionally includes 'Deduct BOM Raw Materials'. If raw material stock is insufficient, the entire transaction rolls back.
  > Similarly, 'Record Quality Inspection' unconditionally includes 'Transfer Finished Stock to WH2', ensuring that sub-standard craft goods never enter commercial inventory.
  > Trainees can independently query their attendance and stipend status via self-service portals, eliminating the administrative overhead of handling manual inquiries."

---

### Slide 11: Static Structural Modeling — UML Class Diagram
- **Time Target:** 06:30 – 07:15 (45 seconds)
- **Visual Cue:** Embedded UML Class diagram showing domain package organization.
- **Verbatim Speaking Script:**
  > "Slide 11 depicts the UML Class Diagram, structured into four cohesive packages following enterprise Clean Architecture principles:
  > The `security` package encapsulates `User`, `Role`, `JwtTokenProvider`, and the authentication filter.
  > The `academic` package models student progress with `Trainee`, `Trainer`, `Course`, `Training`, and the immutable `Attendance` record.
  > The `production` package contains `InventoryItem`, `ProductionOrder`, and `BillOfMaterial`, modeling the dual-warehouse stock relationship.
  > The `commercial` package governs revenue operations with `SalesOrder`, `OrderItem`, `DemandForecast`, and `Stipend`.
  > Throughout the implementation, we adhered to established design patterns: the Repository Pattern for data access, the Service Layer Pattern for transactional business rules, and Data Transfer Objects to prevent entity over-exposure across the REST API."

---

### Slide 12: Data Persistence — Entity-Relationship (ER) Model
- **Time Target:** 07:15 – 08:00 (45 seconds)
- **Visual Cue:** Embedded full ER diagram showing 13 tables, keys, and foreign keys.
- **Verbatim Speaking Script:**
  > "Slide 12 displays the complete Entity-Relationship diagram, comprising thirteen relational entities normalized to strict Third Normal Form (3NF).
  > All transitive and partial functional dependencies have been eliminated.
  > To preserve relational integrity:
  > We implemented `ON DELETE CASCADE` between the primary `users` credentials table and role profiles (`trainees`, `trainers`).
  > However, for financial and audit ledgers—including `sales_orders`, `stipends`, and `inventory_items`—we enforced `ON DELETE RESTRICT` to guarantee audit trail permanence.
  > Database-level constraints include a composite unique constraint on `(trainee_id, attendance_date)` preventing duplicate attendance submissions, and check constraints on warehouse enum types."

---

### Slide 13: Dynamic Behavioral Modeling — Sequence Diagram
- **Time Target:** 08:00 – 08:45 (45 seconds)
- **Visual Cue:** Embedded Production Work Order Sequence diagram.
- **Verbatim Speaking Script:**
  > "Slide 13 illustrates the dynamic execution lifecycle for workshop production and inventory reservation:
  > When the Production Manager posts a new work order, `ProductionController` delegates to `ProductionService`.
  > Within a `@Transactional` boundary, the service queries the `BillOfMaterial` entity to resolve recipe components.
  > It issues a `SELECT ... FOR UPDATE` query against `InventoryRepository`, acquiring pessimistic row locks on Warehouse 1 raw material balances.
  > The system validates stock sufficiency. If sufficient, it deducts required raw materials, sets the work order status to `IN_PROGRESS`, and commits the transaction.
  > Upon physical artisan assembly, the batch undergoes QA testing; passing units are incremented in Warehouse 2, while scrap units are recorded in the scrap ledger."

---

### Slide 14: Core Algorithmic Formulations & Mathematical Rigor
- **Time Target:** 08:45 – 10:15 (90 seconds)
- **Visual Cue:** Mathematical formulas for BOM, Attendance, Stipends, OLS, and GST.
- **Verbatim Speaking Script:**
  > "Slide 14 details the mathematical formulations and operational invariants implemented within KV-TMS:
  > Formulation 1 governs Atomic BOM Deduction: The required quantity of each raw material equals the batch quantity multiplied by the BOM ratio, scaled by one plus the scrap rate factor. A pre-flight assertion verifies available stock is strictly greater than or equal to required stock prior to reservation.
  > Formulation 2 enforces the Statutory 75% Attendance Law: The attendance rate is calculated as total days present divided by total working days. To completely eliminate IEEE 754 binary floating-point rounding errors—where 74.999% might round inaccurately—we implemented this using Java `BigDecimal` with four decimal places of scale and `RoundingMode.HALF_UP`.
  > Formulation 3 calculates the Monthly EWYL Student Stipend: combining base daily training allowances with piece-rate production bonuses for certified craft units.
  > Formulation 4 executes Ordinary Least Squares Linear Regression: calculating trend slope beta-one and intercept beta-zero from historical 30-day showroom demand to compute thirty-day sales projections and warehouse Reorder Points.
  > Formulation 5 implements half-cent GST tax balancing: calculating 2.5% CGST and 2.5% SGST with Banker's Rounding, automatically allocating rounding remainders to prevent penny imbalances."

---

### Slide 15: User Interface Verification — Public Portal & Executive Dashboard
- **Time Target:** 10:15 – 11:15 (60 seconds)
- **Visual Cue:** Full-HD UI screenshots of Public Landing and Executive Dashboard.
- **Verbatim Speaking Script:**
  > "Slide 15 demonstrates the realized user interface:
  > On the left is the Public Vocational Portal. Built with React and Tailwind CSS, it features institutional KISS branding, NAAC Grade 'A' accreditation credentials, and an interactive craft trade catalog for prospective trainees and visitors.
  > On the right is the Executive Analytics and Governance Console. It provides administrative leadership with real-time KPI tiles: active trainee enrollments, ongoing workshop production orders, month-to-date retail revenue, and automated inventory reorder alerts flagged by the regression engine. All data is fetched asynchronously via authenticated REST endpoints."

---

### Slide 16: User Interface Verification — Production BOM & Retail POS Terminal
- **Time Target:** 11:15 – 12:15 (60 seconds)
- **Visual Cue:** Full-HD UI screenshots of Workshop BOM Console and Retail POS Terminal.
- **Verbatim Speaking Script:**
  > "Slide 16 showcases our workshop manufacturing and commercial retail interfaces:
  > On the left, the Workshop Production and BOM Allocation Console displays batch scheduling, live inventory stock gauges, and automated Bill of Materials calculations with real-time scrap factor analysis.
  > On the right is the Point-of-Sale Retail Counter Terminal. Cashiers can perform rapid barcode lookup or select items from visual quick-pick tiles. The cart engine automatically breaks down CGST and SGST taxes in real time, supports split tender between Cash and UPI QR code payments, and triggers instantaneous thermal receipt printing upon checkout."

---

### Slide 17: Software Quality Gate & IEEE 829 Test Execution Scorecard
- **Time Target:** 12:15 – 13:00 (45 seconds)
- **Visual Cue:** Test metrics scorecard, JaCoCo coverage bars, JMeter latency figures.
- **Verbatim Speaking Script:**
  > "Slide 17 summarizes our formal Quality Assurance and testing results adhering to IEEE 829 standards:
  > First, our automated test suite achieved a one hundred percent pass rate across thirty-seven unit and integration test cases executed via Maven and JUnit 5.
  > Second, bytecode instrumentation with JaCoCo demonstrated eighty-eight point four-one percent line code coverage and eighty-four point zero-eight percent branch coverage, significantly exceeding our target threshold of eighty percent.
  > Third, performance benchmarking was conducted with Apache JMeter simulating fifty concurrent virtual cashier threads firing simultaneous checkouts. The system maintained an average latency of thirty-eight milliseconds and a ninety-fifth percentile latency of ninety-five milliseconds with zero unhandled server errors."

---

### Slide 18: Engineering Breakthrough — Concurrency Safety & Bug Resolution
- **Time Target:** 13:00 – 13:45 (45 seconds)
- **Visual Cue:** Concurrency race condition scenario diagram and fix code snippet.
- **Verbatim Speaking Script:**
  > "Slide 18 details a critical engineering challenge we identified and resolved during stress testing:
  > During multi-threaded JMeter tests, two cashiers simultaneously attempted to purchase the last available handmade Dhokra brass figurine. In the initial implementation, both threads read available stock as one, validated the sale, and decremented the database, causing stock to drop to negative one—a classic race condition.
  > To solve this, we applied row-level pessimistic write locking by annotating the repository query with `@Lock(LockModeType.PESSIMISTIC_WRITE)`. This translates to a MySQL `SELECT ... FOR UPDATE` statement.
  > When tested under identical fifty-thread concurrency, exactly one transaction acquired the lock and decremented stock to zero, while the remaining threads were safely rejected with HTTP 409 Conflict exceptions. This was logged as Defect BUG-001 and successfully closed alongside five other defects."

---

### Slide 19: Operational Efficiency Gains & Tribal Impact
- **Time Target:** 13:45 – 14:20 (35 seconds)
- **Visual Cue:** Before-and-after operational comparison metrics.
- **Verbatim Speaking Script:**
  > "Slide 19 quantifies the measurable operational impact delivered by KV-TMS:
  > The monthly student stipend disbursement cycle was compressed from forty-five to sixty calendar days down to under five minutes—a ninety-nine point eight percent reduction in processing latency.
  > Attendance threshold auditing was reduced from twelve hours of manual paper review to sub-second real-time database queries.
  > Pre-flight BOM reservation eliminated unaccounted fabric and wood loss in craft workshops.
  > Showroom checkout time per retail customer dropped from five minutes to under twenty-five seconds.
  > Most importantly, this provides direct economic empowerment to indigenous tribal youth, fostering financial self-sufficiency through transparent vocational training."

---

### Slide 20: Conclusion, Future Scope & Acknowledgements
- **Time Target:** 14:20 – 15:00 (40 seconds)
- **Visual Cue:** Conclusion points, candidate attribution card, closing remarks.
- **Verbatim Speaking Script:**
  > "In conclusion, the KISS Vocational Training Management System successfully demonstrates the design, engineering, and deployment of a resilient enterprise platform meeting the dual needs of vocational pedagogy and commercial craftsmanship.
  > Looking to the future, we have outlined three prospective enhancements: deploying edge IoT biometric fingerprint scanners across workshops, integrating deep learning LSTM networks for non-linear multi-season demand forecasting, and packaging the frontend as an offline-first Progressive Web App.
  > I express my deepest gratitude to the faculty of the School of Computer Science & Engineering at KIIT and the mentors at KISS for their guidance throughout this endeavor.
  > Thank you very much. I am now open to your questions and discussion."

---

## PART 3: TOP 25 EXAMINER VIVA QUESTIONS & MODEL ANSWERS

### Section A: Architecture & Design Decisions

#### Q1: Why did you choose a 3-tier decoupled architecture instead of a modern microservices architecture?
**Model Answer:**
> "A monolithic three-tier architecture with modular domain packages was an intentional engineering choice governed by operational scale and deployment simplicity. Microservices introduce substantial operational complexity: distributed transactions (requiring Sagas or 2PC), network latency between services, distributed tracing, and container orchestration overhead (Kubernetes).
> For KV-TMS, our atomic operations—such as simultaneously decrementing Warehouse 1 raw materials, recording a work order, and logging scrap—require ACID transaction guarantees. In a single MySQL database instance, Spring's `@Transactional` boundary guarantees atomicity trivially. However, our codebase is modularly decoupled into distinct bounded contexts (`academic`, `production`, `commercial`, `security`), allowing effortless extraction into microservices if KISS ever expands across multiple state campuses."

#### Q2: Why did you select MySQL 8.0 over a NoSQL database like MongoDB?
**Model Answer:**
> "KV-TMS deals fundamentally with relational and financial data: student enrollments, course prerequisites, attendance percentages, multi-item sales orders, and monetary stipends. These domains demand strict ACID compliance, foreign key referential integrity (`ON DELETE RESTRICT`), and multi-table consistency.
> MongoDB operates on an eventual consistency model and lacks declarative schema-level foreign key enforcement. A bug in application code could easily result in orphan attendance records or negative inventory balances. MySQL 8.0 with the InnoDB storage engine provides row-level locking (`FOR UPDATE`), full B-Tree indexing, and guaranteed ACID transactional semantics required for banking DBT audits."

#### Q3: What design patterns did you implement in the backend?
**Model Answer:**
> "We implemented several enterprise design patterns:
> 1. **Repository Pattern:** Spring Data JPA repositories decouple our domain model from SQL data access mechanisms.
> 2. **Service Layer Pattern:** Encapsulates transactional business logic (`@Transactional`) and isolates controllers from persistence logic.
> 3. **Data Transfer Object (DTO) Pattern:** Prevents entity over-exposure, controls JSON serialization, and decouples internal database schema from external API contracts.
> 4. **Strategy Pattern:** Used in stipend calculation to select between flat daily rate, piece-rate craft output, or hybrid models based on the vocational trade configuration.
> 5. **Filter Chain / Interceptor Pattern:** Utilized in Spring Security (`JwtAuthenticationFilter`) and frontend Axios interceptors for transparent authentication header management."

---

### Section B: Database Engineering & Concurrency

#### Q4: Explain the difference between Optimistic and Pessimistic Locking, and why you used Pessimistic Locking in the POS module.
**Model Answer:**
> "Optimistic locking assumes resource conflicts are rare; it uses a `@Version` timestamp column. If two transactions attempt to update the same record, the first commits and increments the version, while the second fails with an `OptimisticLockException` during commit.
> Pessimistic locking assumes conflicts will occur; it locks the database row immediately upon reading using `SELECT ... FOR UPDATE`, blocking other transactions until the first transaction completes.
> In our retail POS counter during campus festivals or peak exhibitions, multiple cashiers sell the last units of handcrafted items simultaneously. With optimistic locking, a customer standing at the counter would experience unexpected checkout failures after swiping a card because another register committed 2 milliseconds earlier. With pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`), the second transaction waits briefly or immediately receives a deterministic out-of-stock response before initiating payment."

#### Q5: How is your database normalized? Did you intentionally de-normalize anywhere?
**Model Answer:**
> "All thirteen database tables are normalized to Third Normal Form (3NF). Every non-key attribute is non-transitively dependent on the primary key, and composite primary key components are fully dependent. For example, student attendance is strictly separated into `attendances`, referencing `trainees` and `trainings` through foreign keys.
> We introduced controlled, deliberate de-normalization in only two specific columns for performance and immutable auditing:
> First, in `order_items`, we store `unit_price` at the moment of sale alongside `product_id`. This is intentional because catalog craft prices change over time; historical sales receipts must preserve the historical purchase price rather than dynamically querying current catalog prices.
> Second, in `stipends`, we snapshot `total_days_present` alongside the monetary amount for permanent banking audit trails."

#### Q6: What composite constraints did you enforce at the database level?
**Model Answer:**
> "We enforced a unique composite constraint on the `attendances` table across `(trainee_id, attendance_date)`:
> ```sql
> CONSTRAINT uq_trainee_daily_attendance UNIQUE (trainee_id, attendance_date)
> ```
> This prevents race conditions where a trainer might click 'Save' twice or two faculty members accidentally enter duplicate attendance records for the same student on the same day."

---

### Section C: Mathematical Formulations & Algorithms

#### Q7: Why did you use Java `BigDecimal` instead of `double` or `float` for attendance and stipend calculations?
**Model Answer:**
> "Standard IEEE 754 floating-point primitives (`float` and `double`) store fractional numbers in binary base-2 representation. Consequently, numbers like `0.1` or `0.75` cannot be represented with exact decimal precision, leading to small truncation errors like `0.7499999999999999`.
> In our system, if a trainee has 15 present days out of 20 working days, their attendance is exactly 75.00%. If evaluated using floating-point math, a rounding anomaly could evaluate `0.749999999 < 0.75`, disqualifying the student from their monthly stipend and semester exam.
> Java's `BigDecimal` provides arbitrary-precision signed decimal numbers. We instantiated `BigDecimal.valueOf(...)` and set an explicit scale of 4 with `RoundingMode.HALF_UP`, guaranteeing exact, deterministic financial and academic evaluations."

#### Q8: Walk me through the Ordinary Least Squares (OLS) regression formula used in your Demand Forecasting.
**Model Answer:**
> "Our demand forecasting algorithm models the linear relationship between time $t_i$ (measured in days from $1$ to $N$) and historical craft sales volume $Y_i$.
> The slope $\beta_1$ is computed using the OLS covariance formula:
> $$\beta_1 = \frac{\sum_{i=1}^N (t_i - \bar{t})(Y_i - \bar{Y})}{\sum_{i=1}^N (t_i - \bar{t})^2}$$
> The intercept $\beta_0$ is computed as:
> $$\beta_0 = \bar{Y} - \beta_1 \cdot \bar{t}$$
> For a future target day $t_{target}$, the projected demand is:
> $$\hat{Y} = \max(0, \beta_0 + \beta_1 \cdot t_{target})$$
> We then calculate the inventory Reorder Point (ROP) as:
> $$ROP = (\bar{d} \times L) + SS$$
> where $\bar{d}$ is the average daily demand, $L$ is workshop lead time in days, and $SS$ is safety stock calculated from demand standard deviation. If Warehouse 2 inventory falls below ROP, the dashboard automatically flags a replenishment recommendation."

#### Q9: How does the GST half-cent balancing algorithm work?
**Model Answer:**
> "Indian GST regulations require equal split between Central GST (CGST) and State GST (SGST)—typically 2.5% each for a 5% handicraft bracket.
> When calculating taxes on an odd-priced craft item (for example, Rs. 105.00 at 5% tax = Rs. 5.25 total tax), splitting evenly yields Rs. 2.625 for CGST and Rs. 2.625 for SGST.
> Currency cannot be settled in fractions of a paisa. If both are rounded up to Rs. 2.63, the total tax collected becomes Rs. 5.26, exceeding the legal tax liability by one paisa.
> Our algorithm calculates:
> $$CGST = \text{round}(5.25 / 2, 2, \text{HALF\_EVEN}) = 2.62$$
> $$SGST = 5.25 - CGST = 2.63$$
> The remainder delta is allocated deterministically to ensure that $CGST + SGST \equiv TotalTax$ down to the exact paisa."

---

### Section D: Security & Authentication

#### Q10: Walk me through the lifecycle of a JWT token in your system.
**Model Answer:**
> "1. The user posts their username and password to `/api/v1/auth/login`.
> 2. `AuthenticationManager` authenticates the credentials against MySQL via `BCryptPasswordEncoder`.
> 3. Upon success, `JwtTokenProvider` generates an HMAC-SHA256 signed JSON Web Token containing claims: `sub` (username), `roles` (e.g., `ROLE_TRAINER`), `iat` (issued at), and `exp` (expiration set to 24 hours).
> 4. The client receives the JWT and stores it in secure browser session storage.
> 5. For subsequent requests, the Axios interceptor attaches the token in the `Authorization: Bearer <token>` header.
> 6. On the backend, `JwtAuthenticationFilter` intercepts the request, verifies the cryptographic signature against the secret key, parses user authorities, and sets the `SecurityContextHolder.getContext().setAuthentication(...)` object for downstream RBAC authorization."

#### Q11: What prevents an attacker from altering their role inside the JWT to `ROLE_ADMIN`?
**Model Answer:**
> "A JWT consists of three parts separated by periods: Header, Payload, and Signature (`header.payload.signature`).
> The signature is computed as:
> $$\text{HMACSHA256}(\text{base64UrlEncode}(header) + \text{'.' } + \text{base64UrlEncode}(payload), \text{secret\_key})$$
> If an attacker decodes the Base64 payload, modifies the role to `ROLE_ADMIN`, and re-encodes it, the cryptographic signature will no longer match when the server recomputes the HMAC hash using its private server-side secret key.
> The backend `JwtTokenProvider` throws a `SignatureException`, the filter chain rejects the request, and an HTTP 401 Unauthorized response is returned immediately."

---

### Section E: Software Testing & Defect Resolution

#### Q12: Your documentation mentions 88.41% JaCoCo coverage. How was this measured, and why is some code uncovered?
**Model Answer:**
> "JaCoCo measures code coverage via Java bytecode instrumentation during the Maven test lifecycle (`mvn clean test jacoco:report`). As JUnit tests execute, JaCoCo tracks which bytecode instructions and branching conditional jump statements are executed.
> We achieved 88.41% line coverage (3,050 / 3,450 lines) and 84.08% branch coverage across all business services and repositories.
> The remaining ~11.5% uncovered code consists primarily of boilerplate entity getter/setter edge cases, configuration classes (`CorsConfig`, `SwaggerConfig`), and defensive fallbacks in custom exception handlers that represent catastrophic runtime conditions (such as physical database disk exhaustion)."

#### Q13: What was Bug BUG-001 and how did you verify its fix?
**Model Answer:**
> "Bug BUG-001 was a high-concurrency race condition in the POS checkout workflow where two concurrent threads could oversell inventory past zero.
> We verified the fix using an automated JMeter test plan with 50 concurrent virtual threads targeting a product with initial `quantity = 1`.
> Prior to the fix, 2 threads succeeded and stock dropped to `-1`.
> After adding `@Lock(LockModeType.PESSIMISTIC_WRITE)` to `InventoryRepository.findById()`, exactly 1 thread acquired the lock, decremented stock to `0`, and returned HTTP 200 OK. The remaining 49 threads encountered `InsufficientStockException` and received HTTP 409 Conflict within 42 milliseconds. Stock remained at zero."

---

### Section F: Social Relevance & Tribal Welfare

#### Q14: How does KV-TMS directly benefit an indigenous student at KISS?
**Model Answer:**
> "At KISS, vocational training is tied directly to student livelihood through the Earn While You Learn (EWYL) mandate.
> Previously, paper rosters caused monthly stipend disbursements to lag by up to two months, leaving impoverished tribal families without anticipated support.
> KV-TMS calculates stipends daily and allows immediate Direct Benefit Transfer (DBT) CSV exports conforming to National Payments Corporation of India (NPCI) and Public Financial Management System (PFMS) formats at the end of each billing cycle.
> Furthermore, students have self-service access to view their attendance thresholds and stipend credits, ensuring complete transparency and dignity."

---

## PART 4: QUICK-FIRE TECHNICAL GLOSSARY FOR VIVA

| Term / Acronym | Technical Definition | Role in KV-TMS |
| :--- | :--- | :--- |
| **BOM** | Bill of Materials | Recipe detailing raw materials and scrap required to fabricate finished crafts |
| **WH1 vs WH2** | Dual-Warehouse Model | WH1 stores raw materials (yarn, brass); WH2 stores finished retail goods |
| **Pessimistic Lock** | `SELECT ... FOR UPDATE` | Locks database row during read until transaction commit, preventing overselling |
| **BigDecimal** | Arbitrary-precision decimal | Prevents IEEE 754 floating-point drift in 75% attendance and currency math |
| **OLS Regression** | Ordinary Least Squares | Computes trendline slope ($\beta_1$) and intercept ($\beta_0$) for demand forecasting |
| **DBT / PFMS** | Direct Benefit Transfer | National electronic banking standard for disbursing stipends directly to students |
| **JaCoCo** | Java Code Coverage | Bytecode instrumentation tool verifying unit and integration test thoroughness |
| **RBAC** | Role-Based Access Control | Secures REST endpoints across Admin, Trainer, Trainee, and POS Manager |
| **3NF** | Third Normal Form | Eliminates transitive dependencies across all 13 database entities |
| **HikariCP** | High-performance JDBC pool | Manages reusable database connections to optimize query throughput |

---

## PART 5: LIVE DEMO RUNBOOK (3-MINUTE CONTINGENCY DEMO)

If the examiner asks: *"Can you show me the system running or demonstrate a specific workflow?"* follow this exact script:

```
[00:00 - 00:45] Login & Public Portal:
1. Open browser to http://localhost:5173
2. Point out NAAC Grade 'A' badge and vocational course catalog
3. Click 'Login' -> Enter trainer credentials: (KISS-FAC-001 / KISS-FAC-001@123)

[00:45 - 01:30] Attendance 75% Rule Verification:
1. Navigate to 'Trainee Attendance' -> Select 'Handloom Weaving Batch A'
2. Show student 'Laxman Majhi' currently at 73.5% attendance (flagged in Red)
3. Mark today's attendance as 'PRESENT' -> Click 'Save Attendance'
4. Show attendance instantly recalculate to 75.0% (badge turns Green, eligible for EWYL)

[01:30 - 02:15] Production BOM & Stock Reservation:
1. Switch to 'Production Orders' -> Click 'Create Work Order'
2. Select 'Dhokra Brass Figurine (50 Units)'
3. Point out automated BOM raw material reservation (15 kg Brass Alloy from WH1)
4. Show pre-flight stock validation check succeed -> Submit Order

[02:15 - 03:00] POS Counter Checkout & GST Invoice:
1. Open 'Retail POS Billing' -> Scan or click 'Sambalpuri Silk Scarf'
2. Show real-time CGST (2.5%) and SGST (2.5%) tax breakdown
3. Select Payment: 'UPI QR Code' -> Click 'Complete Sale'
4. Display instant printable GST Tax Invoice and highlight WH2 stock decrement
```

---

*Document prepared specifically for the viva voce defense of candidate Mansi Sinha (Roll No: 2205160), KIIT Deemed to be University.*
