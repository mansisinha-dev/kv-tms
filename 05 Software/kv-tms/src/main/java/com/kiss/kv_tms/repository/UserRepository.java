package com.kiss.kv_tms.repository;

import com.kiss.kv_tms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // For login: Find by College ID or Email
    Optional<User> findByCollegeId(String collegeId);
    Optional<User> findByEmail(String email);

    // For validation: Prevent duplicate accounts
    boolean existsByCollegeId(String collegeId);
    boolean existsByEmail(String email);
}