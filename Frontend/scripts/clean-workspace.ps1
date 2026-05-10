$targets = @(
    ".angular",
    "dist",
    "out-tsc"
)

foreach ($target in $targets) {
    if (Test-Path $target) {
        Remove-Item -LiteralPath $target -Recurse -Force
        Write-Output "Removed $target"
    }
}
