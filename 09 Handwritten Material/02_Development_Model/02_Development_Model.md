# 02. SOFTWARE DEVELOPMENT LIFECYCLE (SDLC) MODEL
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Methodology Selection: Agile / V-Model Hybrid
To balance the iterative refinement of user interfaces with the strict regulatory compliance required for banking disbursements and academic certification, KV-TMS adopted a **Hybrid Agile / V-Model SDLC framework**.

* **Why Not Pure Waterfall?** Waterfall assumes fixed upfront requirements. However, workshop workflows (fabrication scrap rates, craft inspection criteria) required iterative discovery alongside vocational trainers.
* **Why Not Unstructured Agile?** Pure Agile lacks formal verification documentation. University capstone evaluation and institutional banking compliance demand rigorous IEEE 829 test plans and traceability matrices.

### 2. V-Model Verification & Validation Correspondence
* **Requirements Phase (SRS):** Corresponds directly to **System & Acceptance Testing** (37 Test Cases).
* **High-Level Design (HLD):** Corresponds directly to **Integration Testing** (REST APIs, Security Filters).
* **Low-Level Design (LLD):** Corresponds directly to **Component & Concurrency Testing** (Pessimistic DB Locks).
* **Source Code Implementation:** Corresponds directly to **Unit Testing** (JUnit 5, Mockito, 88.41% JaCoCo).

### 3. Iterative Sprint Roadmap (7 Sprints)
* **Sprint 1:** Domain research at KISS workshops, stakeholder requirements engineering.
* **Sprint 2:** Core backend infrastructure, Spring Boot 3.2.0, Spring Security 6, JWT, MySQL 8.0 schema.
* **Sprint 3:** Academic registry, batch management, attendance capture, 75% rule engine.
* **Sprint 4:** Workshop work orders, atomic BOM raw stock deduction, dual-warehouse inventory.
* **Sprint 5:** Retail POS terminal, concurrent checkout locking, GST tax invoicing.
* **Sprint 6:** AI forecasting module (OLS regression), monthly DBT stipend export.
* **Sprint 7:** Quality assurance, JMeter concurrency benchmarks, defect resolution, capstone documentation.