package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // e.g. "Sewing & Tailoring", "Handicrafts & Tribal Art", "Food Processing", "Carpentry"
    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // e.g. "SEW-101", "ART-102"

    @Column(length = 500)
    private String description;

    @Column(name = "duration_months")
    private Integer durationMonths;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "fee")
    @Builder.Default
    private Double fee = 12000.0;
}