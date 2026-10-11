package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workshops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workshop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name; // e.g. "Workshop Lab #1 (Sewing & Textiles)"

    @Column(name = "short_name", length = 100)
    private String shortName; // e.g. "Sewing & Tailoring Lab #1"

    @Column(length = 60)
    private String category; // e.g. "Textiles & Garments"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "product_name", length = 100)
    private String productName; // e.g. "Handcrafted Cotton Kurti"

    @Column(length = 40)
    private String sku; // e.g. "PRD-KURTI-01"

    @Column(name = "batch_prefix", length = 40)
    private String batchPrefix; // e.g. "BATCH-2026-SEW"

    @Column(name = "selling_price")
    private Double sellingPrice;

    @Column(name = "incentive_rate")
    private Double incentiveRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ProductionStatus status = ProductionStatus.APPROVED_FOR_SALE;

    @Column(name = "proposed_by", length = 100)
    private String proposedBy;

    @Column(name = "approval_remarks", length = 500)
    private String approvalRemarks;

    @Column(name = "bom_summary", length = 500)
    private String bomSummary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
