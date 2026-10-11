# MASTER TEST PLAN (IEEE 829 STANDARD)
## KISS Vocational Training Management System (KV-TMS)

> **Document ID:** `KV-TMS-STLC-MTP-v1.0`  
> **Version:** 1.0 (Quality Assurance Blueprint)  
> **Project Candidate:** Mansi Sinha | **Date:** October 8, 2026  
> **Department:** School of Computer Science & Engineering, KIIT Deemed to be University  
> **Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. Executive Overview & Test Strategy Purpose

### 1.1 Purpose of the Master Test Plan
The **Master Test Plan (MTP)** establishes the formal verification and validation framework for the **KISS Vocational Training Management System (KV-TMS)** in full compliance with the **IEEE 829-2008 Standard for Software and System Test Documentation**. As an individual capstone engineering project, this plan defines the quality gates, test levels, automation tooling, data fixtures, execution workflows, defect resolution SLAs, and acceptance criteria executed by the candidate.

KV-TMS digitizes the vocational training, manufacturing, commercial retail, and welfare stipends of 40,000+ indigenous tribal students. Rigorous testing guarantees sub-second POS checkout responsiveness, deterministic 75% attendance calculations, strict stock balance integrity, and fail-safe Direct Benefit Transfer (DBT) welfare disbursements.

### 1.2 Key Quality Objectives & Reliability Targets
* **Code Coverage Benchmark:** Minimum 85% line coverage and 80% branch coverage across backend Spring Boot service layers.
* **Defect Clearance Standard:** Zero Priority 1 (Blocker) and zero Priority 2 (Critical) defects permitted at project sign-off.
* **Concurrency & Data Integrity:** 100% thread safety during concurrent POS checkouts with zero inventory overselling.
* **Regulatory & Welfare Compliance:** 100% deterministic evaluation of the 75% attendance threshold for DBT disbursement eligibility.
* **Performance Baseline:** 95th percentile (p95) API response time < 500 ms under simulated multi-terminal load.

---

## 2. Items Under Test & System Boundaries

### 2.1 In-Scope Functional Modules
* **Module 1: Authentication & RBAC:** JWT lifecycle, bcrypt password hashing, and role-based access for Admin, Instructor, Student, POS Operator, and QA Inspector.
* **Module 2: Academic Registry & Attendance:** Student enrollment, RFID/biometric timestamp capture, daily attendance evaluation, and automatic calculation of the 75% DBT attendance threshold.
* **Module 3: Vocational Manufacturing & BOM:** Production batch initiation, Bill of Materials (BOM) stock validation, raw material stock deductions, and production lifecycle state transitions.
* **Module 4: Quality Control & Assurance:** Mandatory parameter inspections, inspection verdict logging (Pass, Fail, Quarantine), and batch release into finished goods inventory.
* **Module 5: Commercial POS Retail:** Real-time barcode scanning, pessimistic stock locking (`SELECT ... FOR UPDATE`), automated GST invoicing, and transaction auditing.
* **Module 6: Predictive AI & DBT Welfare:** Holt-Winters 30-day demand curves, automated DBT stipend calculations, and batch disbursement processing.

### 2.2 Out-of-Scope Items
* Physical biometric terminal hardware firmware fabrication (simulated via standard USB/TCP byte payload mocks).
* National Core Banking System internal infrastructure (validated via simulated sandbox webhooks and mock payment endpoints).

---

## 3. Multi-Tiered Testing Strategy & Test Levels

The KV-TMS testing strategy employs a five-tier testing pyramid to ensure defect detection at the earliest possible stage of development.

### 3.1 Architectural Test Levels
1. **Tier 1: Unit Testing:** Isolates individual Java classes and React components. Backend unit tests utilize JUnit 5, Mockito, and AssertJ to mock dependencies and validate business calculations (e.g. GST rates, BOM quantity multipliers, attendance percentages). Frontend unit tests utilize Vitest and React Testing Library to verify component state, input validation, and user interaction handlers.
2. **Tier 2: Integration Testing:** Validates component interoperability. Backend integration tests leverage `@SpringBootTest` and `MockMvc` against an in-memory H2 database running in PostgreSQL compatibility mode. Verifies Spring Data JPA repository queries, entity relationships, cascade deletions, security filter chains, and transactional rollbacks.
3. **Tier 3: System & End-to-End (E2E) Testing:** Exercises complete operational lifecycles from start to finish. Simulates end-to-end workflows: Raw Material Requisition &rarr; Production Batch Execution &rarr; QC Inspection &rarr; Finished Goods Inventory &rarr; POS Retail Sale &rarr; GST Invoice &rarr; DBT Welfare Payout.
4. **Tier 4: Security & Vulnerability Testing:** Validates OWASP Top 10 vulnerabilities. Evaluates JWT token tampering, expired token rejection, unauthorized role privilege escalation, SQL injection resilience via parameterized JPA queries, and Cross-Site Scripting (XSS) sanitation on user inputs.
5. **Tier 5: Concurrency & Performance Testing:** Stresses transactional endpoints. Utilizes Apache JMeter to simulate 50 concurrent POS terminals attempting to purchase the last remaining stock unit simultaneously, verifying that pessimistic database locking (`SELECT ... FOR UPDATE`) completely prevents inventory overselling.

### 3.2 Multi-Tier Test Strategy Matrix

| Test Level | Scope & Target Components | Tools & Frameworks | Target Coverage | Pass / Gate Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **Unit Testing (Backend)** | Service classes, utility functions, BOM calculators, DBT rule engines, DTO mappers | JUnit 5, Mockito, AssertJ | &ge; 85% Line Coverage<br>&ge; 80% Branch Coverage | 100% assertions green; zero unhandled exceptions; sub-5ms per test execution. |
| **Unit Testing (Frontend)** | React components, custom hooks, input validators, state stores, formatting utils | Vitest, React Testing Library, jsdom | &ge; 80% Component Coverage | Zero render warnings; all UI state transitions and form validations pass. |
| **Integration Testing** | Spring Data JPA repositories, REST Controllers, Security filter chain, H2 DB | `@SpringBootTest`, `MockMvc`, Testcontainers | 100% REST endpoints & DB Repositories | Zero SQL constraint violations; ACID transactions verified; mock HTTP 200/201/400/403 accurate. |
| **System & E2E Testing** | Complete cross-module business journeys (Procurement &rarr; Manufacturing &rarr; POS &rarr; DBT) | Postman / Newman, Playwright | 100% Core Business Journeys (15 flows) | All end-to-end transactions complete with correct ledger and stock state updates. |
| **Security Testing** | Authentication bypass, role escalation, JWT tampering, SQLi, XSS, CSRF | OWASP ZAP, Postman Security Tests | 100% Public & Protected Endpoints | Zero High/Critical security vulnerabilities; 401/403 enforced on all restricted routes. |
| **Concurrency & Load** | POS checkout concurrency, attendance clock-in bursts, 30-day forecast generation | Apache JMeter, k6 | 50 Concurrent POS users;<br>500 attendances/min | Zero overselling race conditions; p95 latency < 500ms; zero DB deadlock crashes. |

---

## 4. Test Environment, Tooling & Test Data Management

The KV-TMS testing harness operates across isolated development, local integration, and staging environments to ensure repeatability and environment parity.

### 4.1 Environment Architecture & Spring Configuration Profiles
* **Development & Unit Harness:** Developer workstation running OpenJDK 21, Node.js 20 LTS, and embedded H2 In-Memory RDBMS. Executes fast, dependency-free unit suites in under 60 seconds.
* **Integration Testing Harness:** Automated test pipeline utilizing Spring Profile `@ActiveProfiles("test")`. Configures H2 in PostgreSQL 16 mode with identical table constraints, sequences, and transactional semantics as production.
* **Staging & Pre-Release Environment:** Full-fidelity cluster running PostgreSQL 16 on Docker, containerized Spring Boot 3.x backend, Nginx reverse proxy, and compiled React production assets.

### 4.2 Test Automation Infrastructure Catalog

| Tool / Library | Version | Testing Domain | Configuration Standard & Operational Role |
| :--- | :--- | :--- | :--- |
| **JUnit 5 (Jupiter)** | 5.10.2 | Backend Unit & Integration | Core test runner for unit tests, parameter-driven test cases, and lifecycle assertions. |
| **Mockito Framework** | 5.11.0 | Mocking & Stubbing | Mocks external hardware endpoints, banking gateways, and inter-service dependencies. |
| **Spring MockMvc** | 6.1.5 | REST Controller Integration | Simulates HTTP client requests with headers, JWT tokens, and JSON payloads without HTTP overhead. |
| **AssertJ** | 3.25.3 | Fluent Assertions | Provides expressive, type-safe assertions for collections, entity states, and numeric calculations. |
| **H2 In-Memory DB** | 2.2.224 | Relational Data Persistence | Fast in-memory database configured with `MODE=PostgreSQL` for rapid schema testing. |
| **JaCoCo Core** | 0.8.11 | Code Coverage Reporting | Instruments Java bytecode during Maven build; enforces 85% coverage rule during verification phase. |
| **Vitest & RTL** | 1.4.0 / 14.2 | Frontend Unit & Component | Executes React component tests, hook behaviors, mock event handlers, and UI renders. |
| **Apache JMeter** | 5.6.3 | Concurrency & Stress Testing | Generates multi-threaded HTTP traffic simulating concurrent POS counters and biometric bursts. |
| **Postman / Newman** | 10.24 / 6.1 | API Regression & E2E | Automates regression test collections against running Spring Boot endpoints in CI pipeline. |

### 4.3 Synthetic Test Data & State Management Strategy
* **Seed Dataset (`data-test.sql`):** Pre-populates 5 vocational trades, 10 instructor accounts, 100 student profiles, 25 raw materials, and initial production batches for predictable testing baseline.
* **Boundary & Edge-Case Fixtures:** Synthetic attendance records specifically targeting eligibility boundary conditions (e.g. 74.9% vs. 75.0% attendance), zero-balance stock alerts, and single-unit stock quantities.
* **Transactional Isolation:** Integration tests are annotated with `@Transactional` to guarantee that database changes roll back cleanly after each test method, preventing state contamination between test cases.
* **Data Privacy & PII Compliance:** All student test fixtures use synthetic Aadhaar tokens, pseudo bank account numbers, and simulated biometric templates to protect tribal student privacy.

---

## 5. Test Phasing Criteria & Defect Management Workflow

Strict entry, suspension, and exit criteria govern each test phase to maintain quality integrity throughout the development lifecycle.

### 5.1 Quality Gate Criteria
* **Test Entry Criteria:** Clean compilation of backend and frontend code with zero compilation errors; database schema migrations applied successfully without syntax failures; baseline synthetic test fixtures loaded; all previous unit tests passing at 100%.
* **Test Suspension Criteria:** Occurrence of a Priority 1 (Blocker) defect that renders the test environment inoperable; inability to authenticate or obtain valid JWT tokens; database connection pool exhaustion or corrupt test database state.
* **Test Resumption Criteria:** Deployment of a verified hotfix addressing the blocker issue; clean re-initialization of the test database and synthetic fixtures; successful smoke test execution.
* **Test Exit & Acceptance Criteria:** 100% execution of all planned test cases; 100% pass rate on Priority 1 (Blocker) and Priority 2 (Critical) test cases; minimum 98% overall test pass rate; zero open P1 or P2 defects; verified JaCoCo line coverage &ge; 85%.

### 5.2 Formal Defect Management Lifecycle
All identified defects follow a structured state machine: **New &rarr; Triaged &rarr; Assigned &rarr; In Progress &rarr; Fixed &rarr; Retested &rarr; Closed**. Rejected or duplicate defects transition to *Rejected* or *Duplicate* with mandatory rationale documentation.

### 5.3 Defect Severity Classification & SLA Matrix

| Severity Level | Definition & Operational Impact | Response SLA | Fix SLA | KV-TMS Operational Example |
| :--- | :--- | :--- | :--- | :--- |
| **P1 - Blocker** | Total system crash, critical data loss, complete authentication failure, or catastrophic database deadlock. | &le; 1 Hour | &le; 4 Hours | POS terminal crashes during checkout; database deadlock halts all manufacturing batch updates; JWT validation fails globally. |
| **P2 - Critical** | Major feature broken with no feasible workaround; financial discrepancy in DBT stipend or retail GST calculation. | &le; 2 Hours | &le; 8 Hours | Inventory overselling occurs under concurrent checkouts; student with 76% attendance incorrectly denied DBT payout. |
| **P3 - Major** | Significant defect affecting non-critical functionality; viable manual workaround exists. | &le; 4 Hours | &le; 24 Hours | AI Demand Forecast graph fails to render on UI, but underlying REST API calculation returns valid data; export to CSV times out. |
| **P4 - Minor / Trivial** | Cosmetic defect, minor UI styling misalignment, formatting anomaly, or harmless warning log. | &le; 8 Hours | &le; 48 Hours | Misaligned table column on Quality Inspection report; minor spelling error on student registration tooltip. |

---

## 6. Execution Schedule, Risk Mitigation & Sign-Off

### 6.1 STLC Milestones & Execution Timeline

| STLC Milestone | Duration | Key Activities & Output Deliverables | Execution Responsibility |
| :--- | :--- | :--- | :--- |
| **1. Test Planning** | Week 1 (3 Days) | Draft Master Test Plan, establish quality gates, configure test environments and tools. | Mansi Sinha (Lead Developer) |
| **2. Test Case Design** | Week 1 (4 Days) | Author functional & non-functional test cases; build Traceability Matrix; seed test data fixtures. | Mansi Sinha (Lead Developer) |
| **3. Unit & Integration** | Week 2 (5 Days) | Automate JUnit 5 & MockMvc suites; integrate JaCoCo coverage reports into build cycle. | Mansi Sinha (Lead Developer) |
| **4. System & Concurrency** | Week 3 (5 Days) | Execute end-to-end operational flows, run JMeter concurrency tests on POS and DBT engines. | Mansi Sinha (Lead Developer) |
| **5. Defect Retest & Closure** | Week 4 (4 Days) | Retest logged bug fixes; run full regression test suites; compile Final Test Summary Report. | Mansi Sinha (Lead Developer) |

### 6.2 Technical Risk Assessment & Proactive Mitigations

| Identified Test Risk | Probability | Impact | Proactive Technical Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **Concurrent POS Stock Overselling** | Medium | Critical | Implement automated JMeter stress tests simulating 50 simultaneous checkouts against 1 stock unit; verify pessimistic database row locking. |
| **DBT Attendance Rounding Flaws** | Low | High | Author parameterized unit tests covering exact floating-point edge cases (74.90% to 75.05%); enforce exact `BigDecimal` math. |
| **Biometric Hardware Unavailable** | High | Medium | Deploy high-fidelity mock USB/TCP socket server simulating biometric device responses and RFID scans for uninterrupted testing. |
| **Test Data Contamination** | Medium | Medium | Enforce `@Transactional` rollbacks on all integration tests; automate test database rebuild before test suite execution. |

### 6.3 Master Test Plan Verification & Academic Sign-Off

| Academic Role | Name & Affiliation | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Project Candidate & Developer** | Mansi Sinha, B.Tech CSE | ____________________________ | October 8, 2026 |
| **Faculty Project Guide** | School of Computer Science & Engg, KIIT | ____________________________ | ____________________________ |
| **Project Review Committee** | KIIT Deemed to be University | ____________________________ | ____________________________ |
