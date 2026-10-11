package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "trainers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link 1-to-1 with User account
    @OneToOne(optional = false, cascade = {CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "contact_number", nullable = false, length = 15)
    private String contactNumber;

    @Column(length = 100)
    private String specialization; // e.g. "Master Artisan", "Textile Specialist"

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;
}