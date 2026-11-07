param(
    [string]$Base = "http://steroid2pmi2vin7vzkaalwreb2y64qtmo5k5paf45txdqxnvmrqbvyd.onion",
    [string]$Out  = "$PSScriptRoot\..\dump",
    [string]$Socks = "127.0.0.1:9150",
    [int]$TimeoutSec = 90
)
$ErrorActionPreference = "Continue"
$Pages = Join-Path $Out "pages"
$Assets = Join-Path $Out "assets"
New-Item -ItemType Directory -Force -Path $Pages, $Assets | Out-Null

function Get-Onion {
    param([string]$Url, [string]$OutFile)
    $args = @("-sS", "--socks5-hostname", $Socks, "--max-time", "$TimeoutSec",
              "--compressed", "-L",
              "-A", "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0")
    if ($OutFile) { $args += @("-o", $OutFile) }
    $args += @("-w", "%{http_code}|%{size_download}", $Url)
    for ($i = 1; $i -le 3; $i++) {
        $out = & curl.exe @args 2>$null
        if ($LASTEXITCODE -eq 0 -and $out -match '^200\|') { return ($out | Out-String).Trim() }
        Start-Sleep -Seconds (2 * $i)
    }
    return "FAIL $($out | Out-String)".Trim()
}

# ---- paginas de listagem --------------------------------------------------
for ($p = 1; $p -le 7; $p++) {
    $f = Join-Path $Pages "index_p$p.html"
    if ((Test-Path $f) -and (Get-Item $f).Length -gt 500) { continue }
    $r = Get-Onion -Url "$Base/?page=$p" -OutFile $f
    Write-Host "index p$p -> $r" -ForegroundColor DarkGray
}

# ---- categorias -----------------------------------------------------------
foreach ($c in @(0,1,2,3,4,5,6,8,9,10,11,12,13,14,15)) {
    $f = Join-Path $Pages "cat_$c.html"
    if ((Test-Path $f) -and (Get-Item $f).Length -gt 500) { continue }
    $r = Get-Onion -Url "$Base/cat/$c" -OutFile $f
    Write-Host "cat $c -> $r" -ForegroundColor DarkGray
}

# ---- produtos -------------------------------------------------------------
foreach ($id in 1..150) {
    $f = Join-Path $Pages "product_$id.html"
    if ((Test-Path $f) -and (Get-Item $f).Length -gt 500) { continue }
    $r = Get-Onion -Url "$Base/product/$id" -OutFile $f
    if ($r -notmatch '^200\|') { Remove-Item $f -ErrorAction SilentlyContinue }
    Write-Host "product $id -> $r" -ForegroundColor DarkGray
}

# ---- paginas institucionais ------------------------------------------------
foreach ($p in @("faq","login","register","support","cart","toplist","about","terms","privacy")) {
    $f = Join-Path $Pages "page_$p.html"
    if ((Test-Path $f) -and (Get-Item $f).Length -gt 500) { continue }
    $r = Get-Onion -Url "$Base/$p" -OutFile $f
    if ($r -notmatch '^200\|') { Remove-Item $f -ErrorAction SilentlyContinue }
    Write-Host "page $p -> $r" -ForegroundColor DarkGray
}

Write-Host "PAGES DONE" -ForegroundColor Green
