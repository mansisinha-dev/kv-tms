# 04. HIGH-LEVEL SYSTEM ARCHITECTURE & 3-TIER TOPOLOGY
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Architectural Philosophy: Decoupled 3-Tier Multi-Layered Style
The architecture enforces strict separation of concerns, high modular cohesion, and stateless horizontal scalability.

### 2. Multi-Tier Decomposition
* **Tier 1 - Presentation Layer (Client SPA):**
  - Framework: React 18 Single Page Application bundled with Vite 5.
  - UI Library: Tailwind CSS with Lucide React iconography adhering to KISS Indigo (`#2D3591`) and Ochre (`#B45309`).
  - State & Routing: React Context API (`AuthContext`, `CartContext`) and React Router DOM.
  - Network Client: Axios with global JWT request interceptors and 401 session expiration handlers.
* **Tier 2 - Application / Business Logic Layer:**
  - Runtime: Java 17 LTS on Spring Boot 3.2.0 framework.
  - Security Pipeline: Spring Security 6 stateless filter chain with JWT validation.
  - Service Layer: 8 core domain services with declarative ACID transaction boundaries (`@Transactional`).
  - Predictive Engine: Embedded statistical Ordinary Least Squares (OLS) regression library.
* **Tier 3 - Persistence Layer:**
  - Database: MySQL 8.0 Enterprise Relational Database Server with InnoDB ACID engine.
  - ORM Mapping: Spring Data JPA and Hibernate ORM.
  - Connection Pool: HikariCP connection pool with max pool size = 10.