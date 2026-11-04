$order = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/sales/orders" -Method Get | Select-Object -Last 1
Write-Host "order.id: $($order.id) (Type: $($order.id.GetType().FullName))"
Write-Host "order.orderNumber: $($order.orderNumber)"
Write-Host "order.totalAmount: $($order.totalAmount) (Type: $($order.totalAmount.GetType().FullName))"
Write-Host "order.id -gt 0: $($order.id -gt 0)"
Write-Host "order.totalAmount -gt 0: $($order.totalAmount -gt 0)"
Write-Host "combined isOrderOk: $(($order.id -gt 0) -and ($order.totalAmount -gt 0))"
