# NON-FUNCTIONAL REQUIREMENTS SPECIFICATION (NFRD)
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-NFRD-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Initial System Specification)  
**Date:** October 7, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. DOCUMENT CONTROL & EXECUTIVE SUMMARY

### 1.1 Purpose of the Document
This Non-Functional Requirements Document (NFRD) defines the quality criteria, operational thresholds, security controls, architectural constraints, and performance benchmarks governing the **KISS Vocational Training Management System (KV-TMS)**. 

While the Functional Requirements Document (FRD) specifies *what* the system does across each module, this document defines *how well* the system performs its functions under varying operational, environmental, and infrastructural conditions. It establishes the technical criteria necessary to guarantee system stability, user responsiveness, data confidentiality, financial auditability, and regulatory compliance.

### 1.2 System Scope & Operational Context
KV-TMS operates as a mission-critical enterprise web application at KISS. It bridges educational workflows (trainee batch management, attendance, grading) with commercial workshop production, two-tier dual-warehouse logistics, Point of Sale (POS) retail billing, automated Direct Benefit Transfer (DBT) student stipends, and AI-driven demand forecasting. 

Given the diversity of end-users—ranging from vocational students and workshop supervisors to academic trainers, retail cashiers, and central administrators—the non-functional architecture must balance high security with low technical friction, low-latency responsiveness, and fault-tolerant transactional integrity.

### 1.3 Quality Standard Framework
This specification is structured in alignment with the international **ISO/IEC 25010 Software Product Quality Model**, categorizing non-functional requirements into eight foundational quality characteristics:
1. **Performance Efficiency** (Time behavior, resource utilization, throughput capacity)
2. **Security & Data Privacy** (Confidentiality, integrity, non-repudiation, authentication)
3. **Reliability & Availability** (Maturity, fault tolerance, recoverability, ACID boundaries)
4. **Usability & Accessibility** (Learnability, ergonomics, visual aesthetics, WCAG compliance)
5. **Maintainability & Modularity** (Modularity, reusability, testability, analysability)
6. **Portability & Compatibility** (Browser agnosticism, multi-device layouts, database flexibility)
7. **Scalability & Capacity** (Data volume growth, horizontal elasticity, user concurrency)
8. **Financial Auditability & Traceability** (Immutable transaction records, verified output tracking)

---

## 2. SYSTEM ARCHITECTURE & NON-FUNCTIONAL DESIGN CONSTRAINTS

KV-TMS is deployed as a decoupled multi-tier architecture engineered for high throughput and zero session state:

```
+---------------------------------------------------------------------------------------------------+
|                                  NON-FUNCTIONAL ARCHITECTURE OVERVIEW                             |
+---------------------------------------------------------------------------------------------------+
|  [PRESENTATION TIER]                                                                              |
|  - Client Runtime: Modern Evergreen Browsers (Chrome, Edge, Firefox, Safari)                     |
|  - Framework: React 19 SPA, Vite 8, Tailwind CSS, Lucide Icons, Recharts SVG Engine               |
|  - Quality Bounds: First Paint <= 1.2s, Sub-100ms View Switching, Fully Responsive (375px - 4K)  |
+-------------------------------------------------+-------------------------------------------------+
                                                  | TLS 1.3 / HTTPS (Stateless JSON + JWT Bearer)
                                                  v
+---------------------------------------------------------------------------------------------------+
|  [APPLICATION TIER - SPRING BOOT 3.x]                                                             |
|  - Runtime: Java Virtual Machine (JDK 17 LTS), Embedded Apache Tomcat 10                          |
|  - Security Pipeline: Spring Security 6.x Filters, HMAC-SHA256 JWT, BCrypt Salt Work Factor = 10 |
|  - Quality Bounds: Transactional Latency <= 200ms, Analytic Compute <= 1.5s, Sustained 100 req/s  |
|  - Transactional Isolation: @Transactional ACID Boundaries, Rollback on RuntimeException          |
+-------------------------------------------------+-------------------------------------------------+
                                                  | Spring Data JPA / Hibernate 6.x Connection Pool
                                                  v
+---------------------------------------------------------------------------------------------------+
|  [DATA STORAGE TIER]                                                                              |
|  - Storage Engine: Relational Database (H2 In-Memory for evaluation; PostgreSQL 15+ / MySQL 8.0)  |
|  - Quality Bounds: Query Execution <= 50ms (Indexed), Foreign Key Integrity, Daily Snapshots      |
|  - Capacity Bounds: Up to 50,000 Trainees, 250,000 Attendance Records, 1,000,000 POS Items        |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. DETAILED NON-FUNCTIONAL REQUIREMENTS SPECIFICATION

### CATEGORY 1: PERFORMANCE EFFICIENCY & CAPACITY

#### NFR-PRF-001: Standard Transactional API Response Latency
- **Metric / Benchmark:** $\le 200 \text{ ms}$ (95th percentile).
- **Target Operations:** User authentication, daily attendance marking, inventory lookups, product catalog search, and cart updates.
- **Specification:** The backend REST controllers shall process incoming requests, complete all necessary database interactions, and return an HTTP response within $200\text{ ms}$ under normal network conditions.

#### NFR-PRF-002: Analytical Computation & AI Forecasting Latency
- **Metric / Benchmark:** $\le 1.5 \text{ seconds}$.
- **Target Operations:** 30-day time-series demand curve calculations (Holt-Winters smoothing), historical sales velocity aggregation, and multi-cohort attendance summary reporting.
- **Specification:** Heavy analytical queries shall execute efficiently using optimized JPA projection queries and in-memory mathematical algorithms to return complete projection models in under $1.5\text{ seconds}$.

#### NFR-PRF-003: Client First Contentful Paint & Single-Page Transition Speed
- **Metric / Benchmark:** Initial Load $\le 1.2 \text{ seconds}$; Route Transitions $\le 100 \text{ ms}$.
- **Target Interface:** React 19 SPA running on standard broadband (minimum $10 \text{ Mbps}$).
- **Specification:** The client bundle produced by Vite shall achieve First Contentful Paint (FCP) within $1.2\text{ seconds}$. Internal view routing between consoles (e.g., transitioning from Dashboard to Dual Warehouse) shall render instantaneously ($< 100\text{ ms}$) without full-page reloads.

#### NFR-PRF-004: User Concurrency & Simultaneous Workstation Load
- **Metric / Benchmark:** $\ge 250$ simultaneous active concurrent users.
- **Specification:** The application server and database connection pool (HikariCP) shall comfortably sustain at least 250 simultaneous active authenticated sessions across trade workshops, POS terminals, and student consoles without thread exhaustion or response degradation exceeding $20\%$.

#### NFR-PRF-005: Database Query Execution Optimization
- **Metric / Benchmark:** $\le 50 \text{ ms}$ query latency for indexed lookups.
- **Specification:** All primary operational lookups—including product SKU search, student roll number/Aadhaar queries, invoice receipt numbering, and work-order batch numbers—shall execute against indexed database fields in $50\text{ ms}$ or less.

#### NFR-PRF-006: Peak Request Throughput Capacity
- **Metric / Benchmark:** $\ge 100 \text{ requests per second (RPS)}$.
- **Specification:** The application tier shall sustain peak burst throughput during morning cohort attendance entry and end-of-shift workshop completion logging without dropping connections or exceeding connection timeout thresholds ($30\text{ seconds}$).

---

### CATEGORY 2: SECURITY, PRIVACY & COMPLIANCE

#### NFR-SEC-001: Stateless Cryptographic JWT Authentication
- **Security Standard:** RFC 7519 compliant JSON Web Tokens (JWT).
- **Algorithm:** HMAC-SHA256 with 256-bit cryptographically secure server secret.
- **Token Claims:** Subject (`username`), Granted Authorities (`roles`), Issued At (`iat`), and Expiration (`exp`).
- **Specification:** The authentication engine shall be completely stateless. No session state or user tokens shall be held in server memory. Tokens carry a default lifespan of 24 hours. Tampered or expired tokens shall be rejected immediately with HTTP 401 Unauthorized.

#### NFR-SEC-002: Credential Hashing & Adaptive Salting
- **Algorithm:** BCrypt with a work factor (salt rounds) of 10.
- **Specification:** Plaintext passwords shall never be persisted, cached, or printed in application logs. All user passwords must be hashed using BCrypt before database persistence.

#### NFR-SEC-003: Method-Level Role-Based Authorization (RBAC)
- **Specification:** Every protected REST endpoint beneath `/api/v1/*` must enforce Spring Security `@PreAuthorize` authorization expressions. 
  - `ROLE_ADMIN`: Administrative governance, user provisioning, POS checkout, DBT disbursements.
  - `ROLE_TRAINER`: Academic curriculum management, cohort attendance, practical evaluations.
  - `ROLE_PRODUCTION_MANAGER`: Work orders, BOM raw material requisitions, QC inspections.
  - `ROLE_TRAINEE`: Personal student portal, leave applications, EWYL stipend views.
  - Unauthenticated access returns HTTP 401; unauthorized role access returns HTTP 403 Forbidden.

#### NFR-SEC-004: Transport Layer Security (TLS/HTTPS)
- **Specification:** All network communications between the browser client and server shall be encrypted using TLS 1.3 (with fallback to TLS 1.2). Unencrypted HTTP traffic shall be redirected to HTTPS in deployed environments.

#### NFR-SEC-005: Cross-Origin Resource Sharing (CORS) Governance
- **Specification:** The Spring Boot backend shall implement strict CORS policies restricting API access exclusively to approved application origins (e.g., `http://localhost:5173` in local development, and the designated university domain in production). Wildcard (`*`) origin access shall be forbidden.

#### NFR-SEC-006: Injection Attack Mitigation & Input Sanitization
- **Specification:** 
  - **SQL Injection:** Mitigated through Spring Data JPA / Hibernate parameterized queries; raw string concatenation in SQL queries is prohibited.
  - **XSS (Cross-Site Scripting):** React JSX automatic output encoding prevents injected HTML or JavaScript strings from executing in the DOM.
  - **Bean Validation:** Incoming JSON request bodies must pass Jakarta Bean Validation (`@NotNull`, `@Size`, `@Min`, `@Email`). Invalid inputs shall be rejected with HTTP 400 Bad Request.

#### NFR-SEC-007: PII & Financial Data Masking
- **Specification:** Trainee Aadhaar numbers and bank account numbers shall be masked when displayed on non-administrative screens (e.g., rendering as `XXXX-XXXX-1234` and `XXXXXX5678`), protecting student privacy in shared workshop environments.

---

### CATEGORY 3: RELIABILITY, AVAILABILITY & FAULT TOLERANCE

#### NFR-REL-001: Operational Availability SLA
- **Metric / Benchmark:** $99.5\%$ uptime during active institutional operational hours (07:00 to 20:00 IST).
- **Specification:** Unscheduled downtime shall not exceed 1.95 hours per month during standard operational periods. Scheduled maintenance windows shall occur outside workshop training hours.

#### NFR-REL-002: ACID Transactional Boundaries & Rollback Integrity
- **Specification:** Multi-table operations that alter system state across modules shall be enclosed within `@Transactional` service boundaries with rollback on any unchecked `RuntimeException`. Specifically:
  - **POS Checkout:** Deducting Warehouse 2 finished stock, recording the invoice header, and inserting line items must succeed as a single atomic unit.
  - **Work Order Launch:** Validating and deducting raw materials from Warehouse 1 must execute atomically.
  - **QC Approval:** Transferring passed crafts to Warehouse 2 and recording trainee stipend entitlements must execute atomically.

#### NFR-REL-003: Graceful Error Handling & Information Leakage Prevention
- **Specification:** In the event of system exceptions, the backend shall intercept errors through `@ControllerAdvice` and return standardized, user-friendly JSON payloads:
```json
{
  "timestamp": "2026-10-07T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient raw materials in Warehouse 1",
  "path": "/api/v1/production/work-orders/101/launch"
}
```
Internal Java stack traces, database schema details, or server directory paths must never be exposed to clients.

#### NFR-REL-004: Backup Frequency & Data Recovery Objectives
- **Backup Schedule:** Automated daily incremental database snapshots and weekly full archive backups.
- **Recovery Point Objective (RPO):** $\text{RPO} \le 1 \text{ hour}$ (maximum permissible data loss window in disaster recovery).
- **Recovery Time Objective (RTO):** $\text{RTO} \le 30 \text{ minutes}$ (time to restore operational state from backup archives).

---

### CATEGORY 4: USABILITY, ERGONOMICS & ACCESSIBILITY

#### NFR-USB-001: Institutional Brand Palette Fidelity
- **Specification:** All user consoles and public showcase portals shall strictly conform to the approved institutional palette:
  - **Primary Brand Green:** Leaf Green `#48B859` (buttons, success badges, primary highlights)
  - **Secondary Brand Indigo:** Royal Indigo `#2D3591` (headers, navigation sidebars, table headers)
  - **Accent Gold:** Warm Gold `#fcb900` (counter badges, active states, milestone stars)
  - **Background Surfaces:** Clean slate backgrounds (`#f8fafc`, `#f1f5f9`) for daytime consoles, and Midnight Indigo / Emerald gradient canvas for the authentication gateway.

#### NFR-USB-002: Multi-Device Responsive Fluidity
- **Specification:** The user interface shall adapt dynamically across standard viewports without horizontal scrolling or UI element clipping:
  - Mobile Phones: $\ge 375\text{px}$ width (single-column card stacks, collapsible mobile menus)
  - Tablets: $\ge 768\text{px}$ width (two-column dashboard grids)
  - Laptops / Desktops: $\ge 1024\text{px}$ - $1920\text{px}$ width (full multi-column tables, analytics sidebars)

#### NFR-USB-003: Accessibility & Color Contrast (WCAG 2.1 Level AA)
- **Specification:** Text elements shall satisfy minimum color contrast ratios: $\ge 4.5:1$ for body text and $\ge 3:1$ for large headings. Interactive buttons shall provide visible `:focus-visible` outline rings for keyboard-only navigation.

#### NFR-USB-004: Ergonomic Feedback & Asynchronous Feedback
- **Specification:** Asynchronous network operations (submitting forms, logging attendance, executing POS checkouts) shall display immediate visual feedback:
  - Primary action buttons show animated loading spinners and enter disabled state to prevent duplicate submissions.
  - Operation results trigger transient toast notifications (green for success, red for errors) auto-dismissing after 4 seconds.

#### NFR-USB-005: Seamless Context Session Bridging
- **Specification:** When an authenticated user browses the public institutional landing portal (`HomePage.jsx`), the system shall evaluate local JWT credentials and present a prominent "Back to Console" CTA button, restoring their active workspace in one click without forcing re-authentication.

---

### CATEGORY 5: MAINTAINABILITY, MODULARITY & LOGGING

#### NFR-MNT-001: Decoupled Multi-Tier Architecture
- **Specification:** The frontend React codebase and backend Spring Boot services shall maintain strict architectural decoupling. The client communicates solely via RESTful JSON contracts, allowing independent refactoring or UI replacements without modifying server logic.

#### NFR-MNT-002: Clean Code Standards & Component Modularity
- **Specification:** 
  - **Java Backend:** Follows standard Spring Boot layer conventions: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Entity`.
  - **React Frontend:** Follows component modularity: reusable UI primitives (cards, badges, modals, toast providers) maintained in dedicated components.

#### NFR-MNT-003: Structured Centralized Application Logging
- **Specification:** The backend shall utilize SLF4J with Logback to produce structured log streams categorized into log levels (`INFO`, `WARN`, `ERROR`). Sensitive data (passwords, tokens, bank account numbers) shall be masked from log outputs.

#### NFR-MNT-004: Modular Extensibility & Future Integrations
- **Specification:** Architecture boundaries shall allow modular additions—such as integrating mobile push notification gateways, external payment gateways (Razorpay), or RFID warehouse scanners—by implementing standalone service beans without breaking existing APIs.

---

### CATEGORY 6: PORTABILITY & COMPATIBILITY

#### NFR-CMP-001: Cross-Browser Compatibility
- **Specification:** The web application shall provide 100% visual and functional parity across all major modern evergreen browsers:
  - Google Chrome (Version 110+)
  - Mozilla Firefox (Version 115+)
  - Microsoft Edge (Version 110+)
  - Apple Safari (Version 16+)

#### NFR-CMP-002: Server Platform & OS Portability
- **Specification:** The backend application is packaged as an executable standalone Spring Boot JAR (`kv-tms.jar`), enabling deployment across Windows Server, Ubuntu/Debian Linux, and containerized Docker environments with zero code modifications.

#### NFR-CMP-003: Relational Database Agnosticism
- **Specification:** Through Hibernate ORM and Spring Data JPA abstraction, the persistence layer functions transparently with embedded H2 (development/evaluation) and production-grade PostgreSQL 15+ / MySQL 8.0 databases via configuration properties without modifying data access logic.

---

### CATEGORY 7: SCALABILITY & DATA VOLUME CAPACITY

#### NFR-SCL-001: Data Volume Storage Capacity
- **Specification:** The database schema and index strategy shall support up to 5 years of vocational operations without performance degradation:
  - Up to $50,000$ Trainee historical profile records
  - Up to $250,000$ Daily attendance session records
  - Up to $100,000$ Production work orders and QC logs
  - Up to $500,000$ Dual-warehouse inventory transactions
  - Up to $1,000,000$ Point of Sale transaction line items

#### NFR-SCL-002: Stateless Horizontal Scaling
- **Specification:** By externalizing all session state into client-held signed JWTs, the application server can scale horizontally across multiple instances behind a load balancer (e.g., Nginx or AWS Application Load Balancer) without requiring sticky sessions or distributed session replication.

---

### CATEGORY 8: FINANCIAL AUDITABILITY & GOVERNANCE

#### NFR-AUD-001: Immutable Financial & Transaction Ledgers
- **Specification:** All financial disbursements recorded under the Earn While You Learn (DBT) engine and Point of Sale (POS) retail receipts shall be strictly immutable. Completed transactions cannot be deleted or overwritten; corrections must occur via audited adjustment transactions.

#### NFR-AUD-002: End-to-End Craft Traceability Lineage
- **Specification:** The system shall maintain bidirectional audit trails linking every finished product SKU in Warehouse 2 back to:
  1. The specific shop-floor work order and batch number.
  2. The raw material lot consumed from Warehouse 1.
  3. The Quality Control (QC) inspection log and supervisor ID.
  4. The individual vocational trainee attributed for piece-rate stipend payouts.

---

## 4. NON-FUNCTIONAL REQUIREMENTS VERIFICATION MATRIX (NFRVM)

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
|                                             NON-FUNCTIONAL REQUIREMENTS VERIFICATION MATRIX                                             |
+---------------+-------------------------------+-------------------------------+-----------------------+---------------------------------+
| Req ID        | Quality Attribute             | Metric / Threshold Criteria   | Verification Method   | Target Component / Scope        |
+---------------+-------------------------------+-------------------------------+-----------------------+---------------------------------+
| NFR-PRF-001   | API Response Latency          | <= 200 ms (95th percentile)   | Automated Load Test   | REST Controllers / Services     |
| NFR-PRF-002   | Analytical / Forecast Latency | <= 1.5 seconds                | Benchmark Timer       | ForecastController (AI Engine)  |
| NFR-PRF-003   | Client First Contentful Paint | <= 1.2s load, <= 100ms route  | Lighthouse / DevTools | React 19 Frontend (Vite)        |
| NFR-PRF-004   | User Concurrency              | >= 250 simultaneous sessions  | JMeter Stress Test    | Embedded Tomcat / HikariCP      |
| NFR-PRF-005   | Database Query Latency        | <= 50 ms on indexed fields    | SQL Query Profiling   | JPA Repositories / Relational DB|
| NFR-SEC-001   | Stateless JWT Authentication  | HMAC-SHA256, 24h expiration   | Security Audit Test   | JwtAuthenticationFilter         |
| NFR-SEC-002   | Password Hashing              | BCrypt (10 salt rounds)       | Code Inspection       | AuthController / UserService    |
| NFR-SEC-003   | Method-Level Authorization    | @PreAuthorize role evaluation | Role Escalation Test  | Spring Security Filter Chain    |
| NFR-SEC-004   | Transport Security            | TLS 1.3 / HTTPS encryption    | Network Packet Audit  | Application Gateway / TLS       |
| NFR-SEC-005   | CORS Restrictions             | Whitelisted origins only      | Origin Header Test    | WebSecurityConfig.java          |
| NFR-SEC-006   | Injection Prevention          | Parameterized JPA + Bean Valid| DAST Vulnerability Scan| JPA Repositories / DTOs         |
| NFR-REL-001   | System Availability           | 99.5% operational uptime      | Uptime Monitoring     | Server Host Environment         |
| NFR-REL-002   | ACID Transaction Boundaries   | Rollback on RuntimeException  | Failure Injection Test| @Transactional Services         |
| NFR-REL-003   | Graceful Error Schemas        | Standard JSON, zero trace leak| Exception Audit       | GlobalExceptionHandler.java     |
| NFR-REL-004   | Backup & Recovery             | RPO <= 1h, RTO <= 30m         | Disaster Recovery Drill| Database Backup Utilities      |
| NFR-USB-001   | Brand Identity Fidelity       | Green #48B859, Indigo #2D3591 | UI Style Audit        | Tailwind CSS Design System      |
| NFR-USB-002   | Responsive Fluidity           | Mobile (375px) to 4K desktop  | Cross-Device Emulation | Frontend Responsive Layouts     |
| NFR-USB-003   | Accessibility (WCAG 2.1 AA)   | Contrast >= 4.5:1, Focus Rings| Axe / WAVE Audit      | UI Design System                |
| NFR-MNT-001   | Decoupled Architecture        | RESTful JSON contracts only   | Architecture Review   | Frontend / Backend Boundary     |
| NFR-MNT-003   | Centralized Logging           | SLF4J Logback structured logs | Log Stream Audit      | Backend Service Layer           |
| NFR-CMP-001   | Browser Compatibility         | Chrome, Edge, Firefox, Safari | Cross-Browser Matrix   | React Web Client                |
| NFR-SCL-001   | Data Capacity Scale           | 50k Trainees, 1M POS items    | Synthetic Data Volume | Relational Database Engine      |
| NFR-AUD-001   | Financial Immutability        | Zero record mutation allowed  | Ledger Audit Script   | Incentive / Sales Ledgers       |
| NFR-AUD-002   | Output-to-Trainee Traceability| 100% SKU-to-Trainee lineage   | Lineage Query Audit   | WorkOrder / QC / Stipend Tables |
+---------------+-------------------------------+-------------------------------+-----------------------+---------------------------------+
```

---

## 5. SIGN-OFF & VERIFICATION

This Non-Functional Requirements Document represents the verified quality and operational specification of the KISS Vocational Training Management System (KV-TMS).

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 7, 2026  

**Faculty Guide Review:**  
**Name & Designation:** School of Computer Science & Engineering, KIIT  
**Signature:** ____________________________  
**Date:** ____________________________  
