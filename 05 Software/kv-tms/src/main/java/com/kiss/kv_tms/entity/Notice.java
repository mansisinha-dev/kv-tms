package com.kiss.kv_tms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    // Target Audience: "ALL", "TRAINEES", "TRAINERS", "PRODUCTION"
    @Column(name = "target_audience", nullable = false, length = 50)
    private String targetAudience;

    // Priority: "NORMAL", "IMPORTANT", "URGENT"
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String priority = "NORMAL";

    // Category: "ACADEMIC", "WORKSHOP", "HOLIDAY", "GENERAL", "EXAM", "PRODUCTION_ADVISORY"
    @Column(length = 50)
    @Builder.Default
    private String category = "GENERAL";

    @Column(name = "posted_by", length = 100)
    @Builder.Default
    private String postedBy = "Central Administration";

    @Builder.Default
    private Boolean pinned = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    public boolean isPinned() {
        return pinned != null && pinned;
    }

    public boolean isActive() {
        return active != null && active;
    }
}
