package com.kiss.kv_tms.controller;

import com.kiss.kv_tms.dto.*;
import com.kiss.kv_tms.entity.AssessmentScore;
import com.kiss.kv_tms.entity.Course;
import com.kiss.kv_tms.entity.SyllabusModule;
import com.kiss.kv_tms.service.AcademicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/academics")
public class AcademicController {

    @Autowired
    private AcademicService academicService;

    // 1. Add Module to a Course's Syllabus (Trainer/Admin)
    @PostMapping("/courses/{courseId}/syllabus")
    public ResponseEntity<SyllabusModule> addSyllabusModule(
            @PathVariable Long courseId,
            @Valid @RequestBody SyllabusModuleDTO dto) {
        return ResponseEntity.ok(academicService.addSyllabusModule(courseId, dto));
    }

    // 2. View Syllabus for a Course (Trainees, Trainers, Admin)
    @GetMapping("/courses/{courseId}/syllabus")
    public ResponseEntity<List<SyllabusModule>> getSyllabus(@PathVariable Long courseId) {
        return ResponseEntity.ok(academicService.getCourseSyllabus(courseId));
    }

    // 3. Mark Batch Attendance (Trainer)
    @PostMapping("/attendance/mark")
    public ResponseEntity<String> markBatchAttendance(@Valid @RequestBody BatchAttendanceRequest req) {
        return ResponseEntity.ok(academicService.markBatchAttendance(req));
    }

    // 4. Record Trainee Assessment Score (Trainer)
    @PostMapping("/scores")
    public ResponseEntity<AssessmentScore> recordScore(@Valid @RequestBody ScoreRecordRequest req) {
        return ResponseEntity.ok(academicService.recordScore(req));
    }

    // 5. Trainee Progress View (Attendance %, Score, Course Info by traineeId)
    @GetMapping("/trainees/{traineeId}/progress")
    public ResponseEntity<Map<String, Object>> getTraineeProgress(@PathVariable Long traineeId) {
        return ResponseEntity.ok(academicService.getTraineeAcademicSummary(traineeId));
    }

    // 6. Trainee Progress View by College ID (for Student Portal)
    @GetMapping("/trainees/by-college-id/{collegeId}/progress")
    public ResponseEntity<Map<String, Object>> getTraineeProgressByCollegeId(@PathVariable String collegeId) {
        return ResponseEntity.ok(academicService.getTraineeAcademicSummaryByCollegeId(collegeId));
    }

    // 7. Get All Trainees directly from MySQL (for Trainer Console & Admin)
    @GetMapping("/trainees")
    public ResponseEntity<List<Map<String, Object>>> getAllTrainees() {
        return ResponseEntity.ok(academicService.getAllTrainees());
    }

    // 8. Get Today's Attendance status for all trainees
    @GetMapping("/attendance/today")
    public ResponseEntity<List<Map<String, Object>>> getTodayAttendance() {
        return ResponseEntity.ok(academicService.getAttendanceRecordsForDate(java.time.LocalDate.now()));
    }

    // 8b. Get Attendance by specific Date (per-day attendance)
    @GetMapping("/attendance/by-date")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceByDate(@RequestParam(required = false) String date) {
        java.time.LocalDate targetDate = (date != null && !date.isBlank()) ? java.time.LocalDate.parse(date) : java.time.LocalDate.now();
        return ResponseEntity.ok(academicService.getAttendanceRecordsForDate(targetDate));
    }

    // 8c. Get Complete Attendance History Log across all dates
    @GetMapping("/attendance/history")
    public ResponseEntity<List<Map<String, Object>>> getAllAttendanceHistory() {
        return ResponseEntity.ok(academicService.getAllAttendanceHistory());
    }

    // 9. Get Assessment Score by College ID
    @GetMapping("/scores/by-college-id/{collegeId}")
    public ResponseEntity<Map<String, Object>> getScoreByCollegeId(@PathVariable String collegeId) {
        return ResponseEntity.ok(academicService.getScoreByCollegeId(collegeId));
    }

    // 10. Get Trainee Attendance History by College ID
    @GetMapping("/trainees/by-college-id/{collegeId}/attendance")
    public ResponseEntity<List<Map<String, Object>>> getTraineeAttendance(@PathVariable String collegeId) {
        return ResponseEntity.ok(academicService.getTraineeAttendanceListByCollegeId(collegeId));
    }

    // 11. Create Course with Syllabus Modules (Admin)
    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CreateCourseRequest req) {
        return ResponseEntity.ok(academicService.createCourseWithSyllabus(req));
    }

    // 12. Get All Courses with Complete Syllabus & Statistics (Admin & Portals)
    @GetMapping("/courses/detailed")
    public ResponseEntity<List<Map<String, Object>>> getDetailedCourses() {
        return ResponseEntity.ok(academicService.getAllCoursesWithDetails());
    }

    // 13. Delete Course completely from database (Admin)
    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long courseId) {
        academicService.deleteCourse(courseId);
        return ResponseEntity.ok("Course " + courseId + " successfully deleted from database");
    }

    // 14. Toggle Course Active / Inactive Status (Admin)
    @PutMapping("/courses/{courseId}/toggle-status")
    public ResponseEntity<?> toggleCourseStatus(@PathVariable Long courseId) {
        return ResponseEntity.ok(academicService.toggleCourseStatus(courseId));
    }

    // 15. Get Enrolled Trainers and Trainees for a Course (Admin)
    @GetMapping("/courses/{courseId}/enrollments")
    public ResponseEntity<Map<String, Object>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(academicService.getCourseEnrollments(courseId));
    }

    // 16. Update Existing Syllabus Module (Admin/Trainer)
    @PutMapping("/syllabus-modules/{moduleId}")
    public ResponseEntity<SyllabusModule> updateSyllabusModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody SyllabusModuleDTO dto) {
        return ResponseEntity.ok(academicService.updateSyllabusModule(moduleId, dto));
    }

    // 17. Delete Existing Syllabus Module (Admin)
    @DeleteMapping("/syllabus-modules/{moduleId}")
    public ResponseEntity<String> deleteSyllabusModule(@PathVariable Long moduleId) {
        academicService.deleteSyllabusModule(moduleId);
        return ResponseEntity.ok("Syllabus module " + moduleId + " successfully deleted from database");
    }

    // 18. Update Course Details (Admin)
    @PutMapping("/courses/{courseId}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCourseRequest req) {
        return ResponseEntity.ok(academicService.updateCourse(courseId, req));
    }

    // 19. Get Trainer Attendance Report by Staff / College ID
    @GetMapping("/trainers/by-college-id/{collegeId}/attendance")
    public ResponseEntity<Map<String, Object>> getTrainerAttendance(@PathVariable String collegeId) {
        return ResponseEntity.ok(academicService.getTrainerAttendanceReport(collegeId));
    }

    // 20. Admin Attendance Override (Unlimited past date modification)
    @PostMapping("/attendance/admin-override")
    public ResponseEntity<String> adminOverrideAttendance(@RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(academicService.adminOverrideAttendance(req));
    }

    // 21. Admin Log Workshop Session / Override Trainer Attendance
    @PostMapping("/trainers/attendance/mark")
    public ResponseEntity<String> markTrainerAttendance(@RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(academicService.markTrainerAttendance(req));
    }
}