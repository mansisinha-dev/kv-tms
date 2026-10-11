package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "assessment_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "trainee_id", nullable = false)
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    // Overall course score out of 100
    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    // Grade: e.g. "Grade A (Distinction)", "Grade B"
    @Column(length = 50)
    private String grade;

    // Practical skill marks (hands-on craft)
    @Column(name = "practical_marks")
    private Double practicalMarks;

    @Column(length = 500)
    private String remarks;

    @Column(name = "evaluation_date", nullable = false)
    private LocalDate evaluationDate;
}