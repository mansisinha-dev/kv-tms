# 11. MATHEMATICAL FORMULATIONS & CORE ALGORITHMS
## KISS Vocational Training Management System (KV-TMS)

**Candidate Name:** Mansi Sinha | **Roll Number:** 2205160  
**Department:** School of Computer Science & Engineering, KIIT University  

---

### 1. Atomic Bill of Materials (BOM) Deduction Algorithm
Calculates raw material volume required for work order batch size $Q_{\text{batch}}$:
$$\Delta Q_{\text{raw}, i} = Q_{\text{batch}} \times \text{BOM\_Ratio}_i \times (1 + \text{ScrapRate}_i)$$
* **Pre-Flight Invariant:** The system verifies $\forall i, Q_{\text{available}, i} \ge \Delta Q_{\text{raw}, i}$ within an atomic database transaction prior to persisting the work order.

### 2. Statutory 75.0% Attendance Rule Calculation
$$\text{Rate} = \frac{\sum \text{Days Present}}{\sum \text{Total Working Days}} \ge 0.7500$$
* **Implementation Invariant:** Evaluated using Java `BigDecimal` with scale 4 and `RoundingMode.HALF_UP`. Eliminates IEEE 754 floating-point binary rounding errors (e.g. 74.9999% vs 75.0000%).

### 3. Monthly Earn While Learn (EWYL) Stipend Accrual
$$S_{\text{monthly}} = (N_{\text{present}} \times R_{\text{daily}}) + (N_{\text{passed\_crafts}} \times R_{\text{piece}}) + B_{\text{bonus}}$$
* Aggregates verified production yields and attendance presence to generate banking payout ledgers.

### 4. Ordinary Least Squares (OLS) Demand Forecasting & Reorder Point
* **Slope & Intercept:**
  $$\beta_1 = \frac{\sum (t_i - \bar{t})(Y_i - \bar{Y})}{\sum (t_i - \bar{t})^2}, \quad \beta_0 = \bar{Y} - \beta_1 \bar{t}$$
* **30-Day Projection:** $\hat{Y}_t = \beta_0 + \beta_1 t$
* **Reorder Point (ROP):** $\text{ROP} = (\bar{d} \times L) + SS$, where $SS = Z_{\alpha} \times \sigma_d \times \sqrt{L}$

### 5. Multi-Tier GST Tax Half-Cent Balancing Algorithm
Calculates CGST (2.5%) and SGST (2.5%) using Banker's Rounding (`HALF_EVEN`) with balancing residual assigned to avoid penny discrepancies.