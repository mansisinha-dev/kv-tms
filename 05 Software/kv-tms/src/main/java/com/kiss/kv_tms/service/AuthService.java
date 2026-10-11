package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.*;
import com.kiss.kv_tms.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TraineeRepository traineeRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    // 1. Trainee Registration (Strict SRS rules enforced)
    @Transactional
    public AuthResponse registerTrainee(TraineeRegisterRequest req) {
        if (userRepository.existsByCollegeId(req.getCollegeId())) {
            throw new RuntimeException("College ID / Roll Number already registered: " + req.getCollegeId());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered: " + req.getEmail());
        }

        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Vocational Course not found with ID: " + req.getCourseId()));

        LocalDate doj = req.getJoiningDate() != null ? req.getJoiningDate() : LocalDate.now();
        LocalDate calculatedPassOut = req.getPassOutDate();
        if (calculatedPassOut == null) {
            int duration = (course.getDurationMonths() != null && course.getDurationMonths() > 0) ? course.getDurationMonths() : 6;
            calculatedPassOut = doj.plusMonths(duration);
        }

        // Create base User account
        User user = User.builder()
                .collegeId(req.getCollegeId())
                .fullName(req.getFullName())
                .contactNumber(req.getContactNumber())
                .department(course.getName())
                .address(req.getAddress())
                .dob(req.getDob())
                .bloodGroup(req.getBloodGroup())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.ROLE_TRAINEE)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        Double fee = req.getCourseFee() != null ? req.getCourseFee() : (course.getFee() != null ? course.getFee() : 12000.0);
        String sType = req.getScholarshipType() != null && !req.getScholarshipType().isBlank() ? req.getScholarshipType() : "KISS 100% Tribal Welfare Free-Ship (Full Grant)";
        Integer sPct = req.getScholarshipPercentage() != null ? req.getScholarshipPercentage() : 100;
        Double netFee = req.getNetFeePayable() != null ? req.getNetFeePayable() : Math.max(0.0, fee - (fee * sPct / 100.0));
        String fStatus = req.getFeeStatus() != null && !req.getFeeStatus().isBlank() ? req.getFeeStatus() : (sPct == 100 ? "100% WAIVED (FULL GRANT)" : sPct > 0 ? sPct + "% SCHOLARSHIP SUBSIDIZED" : "FULL FEE PAYABLE");

        // Create Trainee Profile
        Trainee trainee = Trainee.builder()
                .user(savedUser)
                .fullName(req.getFullName())
                .contactNumber(req.getContactNumber())
                .assignedCourse(course)
                .admissionDate(doj)
                .joiningDate(doj)
                .address(req.getAddress())
                .dob(req.getDob())
                .bloodGroup(req.getBloodGroup())
                .passOutDate(calculatedPassOut)
                .courseFee(fee)
                .scholarshipType(sType)
                .scholarshipPercentage(sPct)
                .netFeePayable(netFee)
                .feeStatus(fStatus)
                .build();
        traineeRepository.save(trainee);

        String token = jwtUtils.generateToken(savedUser.getCollegeId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .collegeId(savedUser.getCollegeId())
                .fullName(trainee.getFullName())
                .role(savedUser.getRole().name())
                .address(trainee.getAddress())
                .dob(trainee.getDob() != null ? trainee.getDob().toString() : null)
                .joiningDate(doj.toString())
                .bloodGroup(trainee.getBloodGroup())
                .passOutDate(calculatedPassOut != null ? calculatedPassOut.toString() : null)
                .courseFee(fee)
                .scholarshipType(sType)
                .scholarshipPercentage(sPct)
                .netFeePayable(netFee)
                .feeStatus(fStatus)
                .message("Trainee registered successfully into " + course.getName())
                .build();
    }

    // 2. Trainer Registration
    @Transactional
    public AuthResponse registerTrainer(TrainerRegisterRequest req) {
        if (userRepository.existsByCollegeId(req.getCollegeId())) {
            throw new RuntimeException("College / Staff ID already registered: " + req.getCollegeId());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered: " + req.getEmail());
        }

        LocalDate doj = req.getJoiningDate() != null ? req.getJoiningDate() : LocalDate.now();

        User user = User.builder()
                .collegeId(req.getCollegeId())
                .fullName(req.getFullName())
                .contactNumber(req.getContactNumber())
                .department(req.getSpecialization())
                .address(req.getAddress())
                .dob(req.getDob())
                .bloodGroup(req.getBloodGroup())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.ROLE_TRAINER)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        Trainer trainer = Trainer.builder()
                .user(savedUser)
                .fullName(req.getFullName())
                .contactNumber(req.getContactNumber())
                .specialization(req.getSpecialization())
                .address(req.getAddress())
                .dob(req.getDob())
                .joiningDate(doj)
                .bloodGroup(req.getBloodGroup())
                .build();
        trainerRepository.save(trainer);

        String token = jwtUtils.generateToken(savedUser.getCollegeId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .collegeId(savedUser.getCollegeId())
                .fullName(trainer.getFullName())
                .role(savedUser.getRole().name())
                .address(trainer.getAddress())
                .dob(trainer.getDob() != null ? trainer.getDob().toString() : null)
                .joiningDate(doj.toString())
                .bloodGroup(trainer.getBloodGroup())
                .message("Trainer registered successfully")
                .build();
    }

    // 2b. Admin Registration (Admin can add more admins)
    @Transactional
    public AuthResponse registerAdmin(AdminRegisterRequest req) {
        if (userRepository.existsByCollegeId(req.getCollegeId())) {
            throw new RuntimeException("Staff / Admin ID already registered: " + req.getCollegeId());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .collegeId(req.getCollegeId())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .contactNumber(req.getContactNumber())
                .department(req.getDepartment() != null && !req.getDepartment().trim().isEmpty() ? req.getDepartment().trim() : "Central Administration")
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getCollegeId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .collegeId(savedUser.getCollegeId())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .email(savedUser.getEmail())
                .contactNumber(savedUser.getContactNumber())
                .trade(savedUser.getDepartment())
                .category("University Executive")
                .message("Administrator account registered successfully")
                .build();
    }

    // 2c. Production Staff Registration (Admin can onboard production team members & operators)
    @Transactional
    public AuthResponse registerProductionStaff(ProductionStaffRegisterRequest req) {
        if (userRepository.existsByCollegeId(req.getCollegeId())) {
            throw new RuntimeException("Staff ID already registered: " + req.getCollegeId());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .collegeId(req.getCollegeId())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .contactNumber(req.getContactNumber())
                .department(req.getDepartment() != null && !req.getDepartment().trim().isEmpty() ? req.getDepartment().trim() : "Production & Manufacturing")
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.ROLE_PRODUCTION_MANAGER)
                .active(true)
                .build();
        User savedUser = userRepository.save(user);

        String token = jwtUtils.generateToken(savedUser.getCollegeId(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .collegeId(savedUser.getCollegeId())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .email(savedUser.getEmail())
                .contactNumber(savedUser.getContactNumber())
                .trade(savedUser.getDepartment())
                .category("Production Unit")
                .message("Production Team Member registered successfully")
                .build();
    }

    // 3. Login (Supports either College ID or Email)
    public AuthResponse login(LoginRequest req) {
        // Authenticate via Spring Security
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        User user = userRepository.findByCollegeId(req.getUsername())
                .or(() -> userRepository.findByEmail(req.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(user.getCollegeId(), user.getRole().name());

        // Resolve display details based on role
        String fullName = user.getCollegeId();
        String contactNumber = null;
        String trade = null;
        String courseName = null;
        String courseCode = null;
        String category = null;
        String admissionDate = null;

        Double courseFee = null;
        String scholarshipType = null;
        Integer scholarshipPercentage = null;
        Double netFeePayable = null;
        String feeStatus = null;

        if (user.getRole() == Role.ROLE_TRAINEE) {
            java.util.Optional<Trainee> traineeOpt = traineeRepository.findByUserId(user.getId());
            if (traineeOpt.isPresent()) {
                Trainee t = traineeOpt.get();
                fullName = t.getFullName();
                contactNumber = t.getContactNumber();
                courseFee = t.getCourseFee();
                scholarshipType = t.getScholarshipType();
                scholarshipPercentage = t.getScholarshipPercentage();
                netFeePayable = t.getNetFeePayable();
                feeStatus = t.getFeeStatus();
                if (t.getAdmissionDate() != null) {
                    admissionDate = t.getAdmissionDate().toString();
                }
                if (t.getAssignedCourse() != null) {
                    courseName = t.getAssignedCourse().getName();
                    courseCode = t.getAssignedCourse().getCode();
                    trade = t.getAssignedCourse().getCode() + " (" + t.getAssignedCourse().getName() + ")";
                }
            }
            category = "Scheduled Tribe (KISS Scholar)";
        } else if (user.getRole() == Role.ROLE_TRAINER) {
            java.util.Optional<Trainer> trainerOpt = trainerRepository.findByUserId(user.getId());
            if (trainerOpt.isPresent()) {
                Trainer tr = trainerOpt.get();
                fullName = tr.getFullName();
                contactNumber = tr.getContactNumber();
                trade = tr.getSpecialization();
            }
            category = "Faculty Staff";
        } else if (user.getRole() == Role.ROLE_PRODUCTION_MANAGER) {
            fullName = user.getFullName() != null && !user.getFullName().trim().isEmpty()
                    ? user.getFullName().trim()
                    : "KISS Production Manager";
            contactNumber = user.getContactNumber() != null ? user.getContactNumber() : "0674-2725386";
            trade = user.getDepartment() != null && !user.getDepartment().trim().isEmpty()
                    ? user.getDepartment().trim()
                    : "Production & Manufacturing";
            category = "Production Unit";
        } else {
            // ROLE_ADMIN
            if (user.getFullName() != null && !user.getFullName().trim().isEmpty()) {
                fullName = user.getFullName().trim();
            } else if ("KISS-ADM-001".equalsIgnoreCase(user.getCollegeId())) {
                fullName = "Dr. P. K. Routray";
            } else {
                fullName = user.getCollegeId();
            }
            contactNumber = user.getContactNumber() != null ? user.getContactNumber() : "0674-2725386";
            trade = user.getDepartment() != null && !user.getDepartment().trim().isEmpty()
                    ? user.getDepartment().trim()
                    : "Central Administration";
            category = "University Executive";
        }

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .collegeId(user.getCollegeId())
                .fullName(fullName)
                .role(user.getRole().name())
                .email(user.getEmail())
                .contactNumber(contactNumber)
                .trade(trade)
                .courseName(courseName)
                .courseCode(courseCode)
                .category(category)
                .admissionDate(admissionDate)
                .courseFee(courseFee)
                .scholarshipType(scholarshipType)
                .scholarshipPercentage(scholarshipPercentage)
                .netFeePayable(netFeePayable)
                .feeStatus(feeStatus)
                .message("Login successful")
                .build();
    }

    // 4. Delete User (Trainee, Trainer, or Secondary Admin by College ID)
    @Transactional
    public String deleteUserByCollegeId(String collegeId) {
        User user = userRepository.findByCollegeId(collegeId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + collegeId));

        if ("KISS-ADM-001".equalsIgnoreCase(collegeId)) {
            throw new RuntimeException("Cannot delete primary Root Administrator account (KISS-ADM-001)!");
        }

        // Delete Trainee record if present
        traineeRepository.findByUserId(user.getId()).ifPresent(trainee -> {
            traineeRepository.delete(trainee);
        });

        // Delete Trainer record if present
        trainerRepository.findByUserId(user.getId()).ifPresent(trainer -> {
            trainerRepository.delete(trainer);
        });

        // If user is still present (in case cascade did not remove it)
        if (userRepository.existsById(user.getId())) {
            userRepository.delete(user);
        }

        return "User " + collegeId + " deleted successfully from database.";
    }

    // 5. Get All Users (Admin User Registry synced directly with MySQL)
    public java.util.List<java.util.Map<String, Object>> getAllUsers() {
        java.util.List<User> allUsers = userRepository.findAll();
        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();

        for (User u : allUsers) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getCollegeId());
            map.put("email", u.getEmail());
            map.put("role", u.getRole().name());
            map.put("status", u.isActive() ? "ACTIVE" : "SUSPENDED");

            if (u.getRole() == Role.ROLE_TRAINEE) {
                traineeRepository.findByUserId(u.getId()).ifPresent(t -> {
                    map.put("name", t.getFullName());
                    map.put("contactNumber", t.getContactNumber());
                    map.put("address", t.getAddress());
                    map.put("dob", t.getDob());
                    map.put("joiningDate", t.getJoiningDate() != null ? t.getJoiningDate() : t.getAdmissionDate());
                    map.put("admissionDate", t.getAdmissionDate());
                    map.put("bloodGroup", t.getBloodGroup());
                    map.put("passOutDate", t.getPassOutDate());
                    map.put("courseFee", t.getCourseFee());
                    map.put("scholarshipType", t.getScholarshipType());
                    map.put("scholarshipPercentage", t.getScholarshipPercentage());
                    map.put("netFeePayable", t.getNetFeePayable());
                    map.put("feeStatus", t.getFeeStatus());
                    if (t.getAssignedCourse() != null) {
                        map.put("trade", t.getAssignedCourse().getCode() + " (" + t.getAssignedCourse().getName() + ")");
                        map.put("courseId", t.getAssignedCourse().getId());
                        map.put("courseName", t.getAssignedCourse().getName());
                        map.put("courseDuration", t.getAssignedCourse().getDurationMonths());
                    }
                });
                if (!map.containsKey("name")) map.put("name", u.getFullName() != null ? u.getFullName() : u.getCollegeId());
                if (!map.containsKey("trade")) map.put("trade", u.getDepartment() != null ? u.getDepartment() : "Vocational Training");
                if (!map.containsKey("address")) map.put("address", u.getAddress());
                if (!map.containsKey("dob")) map.put("dob", u.getDob());
                if (!map.containsKey("bloodGroup")) map.put("bloodGroup", u.getBloodGroup());
                map.put("category", "Scheduled Tribe (KISS Scholar)");
            } else if (u.getRole() == Role.ROLE_TRAINER) {
                trainerRepository.findByUserId(u.getId()).ifPresent(tr -> {
                    map.put("name", tr.getFullName());
                    map.put("contactNumber", tr.getContactNumber());
                    map.put("trade", tr.getSpecialization());
                    map.put("address", tr.getAddress());
                    map.put("dob", tr.getDob());
                    map.put("joiningDate", tr.getJoiningDate());
                    map.put("bloodGroup", tr.getBloodGroup());
                });
                if (!map.containsKey("name")) map.put("name", u.getFullName() != null ? u.getFullName() : u.getCollegeId());
                if (!map.containsKey("trade")) map.put("trade", u.getDepartment() != null ? u.getDepartment() : "Faculty Specialization");
                if (!map.containsKey("address")) map.put("address", u.getAddress());
                if (!map.containsKey("dob")) map.put("dob", u.getDob());
                if (!map.containsKey("bloodGroup")) map.put("bloodGroup", u.getBloodGroup());
                map.put("category", "Faculty Staff");
            } else if (u.getRole() == Role.ROLE_PRODUCTION_MANAGER) {
                String prodName = u.getFullName() != null && !u.getFullName().trim().isEmpty()
                        ? u.getFullName()
                        : ("KISS-PRD-001".equalsIgnoreCase(u.getCollegeId()) ? "KISS Production Manager" : u.getCollegeId());
                map.put("name", prodName);
                map.put("contactNumber", u.getContactNumber() != null ? u.getContactNumber() : "0674-2725386");
                map.put("trade", u.getDepartment() != null && !u.getDepartment().trim().isEmpty() ? u.getDepartment() : "Production & Manufacturing");
                map.put("address", u.getAddress() != null ? u.getAddress() : "KISS Deemed to be University, Campus-10, Bhubaneswar");
                map.put("category", "Production Unit");
            } else {
                String adminName = u.getFullName() != null && !u.getFullName().trim().isEmpty() 
                        ? u.getFullName() 
                        : ("KISS-ADM-001".equalsIgnoreCase(u.getCollegeId()) ? "Dr. P. K. Routray" : u.getCollegeId());
                map.put("name", adminName);
                map.put("contactNumber", u.getContactNumber() != null ? u.getContactNumber() : "0674-2725386");
                map.put("trade", u.getDepartment() != null && !u.getDepartment().trim().isEmpty() ? u.getDepartment() : "Central Administration");
                map.put("address", u.getAddress() != null ? u.getAddress() : "KISS Deemed to be University, Campus-10, Bhubaneswar");
                map.put("category", "University Executive");
            }
            result.add(map);
        }
        return result;
    }

    // 6. Get Complete User Profile (including all registration details)
    public java.util.Map<String, Object> getUserProfile(String collegeId) {
        User user = userRepository.findByCollegeId(collegeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + collegeId));

        java.util.Map<String, Object> profile = new java.util.HashMap<>();
        profile.put("userId", user.getId());
        profile.put("collegeId", user.getCollegeId());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("status", user.isActive() ? "ACTIVE" : "SUSPENDED");
        profile.put("createdAt", user.getCreatedAt());
        profile.put("address", user.getAddress());
        profile.put("dob", user.getDob());
        profile.put("bloodGroup", user.getBloodGroup());

        if (user.getRole() == Role.ROLE_TRAINEE) {
            traineeRepository.findByUserId(user.getId()).ifPresent(t -> {
                profile.put("traineeId", t.getId());
                profile.put("fullName", t.getFullName());
                profile.put("contactNumber", t.getContactNumber());
                profile.put("admissionDate", t.getAdmissionDate());
                profile.put("joiningDate", t.getJoiningDate() != null ? t.getJoiningDate() : t.getAdmissionDate());
                profile.put("address", t.getAddress() != null ? t.getAddress() : user.getAddress());
                profile.put("dob", t.getDob() != null ? t.getDob() : user.getDob());
                profile.put("bloodGroup", t.getBloodGroup() != null ? t.getBloodGroup() : user.getBloodGroup());
                profile.put("passOutDate", t.getPassOutDate());
                profile.put("courseFee", t.getCourseFee());
                profile.put("scholarshipType", t.getScholarshipType());
                profile.put("scholarshipPercentage", t.getScholarshipPercentage());
                profile.put("netFeePayable", t.getNetFeePayable());
                profile.put("feeStatus", t.getFeeStatus());
                if (t.getAssignedCourse() != null) {
                    profile.put("courseId", t.getAssignedCourse().getId());
                    profile.put("courseCode", t.getAssignedCourse().getCode());
                    profile.put("courseName", t.getAssignedCourse().getName());
                    profile.put("trade", t.getAssignedCourse().getCode() + " (" + t.getAssignedCourse().getName() + ")");
                    profile.put("durationMonths", t.getAssignedCourse().getDurationMonths());
                }
            });
            profile.put("category", "Scheduled Tribe (KISS Scholar)");
        } else if (user.getRole() == Role.ROLE_TRAINER) {
            trainerRepository.findByUserId(user.getId()).ifPresent(tr -> {
                profile.put("trainerId", tr.getId());
                profile.put("fullName", tr.getFullName());
                profile.put("contactNumber", tr.getContactNumber());
                profile.put("specialization", tr.getSpecialization());
                profile.put("trade", tr.getSpecialization());
                profile.put("address", tr.getAddress() != null ? tr.getAddress() : user.getAddress());
                profile.put("dob", tr.getDob() != null ? tr.getDob() : user.getDob());
                profile.put("joiningDate", tr.getJoiningDate());
                profile.put("bloodGroup", tr.getBloodGroup() != null ? tr.getBloodGroup() : user.getBloodGroup());
            });
            profile.put("category", "Faculty Staff");
        } else if (user.getRole() == Role.ROLE_PRODUCTION_MANAGER) {
            String prodName = user.getFullName() != null && !user.getFullName().trim().isEmpty()
                    ? user.getFullName()
                    : ("KISS-PRD-001".equalsIgnoreCase(user.getCollegeId()) ? "KISS Production Manager" : user.getCollegeId());
            profile.put("fullName", prodName);
            profile.put("contactNumber", user.getContactNumber() != null ? user.getContactNumber() : "0674-2725386");
            profile.put("trade", user.getDepartment() != null ? user.getDepartment() : "Production & Manufacturing");
            profile.put("category", "Production Unit");
        } else {
            String adminName = user.getFullName() != null && !user.getFullName().trim().isEmpty()
                    ? user.getFullName()
                    : ("KISS-ADM-001".equalsIgnoreCase(user.getCollegeId()) ? "Dr. P. K. Routray" : user.getCollegeId());
            profile.put("fullName", adminName);
            profile.put("contactNumber", user.getContactNumber() != null ? user.getContactNumber() : "0674-2725386");
            profile.put("trade", user.getDepartment() != null ? user.getDepartment() : "Central University Administration");
            profile.put("category", "University Executive");
        }
        return profile;
    }
}