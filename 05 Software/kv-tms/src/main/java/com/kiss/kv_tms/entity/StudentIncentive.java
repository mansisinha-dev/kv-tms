package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_incentives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentIncentive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "trainee_id", nullable = false)
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "production_run_id", nullable = false)
    private ProductionRun productionRun;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "units_crafted", nullable = false)
    private Integer unitsCrafted;

    @Column(name = "rate_per_unit", nullable = false)
    private Double ratePerUnit;

    @Column(name = "amount_earned", nullable = false)
    private Double amountEarned;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private IncentiveStatus status = IncentiveStatus.PENDING;

    @Column(name = "disbursed_date")
    private LocalDate disbursedDate;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}