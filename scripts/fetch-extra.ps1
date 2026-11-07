param(
    [string]$Base = "http://steroid2pmi2vin7vzkaalwreb2y64qtmo5k5paf45txdqxnvmrqbvyd.onion",
    [string]$Out  = "$PSScriptRoot\..\dump",
    [string]$Socks = "127.0.0.1:9150",
    [int]$TimeoutSec = 120
)
$ErrorActionPreference = "Continue"
$Assets = Join-Path $Out "assets"
$Pages = Join-Path $Out "pages"

function Fetch {
    param([string]$Url, [string]$Dest)
    $dir = Split-Path $Dest -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    if ((Test-Path $Dest) -and ((Get-Item $Dest).Length -gt 0)) { return "cached" }
    $args = @("-sS", "--socks5-hostname", $Socks, "--max-time", "$TimeoutSec", "--compressed", "-L",
              "-A", "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
              "-o", $Dest, "-w", "%{http_code}|%{size_download}", $Url)
    for ($i = 1; $i -le 3; $i++) {
        $out = & curl.exe @args 2>$null
        if ($LASTEXITCODE -eq 0 -and $out -match '^200\|') { return ($out | Out-String).Trim() }
        Start-Sleep -Seconds (2 * $i)
    }
    Remove-Item $Dest -ErrorAction SilentlyContinue
    return "FAIL $($out | Out-String)".Trim()
}

# fontes do font-awesome 3.2.1
foreach ($ext in @("eot","woff","ttf","svg")) {
    $rel = "font/fontawesome-webfont.$ext"
    Write-Host ("{0,-35} {1}" -f $rel, (Fetch -Url "$Base/$rel" -Dest (Join-Path $Assets ($rel -replace '/','\')))) -ForegroundColor DarkGray
}
# fundo do body referenciado no style.php
Write-Host ("{0,-35} {1}" -f "images/bg_1.png", (Fetch -Url "$Base/images/bg_1.png" -Dest (Join-Path $Assets "images\bg_1.png"))) -ForegroundColor DarkGray

# paginas de vendor e referral
foreach ($v in 1..3) {
    Write-Host ("{0,-35} {1}" -f "vendor/$v", (Fetch -Url "$Base/vendor/$v" -Dest (Join-Path $Pages "vendor_$v.html"))) -ForegroundColor DarkGray
}
Write-Host ("{0,-35} {1}" -f "referral", (Fetch -Url "$Base/referral" -Dest (Join-Path $Pages "page_referral.html"))) -ForegroundColor DarkGray
Write-Host "EXTRA DONE" -ForegroundColor Green
