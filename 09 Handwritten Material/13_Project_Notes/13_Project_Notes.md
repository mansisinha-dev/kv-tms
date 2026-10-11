# 13. DEVELOPER DIARY, MEETING MINUTES & VIVA NOTES
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Developer Work Diary & Implementation Log
* **Weeks 1–2:** Field immersion at KISS vocational training centers (Tailoring, Bamboo craft, Handloom); documented manual bottlenecks.
* **Weeks 3–4:** Designed 3-tier system architecture, formulated DFDs, ER diagrams, and relational schema; supervisor reviewed design.
* **Weeks 5–6:** Developed Spring Boot 3 REST APIs, integrated Spring Security 6 with stateless JWT, configured BCrypt password encryption.
* **Weeks 7–8:** Implemented attendance calculation service with 75% rule; created production work order module and BOM calculation.
* **Weeks 9–10:** Developed React 18 SPA frontend; encountered checkout race condition under concurrency test; solved with pessimistic row locking.
* **Weeks 11–12:** Implemented OLS demand forecasting algorithm; developed Direct Benefit Transfer (DBT) export module in NACH clearing format.
* **Weeks 13–14:** Executed full regression test suite (37 test cases, 88.41% JaCoCo coverage); authored comprehensive capstone documentation.

### 2. Anticipated Viva Defense Questions & Technical Answers
* **Q1: Why did you choose a monolithic multi-module architecture over microservices?**  
  *Answer:* For the scale of KISS (30,000 students and single-campus workshops), a modular monolith with decoupled packages offers the optimal balance of transactional simplicity (ACID guarantees via `@Transactional`), low operational latency (<100ms), and zero distributed network overhead.
* **Q2: How do you prevent stock overselling when two cashiers bill the last item simultaneously?**  
  *Answer:* Through JPA row-level pessimistic write locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`). The first transaction acquires an exclusive lock on the inventory row, decrements stock to 0, and commits. The second transaction observes available stock = 0 and is cleanly rejected with HTTP 409 Conflict.
* **Q3: What makes your attendance and stipend calculation deterministic?**  
  *Answer:* Standard double precision arithmetic suffers from IEEE 754 binary rounding drift. We use Java `BigDecimal` with 4-decimal precision and `RoundingMode.HALF_UP`, ensuring that 149/200 days evaluates to exactly 74.50% and 150/200 evaluates to exactly 75.00%.