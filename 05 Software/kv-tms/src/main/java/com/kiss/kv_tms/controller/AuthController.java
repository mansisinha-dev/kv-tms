package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.Course;
import com.kiss.kv_tms.repository.CourseRepository;
import com.kiss.kv_tms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private CourseRepository courseRepository;

    // Public API: Get available vocational courses for registration dropdown
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getActiveCourses() {
        return ResponseEntity.ok(courseRepository.findByActiveTrue());
    }

    // Trainee Registration
    @PostMapping("/register-trainee")
    public ResponseEntity<AuthResponse> registerTrainee(@Valid @RequestBody TraineeRegisterRequest request) {
        return ResponseEntity.ok(authService.registerTrainee(request));
    }

    // Trainer Registration
    @PostMapping("/register-trainer")
    public ResponseEntity<AuthResponse> registerTrainer(@Valid @RequestBody TrainerRegisterRequest request) {
        return ResponseEntity.ok(authService.registerTrainer(request));
    }

    // Admin Registration (Admin can add more admins)
    @PostMapping("/register-admin")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }

    // Production Staff Registration (Admin can onboard production team members & operators)
    @PostMapping("/register-production-staff")
    public ResponseEntity<AuthResponse> registerProductionStaff(@Valid @RequestBody ProductionStaffRegisterRequest request) {
        return ResponseEntity.ok(authService.registerProductionStaff(request));
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // Delete User (Trainee or Trainer by College ID)
    @DeleteMapping("/users/{collegeId}")
    public ResponseEntity<String> deleteUser(@PathVariable String collegeId) {
        return ResponseEntity.ok(authService.deleteUserByCollegeId(collegeId));
    }

    // Get all registered users from MySQL database
    @GetMapping("/users")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // Get specific user profile with all registration details (Trainee/Trainer)
    @GetMapping("/profile/{collegeId}")
    public ResponseEntity<java.util.Map<String, Object>> getProfile(@PathVariable String collegeId) {
        return ResponseEntity.ok(authService.getUserProfile(collegeId));
    }
}