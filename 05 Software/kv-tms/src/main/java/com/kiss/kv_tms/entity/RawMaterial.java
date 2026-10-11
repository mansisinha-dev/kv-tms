package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "raw_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // e.g. "Cotton Fabric", "Sewing Thread Spool", "Buttons"

    @Column(name = "unit_of_measure", nullable = false, length = 20)
    private String unitOfMeasure; // e.g. "Meters", "Units", "Spools", "Kg"

    @Column(name = "current_stock", nullable = false)
    private Double currentStock;

    @Column(name = "reorder_level", nullable = false)
    private Double reorderLevel; // Low stock alert threshold

    @Column(name = "unit_cost")
    private Double unitCost;
}