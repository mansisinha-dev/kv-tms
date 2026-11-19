$headers = @{ "Content-Type" = "application/json" }

# Seed 20 Sessions for Course 1 (VOC-SEW-101) for Laxman Majhi (traineeId: 1)
$sessions = @(
    @{ date = "2026-03-24"; status = "PRESENT"; remarks = "Garment construction practical session" },
    @{ date = "2026-03-23"; status = "PRESENT"; remarks = "Pattern drafting and seam allowance exercise" },
    @{ date = "2026-03-22"; status = "PRESENT"; remarks = "Single needle lockstitch machine operation" },
    @{ date = "2026-03-21"; status = "PRESENT"; remarks = "Fabric inspection and defect identification" },
    @{ date = "2026-03-20"; status = "ABSENT"; remarks = "Sanctioned medical leave" },
    @{ date = "2026-03-19"; status = "PRESENT"; remarks = "Overlock and interlock edge finishing workshop" },
    @{ date = "2026-03-18"; status = "PRESENT"; remarks = "Buttonholing and zipper attachment techniques" },
    @{ date = "2026-03-17"; status = "PRESENT"; remarks = "Apparel sizing and anthropometric grading" },
    @{ date = "2026-03-16"; status = "PRESENT"; remarks = "Industrial sewing machine maintenance & oiling" },
    @{ date = "2026-03-15"; status = "PRESENT"; remarks = "Pocket attachment and collar mounting practical" },
    @{ date = "2026-03-14"; status = "PRESENT"; remarks = "Tribal applique embroidery integration on kurtas" },
    @{ date = "2026-03-13"; status = "PRESENT"; remarks = "Steam pressing and final finishing inspection" },
    @{ date = "2026-03-12"; status = "ABSENT"; remarks = "Permitted travel for village cultural fest" },
    @{ date = "2026-03-11"; status = "PRESENT"; remarks = "Quality control measurement tolerance verification" },
    @{ date = "2026-03-10"; status = "PRESENT"; remarks = "Batch production cutting table layout" },
    @{ date = "2026-03-09"; status = "PRESENT"; remarks = "Textile testing: warp/weft tensile strength" },
    @{ date = "2026-03-08"; status = "PRESENT"; remarks = "Standard operating procedures & shopfloor safety" },
    @{ date = "2026-03-07"; status = "PRESENT"; remarks = "Heritage Sambalpuri border stitching practical" },
    @{ date = "2026-03-06"; status = "PRESENT"; remarks = "Eco-friendly fabric handling and wash-care labeling" },
    @{ date = "2026-03-05"; status = "PRESENT"; remarks = "NSQF Level 4 workstation setup and safety audit" }
)

foreach ($s in $sessions) {
    $batchBody = @{
        courseId = 1
        date = $s.date
        attendanceList = @(
            @{
                traineeId = 1
                status = $s.status
                remarks = $s.remarks
            }
        )
    } | ConvertTo-Json -Depth 4

    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/academics/attendance/mark" -Method Post -Body $batchBody -Headers $headers
    } catch {
        Write-Output "Err marking $($s.date): $_"
    }
}

# Verify Attendance count
$vAtt = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/academics/trainees/by-college-id/KISS-TRN-2026-001/attendance"
Write-Output "Total Attendance Logs for Laxman Majhi in MySQL: $($vAtt.Count)"
