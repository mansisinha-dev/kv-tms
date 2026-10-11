package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "trainer_attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 30)
    private String status; // PRESENT, ON_DUTY_LEAVE, ABSENT

    @Column(name = "hours_conducted")
    @Builder.Default
    private Integer hoursConducted = 4;

    @Column(length = 150)
    private String specialization;

    @Column(name = "session_type", length = 150)
    private String sessionType;

    @Column(length = 500)
    private String remarks;
}
