# SYSTEM ARCHITECTURE SPECIFICATION (SAS)
## KISS Vocational Training Management System (KV-TMS)

**Document Identifier:** KV-TMS-ARCH-v1.0  
**System Name:** KISS Vocational Training Management System  
**Document Version:** 1.0 (Concise Specification)  
**Date:** October 7, 2026  
**Author:** Mansi Sinha  
**Academic Program:** B.Tech. Computer Science & Engineering  
**Department:** School of Computer Science and Engineering, KIIT Deemed to be University  
**Host Institution:** Kalinga Institute of Social Sciences (KISS), Bhubaneswar, Odisha  

---

## 1. EXECUTIVE OVERVIEW & SYSTEM SCOPE

The **KISS Vocational Training Management System (KV-TMS)** is a modern enterprise web application designed to orchestrate vocational trade education, workshop production, dual-warehouse supply chains, retail point-of-sale operations, and student stipend disbursements for over 30,000 indigenous students at Kalinga Institute of Social Sciences (KISS).

This architectural document defines the structural blueprint of the system, illustrating how user requests flow through a decoupled, multi-tier architecture to ensure security, transactional integrity, and operational responsiveness.

### Key Architectural Highlights
* **3-Tier Multi-Layered Architecture:** Strict separation between Presentation, Application Logic, and Data Persistence layers.
* **Stateless REST APIs:** JSON Web Token (JWT) based security eliminating server-side session overhead.
* **ACID Transaction Boundaries:** Declarative `@Transactional` service boundaries ensuring atomic inventory deductions and financial ledger integrity.
* **Applied AI Demand Forecasting:** Embedded statistical time-series model (Holt-Winters) and Reorder Point (ROP) logic assisting production scheduling.

---

## 2. SYSTEM ARCHITECTURE DIAGRAM

The system follows a tiered client-server topology connecting institutional actors with specialized backend services and relational persistence:

![KV-TMS System Architecture Diagram](KV-TMS%20System%20Architecture.png)  
*Figure 2.1: KV-TMS Multi-Tier System Architecture Diagram*

### Architectural Tier Summary
1. **Tier 1 - Presentation Layer:** Web-based single-page application built with React 19 and styled with Tailwind CSS, providing responsive dashboards for Trainees, Trainers, Production Managers, and Administrators.
2. **Tier 2 - Application / Business Logic Layer:** Spring Boot 3.x backend exposing RESTful APIs, securing operations via Spring Security and JWT, and orchestrating eight core domain services.
3. **Tier 3 - Data Persistence Layer:** Relational database managed through Spring Data JPA / Hibernate ORM, coupled with an AI-driven statistical demand forecasting engine.

---

## 3. THE 3-TIER ARCHITECTURE BREAKDOWN

### 3.1 Tier 1: Presentation Layer (Client SPA)
* **Framework:** React 19 Single Page Application bundled with Vite for fast HMR and modular rendering.
* **User Interface:** Built with Tailwind CSS and Lucide React icons, adhering to KISS institutional branding (Royal Indigo `#2D3591` and Leaf Green `#48B859`).
* **State Management:** React Context API handling user authentication claims (`AuthContext`) and real-time shopping cart state for retail POS (`CartContext`).
* **API Communication:** Axios client configured with global request interceptors that inject JWT bearer tokens and response interceptors handling session expirations.

### 3.2 Tier 2: Application & Business Logic Layer (Backend Services)
* **Framework:** Spring Boot 3.x running on Java 17+, implementing the Controller-Service-Repository pattern.
* **Security:** Spring Security 6.x stateless filter chain with BCrypt password hashing and HMAC-SHA256 signed JWT tokens.
* **Transaction Safety:** Declarative `@Transactional` boundaries preventing partial data updates during complex operations (e.g. BOM deduction and POS checkout).
* **Forecasting Subsystem:** Embedded statistical algorithms calculating 30-day demand curves via Holt-Winters exponential smoothing and inventory Reorder Points (ROP).

### 3.3 Tier 3: Data Persistence Layer (Database)
* **Object-Relational Mapping:** Hibernate ORM 6.x and Spring Data JPA repositories abstracting SQL operations.
* **Database Engine:** Relational storage (In-memory H2 Database for academic evaluation; fully compatible with PostgreSQL / MySQL for production deployment).
* **Integrity Controls:** Strict foreign key constraints, unique SKU/Aadhaar indexes, and audit timestamps (`createdAt`, `updatedAt`).

---

## 4. CORE APPLICATION MODULES

The application layer comprises eight specialized modules designed for high cohesion and loose coupling:

| Module Name | Primary Purpose | Key Capabilities |
| :--- | :--- | :--- |
| **Authentication & Auth** | Identity and access management | User login, BCrypt password validation, JWT generation and role validation. |
| **Training Management** | Vocational academic administration | Cohort batch enrollment, daily attendance tracking, 75% threshold alerts, leave reviews. |
| **Product Creation** | Product catalog definitions | Trade SKU definitions, pricing, piece-rate stipend rates, and category metadata. |
| **Production Management** | Workshop manufacturing runs | Work order scheduling, automated BOM raw material deductions, and QC inspection audits. |
| **Dual Warehouse Logistics** | Two-tier inventory management | Segregation between Warehouse 1 (Raw Materials) and Warehouse 2 (Finished Goods). |
| **Sales & Distribution** | Retail commercialization | High-speed POS billing terminal, barcode search, multi-tender payments, GST tax calculation. |
| **Reports & Analytics** | Operational business intelligence | Attendance trends, inventory stock levels, QC pass/reject rates, and sales velocities. |
| **System Administration** | Platform governance | User account provisioning, institutional notice board broadcasts, and system configs. |

---

## 5. TECHNOLOGY STACK SUMMARY

| Tier / Component | Technology Selected | Design Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite, Tailwind CSS | Fast component rendering, responsive layouts, modular state management. |
| **Icons & Charts** | Lucide Icons, Recharts | Clean, accessible iconography and interactive data visualization charts. |
| **Backend Framework** | Spring Boot 3.x, Java 17+ | Enterprise reliability, rapid REST API development, strong dependency injection. |
| **Security** | Spring Security 6.x, JWT | Stateless authentication, token-based authorization, scalable session design. |
| **Persistence & ORM** | Spring Data JPA, Hibernate | Standardized repository pattern, type-safe query methods, automatic schema mapping. |
| **Database** | H2 / PostgreSQL | Zero-configuration evaluation storage with seamless migration to enterprise SQL. |

---

## 6. SECURITY & TRANSACTIONAL DATA FLOW

### 6.1 Stateless Authentication Flow
User sessions are managed entirely statelessly without server-side HTTP session storage:
1. **Authentication:** The client sends credentials via `POST /api/auth/login`.
2. **Verification:** Backend checks the BCrypt password hash. If valid, it returns a signed JWT containing user claims and role (`ROLE_ADMIN`, `ROLE_TRAINER`, `ROLE_STUDENT`, or `ROLE_PRODUCTION_MANAGER`).
3. **Authorization:** The client stores the token in memory and attaches it as `Authorization: Bearer <token>` on every subsequent API call.
4. **Access Verification:** A custom Spring Security filter validates the token on each request, rejecting expired or tampered calls with HTTP 401/403.

### 6.2 Critical Atomic Transactions
* **Work Order Launch (BOM Deduction):** When a work order is created, the system verifies available raw stock in Warehouse 1, calculates the required Bill of Materials, and atomically decrements inventory in a single database transaction. If stock is insufficient, the operation is blocked.
* **POS Retail Checkout:** When a sale is processed, the system validates Warehouse 2 stock, deducts sold units, calculates GST tax, creates the invoice (`INV-YYYYMMDD-XXXX`), and updates sales history atomically.

---

## 7. SIGN-OFF & VERIFICATION

This System Architecture Specification provides an accurate, verified technical overview of the KISS Vocational Training Management System (KV-TMS) as implemented.

**Prepared By:** Mansi Sinha  
**Signature:** ____________________________  
**Date:** October 7, 2026  

**Faculty Guide Review:**  
**Department:** School of Computer Science & Engineering, KIIT  
**Signature:** ____________________________  
**Date:** ____________________________  
