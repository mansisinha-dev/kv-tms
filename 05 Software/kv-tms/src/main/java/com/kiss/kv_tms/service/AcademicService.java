package com.kiss.kv_tms.service;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.*;
import com.kiss.kv_tms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AcademicService {

    @Autowired private CourseRepository courseRepository;
    @Autowired private SyllabusModuleRepository syllabusRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private AssessmentScoreRepository scoreRepo;
    @Autowired private TraineeRepository traineeRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private TrainerRepository trainerRepo;
    @Autowired private TrainerAttendanceRepository trainerAttendanceRepo;
    @Autowired private LeaveRequestRepository leaveRepo;

    // 1. Add Module to Course Syllabus
    @Transactional
    public SyllabusModule addSyllabusModule(Long courseId, SyllabusModuleDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        SyllabusModule module = SyllabusModule.builder()
                .course(course)
                .moduleTitle(dto.getModuleTitle())
                .description(dto.getDescription())
                .durationHours(dto.getDurationHours())
                .orderNo(dto.getOrderNo())
                .build();

        return syllabusRepo.save(module);
    }

    // 2. Get Ordered Syllabus for a Course
    public List<SyllabusModule> getCourseSyllabus(Long courseId) {
        return syllabusRepo.findByCourseIdOrderByOrderNoAsc(courseId);
    }

    // 3. Mark Batch Attendance for Trainees (Upsert to prevent duplicates)
    @Transactional
    public String markBatchAttendance(BatchAttendanceRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + req.getCourseId()));

        List<Attendance> records = new ArrayList<>();
        for (BatchAttendanceRequest.AttendanceItem item : req.getAttendanceList()) {
            Optional<Attendance> existing = attendanceRepo.findByTraineeIdAndDate(item.getTraineeId(), req.getDate());
            if (existing.isPresent()) {
                Attendance att = existing.get();
                att.setStatus(item.getStatus());
                att.setRemarks(item.getRemarks());
                records.add(att);
            } else {
                Trainee trainee = traineeRepo.findById(item.getTraineeId())
                        .orElseThrow(() -> new RuntimeException("Trainee not found: " + item.getTraineeId()));

                Attendance att = Attendance.builder()
                        .course(course)
                        .trainee(trainee)
                        .date(req.getDate())
                        .status(item.getStatus())
                        .remarks(item.getRemarks())
                        .build();
                records.add(att);
            }
        }

        attendanceRepo.saveAll(records);

        // Record faculty workshop delivery for trainers assigned to this trade
        try {
            List<Trainer> allTrainers = trainerRepo.findAll();
            for (Trainer tr : allTrainers) {
                String spec = tr.getSpecialization() != null ? tr.getSpecialization().toUpperCase() : "";
                if (spec.contains(course.getCode().toUpperCase()) || spec.contains(course.getName().toUpperCase())) {
                    if (tr.getJoiningDate() == null || !req.getDate().isBefore(tr.getJoiningDate())) {
                        Optional<TrainerAttendance> existingTr = trainerAttendanceRepo.findByTrainerIdAndDate(tr.getId(), req.getDate());
                        if (existingTr.isEmpty()) {
                            TrainerAttendance trAtt = TrainerAttendance.builder()
                                    .trainer(tr)
                                    .date(req.getDate())
                                    .status("PRESENT")
                                    .hoursConducted(4)
                                    .specialization(tr.getSpecialization())
                                    .sessionType("Practical Workshop & Artisan Mentorship")
                                    .remarks("Conducted practical batch session for " + course.getName())
                                    .build();
                            trainerAttendanceRepo.save(trAtt);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        return "Attendance recorded for " + records.size() + " trainees on " + req.getDate();
    }

    // 4. Record Trainee Assessment Score (Upsert)
    @Transactional
    public AssessmentScore recordScore(ScoreRecordRequest req) {
        Trainee trainee = traineeRepo.findById(req.getTraineeId())
                .orElseThrow(() -> new RuntimeException("Trainee not found: " + req.getTraineeId()));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + req.getCourseId()));

        Optional<AssessmentScore> existing = scoreRepo.findByTraineeId(req.getTraineeId());
        AssessmentScore score;
        if (existing.isPresent()) {
            score = existing.get();
            score.setOverallScore(req.getOverallScore());
            score.setGrade(req.getGrade());
            score.setPracticalMarks(req.getPracticalMarks());
            score.setRemarks(req.getRemarks());
            score.setEvaluationDate(java.time.LocalDate.now());
        } else {
            score = AssessmentScore.builder()
                    .trainee(trainee)
                    .course(course)
                    .overallScore(req.getOverallScore())
                    .grade(req.getGrade())
                    .practicalMarks(req.getPracticalMarks())
                    .remarks(req.getRemarks())
                    .evaluationDate(java.time.LocalDate.now())
                    .build();
        }

        return scoreRepo.save(score);
    }

    // 5. Get Trainee Progress Summary (Attendance %, Score, Course Details)
    public Map<String, Object> getTraineeAcademicSummary(Long traineeId) {
        Trainee trainee = traineeRepo.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found: " + traineeId));

        long totalDays = attendanceRepo.countByTraineeId(traineeId);
        long presentDays = attendanceRepo.countByTraineeIdAndStatus(traineeId, AttendanceStatus.PRESENT);
        double attendancePercent = (totalDays > 0) ? ((double) presentDays / totalDays) * 100.0 : 0.0;

        Optional<AssessmentScore> scoreOpt = scoreRepo.findByTraineeId(traineeId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("traineeId", trainee.getId());
        summary.put("fullName", trainee.getFullName());
        summary.put("assignedCourse", trainee.getAssignedCourse().getName());
        summary.put("courseId", trainee.getAssignedCourse().getId());
        summary.put("totalAttendanceMarked", totalDays);
        summary.put("presentDays", presentDays);
        summary.put("attendancePercentage", Math.round(attendancePercent * 10.0) / 10.0);
        summary.put("score", scoreOpt.orElse(null));

        return summary;
    }

    // 6. Get Trainee Progress Summary by College ID / Roll Number
    public Map<String, Object> getTraineeAcademicSummaryByCollegeId(String collegeId) {
        Optional<Trainee> traineeOpt = traineeRepo.findByUserCollegeId(collegeId);
        if (traineeOpt.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("collegeId", collegeId);
            empty.put("totalAttendanceMarked", 0L);
            empty.put("presentDays", 0L);
            empty.put("attendancePercentage", 0.0);
            empty.put("score", null);
            return empty;
        }
        return getTraineeAcademicSummary(traineeOpt.get().getId());
    }

    // 7. Get Attendance Records for a Date
    public List<Map<String, Object>> getAttendanceRecordsForDate(java.time.LocalDate date) {
        List<Attendance> list = attendanceRepo.findByDate(date);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("traineeId", a.getTrainee().getId());
            map.put("collegeId", a.getTrainee().getUser().getCollegeId());
            map.put("studentName", a.getTrainee().getFullName());
            map.put("date", a.getDate().toString());
            map.put("status", a.getStatus().name());
            map.put("remarks", a.getRemarks());
            result.add(map);
        }
        return result;
    }

    // 10. Get Complete Attendance History (All Dates)
    public List<Map<String, Object>> getAllAttendanceHistory() {
        List<Attendance> list = attendanceRepo.findAllByOrderByDateDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("traineeId", a.getTrainee().getId());
            map.put("collegeId", a.getTrainee().getUser().getCollegeId());
            map.put("studentName", a.getTrainee().getFullName());
            map.put("courseName", a.getCourse().getName());
            map.put("courseCode", a.getCourse().getCode());
            map.put("date", a.getDate().toString());
            map.put("status", a.getStatus().name());
            map.put("remarks", a.getRemarks());
            result.add(map);
        }
        return result;
    }

    // 8. Get All Registered Trainees directly from MySQL
    public List<Map<String, Object>> getAllTrainees() {
        List<Trainee> list = traineeRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Trainee t : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("traineeId", t.getId());
            map.put("id", t.getId());
            map.put("collegeId", t.getUser().getCollegeId());
            map.put("username", t.getUser().getCollegeId());
            map.put("name", t.getFullName());
            map.put("fullName", t.getFullName());
            map.put("contactNumber", t.getContactNumber());
            map.put("role", "ROLE_TRAINEE");
            if (t.getAssignedCourse() != null) {
                map.put("courseId", t.getAssignedCourse().getId());
                map.put("courseName", t.getAssignedCourse().getName());
                map.put("courseCode", t.getAssignedCourse().getCode());
                map.put("trade", t.getAssignedCourse().getCode() + " (" + t.getAssignedCourse().getName() + ")");
            }
            result.add(map);
        }
        return result;
    }

    // 9. Get Score by College ID
    public Map<String, Object> getScoreByCollegeId(String collegeId) {
        Optional<Trainee> tOpt = traineeRepo.findByUserCollegeId(collegeId);
        if (tOpt.isEmpty()) return null;
        Optional<AssessmentScore> sOpt = scoreRepo.findByTraineeId(tOpt.get().getId());
        if (sOpt.isEmpty()) return null;
        AssessmentScore s = sOpt.get();
        Map<String, Object> map = new HashMap<>();
        map.put("score", s.getOverallScore());
        map.put("grade", s.getGrade());
        map.put("remarks", s.getRemarks());
        map.put("practicalMarks", s.getPracticalMarks());
        map.put("evaluationDate", s.getEvaluationDate().toString());
        return map;
    }

    // 11. Get Trainee Attendance Records by College ID
    public List<Map<String, Object>> getTraineeAttendanceListByCollegeId(String collegeId) {
        Optional<Trainee> tOpt = traineeRepo.findByUserCollegeId(collegeId);
        if (tOpt.isEmpty()) return Collections.emptyList();
        List<Attendance> list = attendanceRepo.findByTraineeIdOrderByDateDesc(tOpt.get().getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("traineeId", a.getTrainee().getId());
            map.put("collegeId", collegeId);
            map.put("studentName", a.getTrainee().getFullName());
            map.put("courseId", a.getCourse() != null ? a.getCourse().getId() : null);
            map.put("courseName", a.getCourse() != null ? a.getCourse().getName() : "Vocational Course");
            map.put("courseCode", a.getCourse() != null ? a.getCourse().getCode() : "VOC-101");
            map.put("date", a.getDate().toString());
            map.put("status", a.getStatus().name());
            map.put("remarks", a.getRemarks());
            result.add(map);
        }
        return result;
    }

    // 12. Create New Course with Syllabus Modules (Admin)
    @Transactional
    public Course createCourseWithSyllabus(CreateCourseRequest req) {
        if (courseRepository.findByCode(req.getCode().trim()).isPresent()) {
            throw new RuntimeException("Course with code '" + req.getCode() + "' already exists");
        }

        Course course = Course.builder()
                .name(req.getName().trim())
                .code(req.getCode().trim().toUpperCase())
                .description(req.getDescription())
                .durationMonths(req.getDurationMonths() != null ? req.getDurationMonths() : 6)
                .fee(req.getFee() != null ? req.getFee() : 12000.0)
                .active(true)
                .build();

        Course savedCourse = courseRepository.save(course);

        if (req.getSyllabusModules() != null && !req.getSyllabusModules().isEmpty()) {
            int order = 1;
            for (SyllabusModuleDTO modDto : req.getSyllabusModules()) {
                if (modDto.getModuleTitle() != null && !modDto.getModuleTitle().isBlank()) {
                    SyllabusModule module = SyllabusModule.builder()
                            .course(savedCourse)
                            .moduleTitle(modDto.getModuleTitle().trim())
                            .description(modDto.getDescription())
                            .durationHours(modDto.getDurationHours() != null ? modDto.getDurationHours() : 40)
                            .orderNo(modDto.getOrderNo() != null ? modDto.getOrderNo() : order++)
                            .build();
                    syllabusRepo.save(module);
                }
            }
        }

        return savedCourse;
    }

    // 13. Get All Courses with Complete Syllabus & Enrollment Statistics
    public List<Map<String, Object>> getAllCoursesWithDetails() {
        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Course c : courses) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("code", c.getCode());
            map.put("description", c.getDescription());
            map.put("durationMonths", c.getDurationMonths());
            map.put("fee", c.getFee() != null ? c.getFee() : 12000.0);
            map.put("active", c.isActive());

            List<SyllabusModule> modules = syllabusRepo.findByCourseIdOrderByOrderNoAsc(c.getId());
            List<Map<String, Object>> moduleList = new ArrayList<>();
            int totalHours = 0;
            for (SyllabusModule m : modules) {
                Map<String, Object> modMap = new HashMap<>();
                modMap.put("id", m.getId());
                modMap.put("orderNo", m.getOrderNo());
                modMap.put("moduleTitle", m.getModuleTitle());
                modMap.put("description", m.getDescription());
                modMap.put("durationHours", m.getDurationHours());
                totalHours += (m.getDurationHours() != null ? m.getDurationHours() : 0);
                moduleList.add(modMap);
            }

            map.put("syllabus", moduleList);
            map.put("totalHours", totalHours);
            map.put("moduleCount", moduleList.size());
            map.put("enrolledCount", traineeRepo.countByAssignedCourseId(c.getId()));

            result.add(map);
        }
        return result;
    }

    // 14. Delete Course Completely from Database (Cascade handling)
    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        // 1. Delete syllabus modules
        List<SyllabusModule> modules = syllabusRepo.findByCourseIdOrderByOrderNoAsc(courseId);
        syllabusRepo.deleteAll(modules);

        // 2. Unassign trainees enrolled in this course
        List<Trainee> trainees = traineeRepo.findByAssignedCourseId(courseId);
        for (Trainee t : trainees) {
            t.setAssignedCourse(null);
            traineeRepo.save(t);
        }

        // 3. Delete attendance records for this course
        List<Attendance> attendanceList = attendanceRepo.findByCourseId(courseId);
        attendanceRepo.deleteAll(attendanceList);

        // 4. Delete assessment scores for this course
        List<AssessmentScore> scores = scoreRepo.findByCourseId(courseId);
        scoreRepo.deleteAll(scores);

        // 5. Delete products linked to this course
        List<Product> products = productRepo.findByCourseId(courseId);
        productRepo.deleteAll(products);

        // 6. Delete course itself from database
        courseRepository.delete(course);
    }

    // 15. Toggle Course Active / Inactive Status
    @Transactional
    public Course toggleCourseStatus(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        course.setActive(!course.isActive());
        return courseRepository.save(course);
    }

    // 16. Get Enrolled Trainers and Trainees for a Course
    public Map<String, Object> getCourseEnrollments(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        // 1. Trainees assigned to this course
        List<Trainee> trainees = traineeRepo.findByAssignedCourseId(courseId);
        List<Map<String, Object>> traineeList = new ArrayList<>();
        for (Trainee t : trainees) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("fullName", t.getFullName());
            map.put("collegeId", t.getUser().getCollegeId());
            map.put("username", t.getUser().getCollegeId());
            map.put("email", t.getUser().getEmail());
            map.put("contactNumber", t.getContactNumber());
            map.put("admissionDate", t.getAdmissionDate() != null ? t.getAdmissionDate().toString() : "N/A");
            map.put("status", t.getUser().isActive() ? "ACTIVE" : "SUSPENDED");
            traineeList.add(map);
        }

        // 2. Trainers assigned to this trade
        List<Trainer> allTrainers = trainerRepo.findAll();
        List<Map<String, Object>> trainerList = new ArrayList<>();
        for (Trainer tr : allTrainers) {
            String spec = tr.getSpecialization() != null ? tr.getSpecialization().toUpperCase() : "";
            if (spec.contains(course.getCode().toUpperCase()) || spec.contains(course.getName().toUpperCase())) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", tr.getId());
                map.put("fullName", tr.getFullName());
                map.put("employeeId", tr.getUser().getCollegeId());
                map.put("username", tr.getUser().getCollegeId());
                map.put("email", tr.getUser().getEmail());
                map.put("contactNumber", tr.getContactNumber());
                map.put("specialization", tr.getSpecialization());
                map.put("status", tr.getUser().isActive() ? "ACTIVE" : "SUSPENDED");
                trainerList.add(map);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("courseId", course.getId());
        result.put("courseName", course.getName());
        result.put("courseCode", course.getCode());
        result.put("durationMonths", course.getDurationMonths());
        result.put("active", course.isActive());
        result.put("trainers", trainerList);
        result.put("trainees", traineeList);
        result.put("totalTrainers", trainerList.size());
        result.put("totalTrainees", traineeList.size());

        return result;
    }

    // 16. Update an Existing Syllabus Module
    @Transactional
    public SyllabusModule updateSyllabusModule(Long moduleId, SyllabusModuleDTO dto) {
        SyllabusModule module = syllabusRepo.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Syllabus module not found: " + moduleId));

        if (dto.getModuleTitle() != null && !dto.getModuleTitle().isBlank()) {
            module.setModuleTitle(dto.getModuleTitle().trim());
        }
        if (dto.getDescription() != null) {
            module.setDescription(dto.getDescription().trim());
        }
        if (dto.getDurationHours() != null) {
            module.setDurationHours(dto.getDurationHours());
        }
        if (dto.getOrderNo() != null) {
            module.setOrderNo(dto.getOrderNo());
        }

        return syllabusRepo.save(module);
    }

    // 17. Delete an Existing Syllabus Module
    @Transactional
    public void deleteSyllabusModule(Long moduleId) {
        SyllabusModule module = syllabusRepo.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Syllabus module not found: " + moduleId));
        syllabusRepo.delete(module);
    }

    // 18. Update Course Details
    @Transactional
    public Course updateCourse(Long courseId, CreateCourseRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        if (req.getName() != null && !req.getName().isBlank()) {
            course.setName(req.getName().trim());
        }
        if (req.getCode() != null && !req.getCode().isBlank()) {
            course.setCode(req.getCode().trim().toUpperCase());
        }
        if (req.getDescription() != null) {
            course.setDescription(req.getDescription().trim());
        }
        if (req.getDurationMonths() != null) {
            course.setDurationMonths(req.getDurationMonths());
        }
        if (req.getFee() != null) {
            course.setFee(req.getFee());
        }

        return courseRepository.save(course);
    }

    // 19. Get Trainer Attendance & Session Delivery Report
    public Map<String, Object> getTrainerAttendanceReport(String collegeId) {
        Trainer trainer = trainerRepo.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getCollegeId().equalsIgnoreCase(collegeId))
                .findFirst()
                .orElse(null);

        Map<String, Object> result = new HashMap<>();
        if (trainer == null) {
            result.put("collegeId", collegeId);
            result.put("trainerName", collegeId);
            result.put("trade", "Vocational Training");
            result.put("totalDays", 0);
            result.put("presentDays", 0L);
            result.put("onDutyDays", 0L);
            result.put("sessionsConducted", 0L);
            result.put("attendancePercentage", 0.0);
            result.put("logs", Collections.emptyList());
            return result;
        }

        String trainerName = trainer.getFullName();
        String trade = trainer.getSpecialization() != null ? trainer.getSpecialization() : "Vocational Training";

        // Query real attendance records from trainer_attendance_records
        List<TrainerAttendance> records = trainerAttendanceRepo.findByTrainerIdOrderByDateDesc(trainer.getId());
        List<Map<String, Object>> logs = new ArrayList<>();

        for (TrainerAttendance a : records) {
            Map<String, Object> log = new HashMap<>();
            log.put("id", a.getId());
            log.put("date", a.getDate().toString());
            log.put("specialization", a.getSpecialization() != null ? a.getSpecialization() : trade);
            log.put("sessionType", a.getSessionType() != null ? a.getSessionType() : "Practical Workshop & Artisan Mentorship");
            log.put("hoursConducted", a.getHoursConducted() != null ? a.getHoursConducted() : 4);
            log.put("status", a.getStatus());
            log.put("remarks", a.getRemarks() != null ? a.getRemarks() : "Practical session conducted");
            logs.add(log);
        }

        // Also incorporate approved leaves for this trainer from leaveRepo
        if (trainer.getUser() != null) {
            List<LeaveRequest> leaves = leaveRepo.findByApplicantId(trainer.getUser().getId());
            for (LeaveRequest lr : leaves) {
                if (lr.getStatus() == LeaveStatus.APPROVED) {
                    java.time.LocalDate d = lr.getStartDate();
                    while (!d.isAfter(lr.getEndDate())) {
                        final String dateKey = d.toString();
                        boolean alreadyLogged = logs.stream().anyMatch(l -> dateKey.equals(l.get("date")));
                        if (!alreadyLogged) {
                            Map<String, Object> log = new HashMap<>();
                            log.put("date", dateKey);
                            log.put("specialization", trade);
                            log.put("sessionType", "Official Approved Leave");
                            log.put("hoursConducted", 0);
                            log.put("status", "ON_DUTY_LEAVE");
                            log.put("remarks", "Approved Leave: " + (lr.getReason() != null ? lr.getReason() : "Departmental Leave"));
                            logs.add(log);
                        }
                        d = d.plusDays(1);
                    }
                }
            }
        }

        // Sort logs descending by date
        logs.sort((a, b) -> ((String) b.get("date")).compareTo((String) a.get("date")));

        long presentCount = logs.stream().filter(l -> "PRESENT".equalsIgnoreCase(String.valueOf(l.get("status")))).count();
        long onDutyCount = logs.stream().filter(l -> "ON_DUTY_LEAVE".equalsIgnoreCase(String.valueOf(l.get("status")))).count();
        int totalDays = logs.size();
        double attendancePercent = totalDays > 0 ? Math.round(((double) (presentCount + onDutyCount) / totalDays) * 1000.0) / 10.0 : 0.0;

        result.put("collegeId", collegeId);
        result.put("trainerName", trainerName);
        result.put("trade", trade);
        result.put("totalDays", totalDays);
        result.put("presentDays", presentCount);
        result.put("onDutyDays", onDutyCount);
        result.put("sessionsConducted", presentCount * 2);
        result.put("attendancePercentage", attendancePercent);
        result.put("logs", logs);

        return result;
    }

    // 21. Admin Log Workshop Session / Override Trainer Attendance
    @Transactional
    public String markTrainerAttendance(Map<String, Object> req) {
        String collegeId = req.get("collegeId") != null ? req.get("collegeId").toString().trim() : null;
        String dateStr = req.get("date") != null ? req.get("date").toString().trim() : null;
        String status = req.get("status") != null ? req.get("status").toString().trim().toUpperCase() : "PRESENT";
        Integer hours = req.get("hoursConducted") != null ? Integer.valueOf(req.get("hoursConducted").toString()) : 4;
        String sessionType = req.get("sessionType") != null ? req.get("sessionType").toString().trim() : "Practical Workshop & Artisan Mentorship";
        String remarks = req.get("remarks") != null ? req.get("remarks").toString().trim() : "Session attendance logged by Central Admin";

        if (collegeId == null || collegeId.isBlank()) {
            throw new RuntimeException("Trainer Staff ID is mandatory");
        }
        if (dateStr == null || dateStr.isBlank()) {
            throw new RuntimeException("Attendance date is mandatory");
        }

        Trainer trainer = trainerRepo.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getCollegeId().equalsIgnoreCase(collegeId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Trainer not found for Staff ID: " + collegeId));

        java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
        Optional<TrainerAttendance> existing = trainerAttendanceRepo.findByTrainerIdAndDate(trainer.getId(), date);
        TrainerAttendance att;
        if (existing.isPresent()) {
            att = existing.get();
            att.setStatus(status);
            att.setHoursConducted(hours);
            att.setRemarks(remarks);
            att.setSessionType(sessionType);
        } else {
            att = TrainerAttendance.builder()
                    .trainer(trainer)
                    .date(date)
                    .status(status)
                    .hoursConducted(hours)
                    .specialization(trainer.getSpecialization())
                    .sessionType(sessionType)
                    .remarks(remarks)
                    .build();
        }
        trainerAttendanceRepo.save(att);
        return "Attendance for " + trainer.getFullName() + " on " + date + " successfully recorded as " + status;
    }

    // 20. Admin Attendance Override (Allows admin to modify or record attendance without time limits)
    @Transactional
    public String adminOverrideAttendance(Map<String, Object> req) {
        String collegeId = req.get("collegeId") != null ? req.get("collegeId").toString().trim() : null;
        Long traineeId = req.get("traineeId") != null ? Long.valueOf(req.get("traineeId").toString()) : null;
        String dateStr = req.get("date") != null ? req.get("date").toString().trim() : null;
        String statusStr = req.get("status") != null ? req.get("status").toString().trim() : "PRESENT";
        String remarks = req.get("remarks") != null ? req.get("remarks").toString().trim() : "Administrative attendance override approved by Central Admin";

        if (dateStr == null || dateStr.isBlank()) {
            throw new RuntimeException("Attendance date is mandatory");
        }

        java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
        AttendanceStatus status = AttendanceStatus.valueOf(statusStr.toUpperCase());

        Trainee trainee = null;
        if (traineeId != null) {
            trainee = traineeRepo.findById(traineeId).orElse(null);
        }
        if (trainee == null && collegeId != null && !collegeId.isBlank()) {
            trainee = traineeRepo.findByUserCollegeId(collegeId).orElse(null);
        }
        if (trainee == null) {
            throw new RuntimeException("Trainee record not found for ID: " + (traineeId != null ? traineeId : collegeId));
        }

        Course course = trainee.getAssignedCourse();
        if (course == null) {
            course = courseRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No active course available for trainee"));
        }

        Optional<Attendance> existing = attendanceRepo.findByTraineeIdAndDate(trainee.getId(), date);
        Attendance att;
        if (existing.isPresent()) {
            att = existing.get();
            att.setStatus(status);
            att.setRemarks(remarks);
        } else {
            att = Attendance.builder()
                    .course(course)
                    .trainee(trainee)
                    .date(date)
                    .status(status)
                    .remarks(remarks)
                    .build();
        }
        attendanceRepo.save(att);
        return "Attendance for " + trainee.getFullName() + " on " + date + " successfully updated to " + status;
    }
}