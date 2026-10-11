package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "syllabus_modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyllabusModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "module_title", nullable = false, length = 150)
    private String moduleTitle;

    @Column(length = 500)
    private String description;

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "order_no")
    private Integer orderNo;
}