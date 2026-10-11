# 12. SOFTWARE TESTING STRATEGY & DEFECT LOG
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Master Testing Scorecard (IEEE 829 Compliance)
* **Total Planned Tests:** 37 / 37 Executed (**100% Pass Rate**).
* **Code Coverage (JaCoCo):** **88.41% Line Coverage** (3,050 / 3,450 lines) | **84.08% Branch Coverage**.
* **Concurrency Performance:** P95 response time of **95.0 ms** under 50 concurrent virtual users in Apache JMeter.
* **Residual Defects:** **0 Open Defects** (6 Logged / 6 Verified Closed).

### 2. Defect Resolution Summary (BUG-001 to BUG-006)
1. **BUG-001 (P1 Blocker):** POS race condition allowing inventory overselling under simultaneous checkouts. *Fix:* Injected `@Lock(LockModeType.PESSIMISTIC_WRITE)` in `InventoryRepository`.
2. **BUG-002 (P2 Critical):** Floating-point precision error in 74.9% attendance threshold check. *Fix:* Refactored calculation to `BigDecimal` with `HALF_UP` rounding.
3. **BUG-003 (P2 Critical):** Work order permitted creation when raw materials were insufficient. *Fix:* Added pre-reservation validation loop throwing `InsufficientRawMaterialException`.
4. **BUG-004 (P3 Major):** GST split truncation discrepancy on odd-rupee invoices. *Fix:* Implemented Banker's Rounding (`HALF_EVEN`) with balancing delta.
5. **BUG-005 (P3 Major):** Confidence interval vectors breaking CSV column alignment. *Fix:* Enclosed vector fields in RFC 4180 quotation blocks.
6. **BUG-006 (P4 Minor):** Department selection info tooltip clipped horizontally on mobile screens. *Fix:* Migrated tooltip component to React Portal on `document.body`.