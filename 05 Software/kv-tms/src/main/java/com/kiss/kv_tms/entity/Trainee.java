package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "trainees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trainee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link 1-to-1 with User account
    @OneToOne(optional = false, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "contact_number", nullable = false, length = 15)
    private String contactNumber;

    // One trainee -> Assigned course (nullable if course deleted)
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "course_id", nullable = true)
    private Course assignedCourse;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "pass_out_date")
    private LocalDate passOutDate;

    @Column(name = "course_fee")
    private Double courseFee;

    @Column(name = "scholarship_type", length = 150)
    private String scholarshipType;

    @Column(name = "scholarship_percentage")
    private Integer scholarshipPercentage;

    @Column(name = "net_fee_payable")
    private Double netFeePayable;

    @Column(name = "fee_status", length = 50)
    private String feeStatus;
}