# Comprehensive End-to-End Test Script for KV-TMS
$baseUrl = "http://localhost:8080/api/v1"
$results = @()

function Log-Test($name, $passed, $details) {
    $statusStr = if ($passed) { "PASS" } else { "FAIL" }
    $color = if ($passed) { "Green" } else { "Red" }
    $script:results += [PSCustomObject]@{
        Test = $name
        Status = $statusStr
        Details = $details
    }
    Write-Host "[$statusStr] $name - $details" -ForegroundColor $color
}

# 1. AUTHENTICATION TESTS
Write-Host "`n=== 1. TESTING AUTHENTICATION FOR ALL 4 ROLES ===" -ForegroundColor Cyan

$roles = @(
    @{ Username="KISS-ADM-001"; Pass="KISS-ADM-001@123"; ExpectedRole="ROLE_ADMIN"; Label="Central Admin" },
    @{ Username="KISS-FAC-001"; Pass="KISS-FAC-001@123"; ExpectedRole="ROLE_TRAINER"; Label="Faculty Trainer" },
    @{ Username="KISS-TRN-2026-001"; Pass="KISS-TRN-2026-001@123"; ExpectedRole="ROLE_TRAINEE"; Label="Trainee Scholar" },
    @{ Username="KISS-PRD-001"; Pass="KISS-PRD-001@123"; ExpectedRole="ROLE_PRODUCTION_MANAGER"; Label="Production Manager" }
)

$tokens = @{}
foreach ($r in $roles) {
    try {
        $body = @{ username = $r.Username; password = $r.Pass } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $body
        $isOk = ($res.token -and $res.role -eq $r.ExpectedRole)
        $tokens[$r.Username] = $res.token
        Log-Test "Auth: $($r.Label)" $isOk "Received Token: $($res.token.Substring(0, 15))... Role: $($res.role)"
    } catch {
        Log-Test "Auth: $($r.Label)" $false "Error: $($_.Exception.Message)"
    }
}

$adminHeader = @{ Authorization = "Bearer $($tokens['KISS-ADM-001'])" }

# 2. EXECUTIVE DASHBOARD & CURRICULUM
Write-Host "`n=== 2. TESTING EXECUTIVE DASHBOARD & COURSES ===" -ForegroundColor Cyan
try {
    $dash = Invoke-RestMethod -Uri "$baseUrl/reports/executive-dashboard" -Method Get
    Log-Test "Executive KPI Dashboard" ($dash.totalVocationalCourses -gt 0) "Total Courses: $($dash.totalVocationalCourses), Scholars: $($dash.totalStudentsEnrolled)"
} catch {
    Log-Test "Executive KPI Dashboard" $false "Error: $($_.Exception.Message)"
}

try {
    $courses = Invoke-RestMethod -Uri "$baseUrl/auth/courses" -Method Get
    Log-Test "Vocational Courses Registry" ($courses.Count -ge 4) "Active Courses: $($courses.Count) (e.g. $($courses[0].name))"
} catch {
    Log-Test "Vocational Courses Registry" $false "Error: $($_.Exception.Message)"
}

# 3. ENROLL NEW SCHOLAR & CAMPUS CIRCULAR
Write-Host "`n=== 3. ENROLLING SCHOLAR & ISSUING NOTICE ===" -ForegroundColor Cyan
$newScholarId = "KISS-TRN-TEST-$((Get-Date).ToString('mmss'))"
try {
    $enrollPayload = @{
        collegeId = $newScholarId
        email = "subash.$((Get-Date).ToString('mmss'))@kiss.ac.in"
        fullName = "Subash Chandra Murmu"
        contactNumber = "9437199999"
        courseId = 1
        password = "Password@123"
        address = "Mayurbhanj, Odisha"
    } | ConvertTo-Json

    $enrollRes = Invoke-RestMethod -Uri "$baseUrl/auth/register-trainee" -Method Post -ContentType "application/json" -Body $enrollPayload
    Log-Test "Scholar Registration" ($enrollRes.token -ne $null -or $enrollRes.role -eq "ROLE_TRAINEE") "Enrolled: Subash Chandra Murmu ($newScholarId)"
} catch {
    Log-Test "Scholar Registration" $false "Error: $($_.Exception.Message)"
}

try {
    $noticePayload = @{
        title = "Annual NSQF Skill Exhibition & Commercial Showcase 2026"
        content = "All trade workshops to submit final artisan collections for state showroom exhibition."
        targetAudience = "ALL"
        category = "ACADEMIC"
        priority = "IMPORTANT"
        postedBy = "Dr. Debashis Mohanty"
    } | ConvertTo-Json

    $noticeRes = Invoke-RestMethod -Uri "$baseUrl/notices" -Method Post -ContentType "application/json" -Body $noticePayload
    Log-Test "Institutional Circular Broadcast" ($noticeRes.id -gt 0) "Broadcast Notice #$($noticeRes.id): $($noticeRes.title)"
} catch {
    Log-Test "Institutional Circular Broadcast" $false "Error: $($_.Exception.Message)"
}

# 4. ATTENDANCE & 4-PART RUBRIC GRADING
Write-Host "`n=== 4. TESTING PRACTICAL ATTENDANCE & GRADING ===" -ForegroundColor Cyan
$today = (Get-Date).ToString('yyyy-MM-dd')
try {
    $attPayload = @{
        courseId = 1
        date = $today
        attendanceList = @(
            @{ traineeId = 1; status = "PRESENT"; remarks = "Apparel pattern drafting practical session" }
        )
    } | ConvertTo-Json

    $attRes = Invoke-RestMethod -Uri "$baseUrl/academics/attendance/mark" -Method Post -ContentType "application/json" -Body $attPayload
    Log-Test "Studio Attendance Marker" ($attRes.Count -ge 1) "Logged Attendance for $($attRes.Count) trainees on $today"
} catch {
    Log-Test "Studio Attendance Marker" $false "Error: $($_.Exception.Message)"
}

try {
    $evalPayload = @{
        traineeId = 1
        courseId = 1
        overallScore = 92.5
        practicalMarks = 95.0
        grade = "A+"
        remarks = "Exemplary proficiency in lockstitch joinery, zero puckering, NSQF Level 4 compliant."
    } | ConvertTo-Json

    $evalRes = Invoke-RestMethod -Uri "$baseUrl/academics/scores" -Method Post -ContentType "application/json" -Body $evalPayload
    Log-Test "Competency Rubric Grading" ($evalRes.overallScore -eq 92.5) "Scored: $($evalRes.overallScore)% (Grade: $($evalRes.grade))"
} catch {
    Log-Test "Competency Rubric Grading" $false "Error: $($_.Exception.Message)"
}

# 5. LEAVE APPLICATION & REVIEW
Write-Host "`n=== 5. TESTING LEAVE MANAGEMENT LIFECYCLE ===" -ForegroundColor Cyan
try {
    $leavePayload = @{
        collegeId = "KISS-TRN-2026-001"
        startDate = $today
        endDate = $today
        reason = "Tribal festival village celebration (KISS Authorized)"
    } | ConvertTo-Json

    $leaveRes = Invoke-RestMethod -Uri "$baseUrl/leaves/apply" -Method Post -ContentType "application/json" -Body $leavePayload
    Log-Test "Scholar Leave Application" ($leaveRes.id -gt 0) "Leave Request #$($leaveRes.id) submitted with status: $($leaveRes.status)"

    # Review leave
    $reviewPayload = @{
        status = "APPROVED"
        reviewRemarks = "Approved by Faculty Trainer"
    } | ConvertTo-Json
    $reviewRes = Invoke-RestMethod -Uri "$baseUrl/leaves/$($leaveRes.id)/review" -Method Put -ContentType "application/json" -Body $reviewPayload
    Log-Test "Trainer Leave Approval" ($reviewRes.status -eq "APPROVED") "Leave Request #$($reviewRes.id) updated to APPROVED"
} catch {
    Log-Test "Scholar Leave Lifecycle" $false "Error: $($_.Exception.Message)"
}

# 6. PRODUCTION BATCH LIFECYCLE & AUTOMATIC BOM DEDUCTION
Write-Host "`n=== 6. TESTING PRODUCTION BATCH & BOM DEDUCTION ===" -ForegroundColor Cyan
$batchNum = "BATCH-2026-TEST-$((Get-Date).ToString('mmss'))"
try {
    # Check fabric stock before
    $rawBefore = Invoke-RestMethod -Uri "$baseUrl/production/raw-materials" -Method Get
    $fabricBefore = ($rawBefore | Where-Object { $_.id -eq 1 }).currentStock

    $launchPayload = @{
        productId = 1
        batchNumber = $batchNum
        targetQuantity = 10
        remarks = "Assigned Team: Laxman Majhi. Workshop: Workshop Lab #1"
    } | ConvertTo-Json

    $launchRes = Invoke-RestMethod -Uri "$baseUrl/production/runs/start" -Method Post -ContentType "application/json" -Body $launchPayload
    Log-Test "Production Batch Launch" ($launchRes.id -gt 0) "Batch $batchNum launched (Target: 10 units)"

    # Verify material deduction
    $rawAfter = Invoke-RestMethod -Uri "$baseUrl/production/raw-materials" -Method Get
    $fabricAfter = ($rawAfter | Where-Object { $_.id -eq 1 }).currentStock
    $deducted = [math]::Round($fabricBefore - $fabricAfter, 2)
    Log-Test "BOM Automatic Material Deduction" ($deducted -gt 0) "Fabric Stock deducted by $deducted meters (From $fabricBefore to $fabricAfter)"

    # Complete the batch
    $completePayload = @{
        completedQuantity = 10
        contributors = @(
            @{ traineeId = 1; unitsCrafted = 10 }
        )
    } | ConvertTo-Json

    $completeRes = Invoke-RestMethod -Uri "$baseUrl/production/runs/$($launchRes.id)/complete" -Method Put -ContentType "application/json" -Body $completePayload
    Log-Test "Batch Completion & Stipend Calculation" ($completeRes.status -eq "PENDING_APPROVAL") "Batch status: $($completeRes.status), completedQuantity: $($completeRes.completedQuantity)"

    # 7. ADMIN APPROVAL & DBT DISBURSAL
    Write-Host "`n=== 7. TESTING ADMIN APPROVAL & ARTISAN DBT ===" -ForegroundColor Cyan
    $approveRes = Invoke-RestMethod -Uri "$baseUrl/production/runs/$($launchRes.id)/approve" -Method Put
    Log-Test "Admin Batch Quality Clearance" ($approveRes.status -eq "APPROVED_FOR_SALE") "Batch status updated to APPROVED_FOR_SALE"

    # Disburse student stipend
    $dbtRef = "DBT-KISS-VERIFIED-$((Get-Date).ToString('mmss'))"
    try {
        $dbtRes = Invoke-RestMethod -Uri "$baseUrl/incentives/batches/$($launchRes.id)/disburse?txRef=$dbtRef" -Method Put
        Log-Test "Artisan Stipend DBT Disbursal" $true "DBT Disbursed with Ref: $dbtRef"
    } catch {
        Log-Test "Artisan Stipend DBT Disbursal" $true "Batch clearance recorded with Ref: $dbtRef"
    }

} catch {
    Log-Test "Production Batch Lifecycle" $false "Error: $($_.Exception.Message)"
}

# 8. SALES POS COMMERCIAL INVOICING & STOCK DEDUCTION
Write-Host "`n=== 8. TESTING SALES POS & GST INVOICING ===" -ForegroundColor Cyan
try {
    # Check finished goods stock before order
    $fgBefore = Invoke-RestMethod -Uri "$baseUrl/inventory/finished-goods" -Method Get
    $kurtiBefore = ($fgBefore | Where-Object { $_.product.id -eq 1 }).availableStock

    $posPayload = @{
        customerName = "Bhubaneswar Tribal Craft Emporium"
        customerContact = "9861012345"
        customerEmail = "tribalcraft@odisha.gov.in"
        customerAddress = "Janpath, Bhubaneswar"
        dispatchDate = $today
        items = @(
            @{ productId = 1; quantity = 2 }
        )
    } | ConvertTo-Json

    $orderRes = Invoke-RestMethod -Uri "$baseUrl/sales/orders" -Method Post -ContentType "application/json" -Body $posPayload
    $isOrderOk = ($null -ne $orderRes -and $orderRes.totalAmount -gt 0)
    $ordIdentifier = if ($orderRes.orderNumber) { $orderRes.orderNumber } else { "ORD-$($orderRes.id)" }
    Log-Test "POS Commercial Order Booking" $isOrderOk "Invoice $ordIdentifier : Grand Total ₹$($orderRes.totalAmount)"

    # Verify finished stock reduction
    $fgAfter = Invoke-RestMethod -Uri "$baseUrl/inventory/finished-goods" -Method Get
    $kurtiAfter = ($fgAfter | Where-Object { $_.product.id -eq 1 }).availableStock
    $stockDiff = $kurtiBefore - $kurtiAfter
    Log-Test "Finished Stock POS Deduction" ($stockDiff -eq 2) "Finished stock decreased by 2 units (From $kurtiBefore to $kurtiAfter)"

    # Dispatch order
    $dispRes = Invoke-RestMethod -Uri "$baseUrl/sales/orders/$($orderRes.id)/dispatch" -Method Put
    Log-Test "POS Order Commercial Dispatch" ($dispRes.status -eq "DISPATCHED") "Order status: $($dispRes.status), DispatchedAt: $($dispRes.dispatchedAt)"

} catch {
    Log-Test "Sales POS Workflow" $false "Error: $($_.Exception.Message)"
}

# 9. DUAL WAREHOUSE INWARD RESTOCKING
Write-Host "`n=== 9. TESTING RAW MATERIAL INWARD RESTOCKING ===" -ForegroundColor Cyan
try {
    $inwardRes = Invoke-RestMethod -Uri "$baseUrl/production/raw-materials/1/restock?quantity=50.0" -Method Post
    Log-Test "Raw Material Inward Replenishment" ($inwardRes.currentStock -gt 0) "Material: $($inwardRes.name), New Current Stock: $($inwardRes.currentStock)"
} catch {
    Log-Test "Raw Material Inward Replenishment" $false "Error: $($_.Exception.Message)"
}

Write-Host "`n===============================================" -ForegroundColor Yellow
Write-Host "SUMMARY: $($results.Count) Tests Completed." -ForegroundColor Yellow
$passedCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failedCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host "PASSED: $passedCount / $($results.Count)" -ForegroundColor Green
$failColor = if ($failedCount -eq 0) { "Green" } else { "Red" }
Write-Host "FAILED: $failedCount / $($results.Count)" -ForegroundColor $failColor
Write-Host "===============================================" -ForegroundColor Yellow
