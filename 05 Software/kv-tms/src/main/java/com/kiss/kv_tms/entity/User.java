package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // College ID / Roll Number (Mandatory and Unique as per SRS)
    @Column(name = "college_id", nullable = false, unique = true, length = 50)
    private String collegeId;

    // College Email (Mandatory and Unique as per SRS)
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // BCrypt Encrypted Password
    @Column(nullable = false)
    private String password;

    // Role: ROLE_ADMIN, ROLE_TRAINER, ROLE_TRAINEE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

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