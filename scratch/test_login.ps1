$body = @{
    username = "KISS-ADM-001"
    password = "KISS-ADM-001@123"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Output "SUCCESS: Logged in as $($res.fullName) ($($res.role)) Token: $($res.token.Substring(0, 20))..."
} catch {
    Write-Output "LOGIN FAILED: $_"
}
