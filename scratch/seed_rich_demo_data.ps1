# Clean ASCII Seed Script for KV-TMS
$baseUrl = "http://localhost:8080/api/v1"
Write-Host "=== SEEDING COMPREHENSIVE DEMO DATA FOR KV-TMS ===" -ForegroundColor Cyan

# 1. ENROLL TRIBAL SCHOLARS
Write-Host "`n1. Enrolling Apprentice Scholars..." -ForegroundColor Yellow
$scholars = @(
    @{ collegeId="KISS-TRN-2026-006"; fullName="Rani Hembrum"; email="rani.hembrum@kiss.ac.in"; contactNumber="9861054321"; courseId=1; password="Password@123"; address="Mayurbhanj, Odisha" },
    @{ collegeId="KISS-TRN-2026-007"; fullName="Sagar Marandi"; email="sagar.marandi@kiss.ac.in"; contactNumber="9861065432"; courseId=5; password="Password@123"; address="Keonjhar, Odisha" },
    @{ collegeId="KISS-TRN-2026-008"; fullName="Pooja Oram"; email="pooja.oram@kiss.ac.in"; contactNumber="9861076543"; courseId=2; password="Password@123"; address="Sundargarh, Odisha" }
)

foreach ($s in $scholars) {
    try {
        $body = $s | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/register-trainee" -Method Post -ContentType "application/json" -Body $body
        Write-Host "  [OK] Enrolled: $($s.fullName) ($($s.collegeId))" -ForegroundColor Green
    } catch {
        Write-Host "  [INFO] $($s.collegeId): $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

# 2. UPDATE FINISHED GOODS WAREHOUSE STOCK
Write-Host "`n2. Replenishing Finished Goods Warehouse Stock..." -ForegroundColor Yellow
$stocks = @(
    @{ productId=1; availableStock=50; reorderLevel=10; label="Uniform Kurti & Apparel" },
    @{ productId=2; availableStock=35; reorderLevel=10; label="Tribal Art & Handicraft Shawls" },
    @{ productId=3; availableStock=30; reorderLevel=5;  label="Tribal Bamboo Table Lamps" },
    @{ productId=4; availableStock=25; reorderLevel=5;  label="Handcarved Wooden Artifacts" },
    @{ productId=5; availableStock=40; reorderLevel=10; label="Organic Honey & Preserves" }
)

foreach ($stk in $stocks) {
    try {
        $body = @{ productId = $stk.productId; availableStock = $stk.availableStock; reorderLevel = $stk.reorderLevel } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$baseUrl/inventory/stock" -Method Post -ContentType "application/json" -Body $body
        Write-Host "  [OK] Stocked: $($stk.label) -> $($res.availableStock) units" -ForegroundColor Green
    } catch {
        Write-Host "  [INFO] Stock note: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

# 3. SCHEDULE & COMPLETE PRODUCTION BATCHES
Write-Host "`n3. Launching & Submitting Production Batches..." -ForegroundColor Yellow

$batchPendingCode = "BATCH-2026-SEW-004"
try {
    $launchA = @{
        productId = 1
        batchNumber = $batchPendingCode
        targetQuantity = 15
        remarks = "Institutional bulk summer uniform production Apparel Lab 1"
    } | ConvertTo-Json
    $runA = Invoke-RestMethod -Uri "$baseUrl/production/runs/start" -Method Post -ContentType "application/json" -Body $launchA
    Write-Host "  [OK] Started Batch $($batchPendingCode) (ID: $($runA.id))" -ForegroundColor Green

    $completeA = @{
        completedQuantity = 15
        contributors = @(
            @{ traineeId = 1; unitsCrafted = 5 },
            @{ traineeId = 2; unitsCrafted = 5 },
            @{ traineeId = 3; unitsCrafted = 5 }
        )
    } | ConvertTo-Json
    $doneA = Invoke-RestMethod -Uri "$baseUrl/production/runs/$($runA.id)/complete" -Method Put -ContentType "application/json" -Body $completeA
    Write-Host "  [OK] Completed Batch $($batchPendingCode) - Status is $($doneA.status) (Pending Admin Clearance)" -ForegroundColor Yellow
} catch {
    Write-Host "  [INFO] Batch A note: $($_.Exception.Message)" -ForegroundColor DarkGray
}

$batchActiveCode = "BATCH-2026-BAM-002"
try {
    $launchB = @{
        productId = 3
        batchNumber = $batchActiveCode
        targetQuantity = 12
        remarks = "Tribal Bamboo Table Lamps for Heritage Showcase Studio 3"
    } | ConvertTo-Json
    $runB = Invoke-RestMethod -Uri "$baseUrl/production/runs/start" -Method Post -ContentType "application/json" -Body $launchB
    Write-Host "  [OK] Launched Active Batch $($batchActiveCode) - Status is $($runB.status) (Shop Floor Active)" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Batch B note: $($_.Exception.Message)" -ForegroundColor DarkGray
}

# 4. BOOK COMMERCIAL SALES ORDERS
Write-Host "`n4. Booking Commercial Showroom Sales Orders..." -ForegroundColor Yellow
$today = (Get-Date).ToString("yyyy-MM-dd")

$orders = @(
    @{
        customerName = "Odisha State Handloom Weavers Apex Society"
        customerContact = "9861111222"
        customerEmail = "boyanika@odisha.gov.in"
        customerAddress = "Janpath, Unit-IX, Bhubaneswar"
        dispatchDate = $today
        items = @( @{ productId = 1; quantity = 3 } )
    },
    @{
        customerName = "Tribal Heritage Boutique & Crafts"
        customerContact = "9861222333"
        customerEmail = "heritage@craftsodisha.com"
        customerAddress = "Ekamra Haat, Bhubaneswar"
        dispatchDate = $today
        items = @( @{ productId = 3; quantity = 2 } )
    },
    @{
        customerName = "KISS Foundation Visitors Souvenir Center"
        customerContact = "9861333444"
        customerEmail = "souvenirs@kiss.ac.in"
        customerAddress = "KISS Campus 3, Bhubaneswar"
        dispatchDate = $today
        items = @( @{ productId = 1; quantity = 2 } )
    }
)

foreach ($ord in $orders) {
    try {
        $body = $ord | ConvertTo-Json
        $ordRes = Invoke-RestMethod -Uri "$baseUrl/sales/orders" -Method Post -ContentType "application/json" -Body $body
        Write-Host "  [OK] Booked Invoice $($ordRes.orderNumber) for $($ord.customerName) : Total Rs $($ordRes.totalAmount)" -ForegroundColor Green
        
        if ($ord.customerContact -ne "9861333444") {
            $disp = Invoke-RestMethod -Uri "$baseUrl/sales/orders/$($ordRes.id)/dispatch" -Method Put
            Write-Host "    -> Dispatched to customer! Status: $($disp.status)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  [INFO] Order note: $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

# 5. MARK ATTENDANCE & GRADES
Write-Host "`n5. Logging Practical Attendance & NSQF Rubric Scores..." -ForegroundColor Yellow
try {
    $att = @{
        courseId = 1
        date = $today
        attendanceList = @(
            @{ traineeId = 1; status = "PRESENT"; remarks = "Apparel pattern drafting practical session" },
            @{ traineeId = 2; status = "PRESENT"; remarks = "Single needle lockstitch machine training" },
            @{ traineeId = 3; status = "PRESENT"; remarks = "Garment assembly and pocket attachment" }
        )
    } | ConvertTo-Json
    $attRes = Invoke-RestMethod -Uri "$baseUrl/academics/attendance/mark" -Method Post -ContentType "application/json" -Body $att
    Write-Host "  [OK] Marked practical attendance: $($attRes)" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Attendance note: $($_.Exception.Message)" -ForegroundColor DarkGray
}

try {
    $score = @{
        traineeId = 1
        courseId = 1
        overallScore = 94.5
        practicalMarks = 96.0
        grade = "A+"
        remarks = "NSQF Level 4 Certified: Precision cut, lockstitch joinery, zero puckering."
    } | ConvertTo-Json
    $scoreRes = Invoke-RestMethod -Uri "$baseUrl/academics/scores" -Method Post -ContentType "application/json" -Body $score
    Write-Host "  [OK] Recorded Rubric Score for Trainee 1: $($scoreRes.overallScore)% ($($scoreRes.grade))" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Score note: $($_.Exception.Message)" -ForegroundColor DarkGray
}

Write-Host "`n=== DEMO DATA SEEDING COMPLETE ===" -ForegroundColor Green
