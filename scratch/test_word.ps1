try {
    $word = New-Object -ComObject Word.Application
    Write-Output "Word COM Object is Available: $($word.Version)"
    $word.Quit()
} catch {
    Write-Output "Word COM not available: $_"
}
