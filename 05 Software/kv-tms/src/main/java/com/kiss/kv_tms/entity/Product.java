package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associated vocational trade (e.g. Sewing, Carpentry, Handicrafts)
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    @Column(nullable = false, length = 150)
    private String name; // e.g. "Handcrafted Cotton Kurti", "Bamboo Desk Lamp"

    @Column(nullable = false, unique = true, length = 50)
    private String sku; // e.g. "PRD-SEW-001"

    @Column(length = 500)
    private String description;

    @Column(name = "selling_price", nullable = false)
    private Double sellingPrice;

    // "Earn While Learn" student incentive paid per crafted unit (in INR)
    @Column(name = "incentive_rate_per_unit", nullable = false)
    private Double incentiveRatePerUnit;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}