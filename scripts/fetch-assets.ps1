param(
    [string]$Base = "http://steroid2pmi2vin7vzkaalwreb2y64qtmo5k5paf45txdqxnvmrqbvyd.onion",
    [string]$Out  = "$PSScriptRoot\..\dump\assets",
    [string]$Socks = "127.0.0.1:9150",
    [int]$TimeoutSec = 120
)
$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force -Path $Out | Out-Null

function Get-Asset {
    param([string]$Rel)
    $dest = Join-Path $Out ($Rel.TrimStart('/') -replace '/', '\')
    $dir = Split-Path $dest -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) { return "cached" }
    $url = "$Base/$($Rel.TrimStart('/'))"
    $args = @("-sS", "--socks5-hostname", $Socks, "--max-time", "$TimeoutSec", "--compressed", "-L",
              "-A", "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 Firefox/128.0",
              "-o", $dest, "-w", "%{http_code}|%{size_download}", $url)
    for ($i = 1; $i -le 3; $i++) {
        $out = & curl.exe @args 2>$null
        if ($LASTEXITCODE -eq 0 -and $out -match '^200\|') { return ($out | Out-String).Trim() }
        Start-Sleep -Seconds (2 * $i)
    }
    Remove-Item $dest -ErrorAction SilentlyContinue
    return "FAIL $($out | Out-String)".Trim()
}

$fixed = @(
    "css/bootstrap.min.css",
    "css/style.php",
    "css/font-awesome.min.css",
    "css/font-awesome-ie7.min.css",
    "js/jquery-3.6.0.min.js",
    "js/bootstrap.min.js",
    "images/logo_1.png",
    "images/favicon_1.png",
    "images/header_bg_1.gif",
    "images/USA-Products-Button-Small.jpg",
    "images/EU-Products-Button-Small.jpg",
    "images/UK-Products-Button-Small.jpg",
    "images/icon_monero.png",
    "images/icon_bitcoin.png",
    "images/icon_ethereum.png",
    "images/icon_litecoin.png",
    "images/icon_solana.png",
    "images/icon_dogecoin.png",
    "images/icon_tron.png",
    "images/icon_xrp.png",
    "images/icon_usdt.png"
)
foreach ($r in $fixed) { Write-Host ("{0,-45} {1}" -f $r, (Get-Asset -Rel $r)) -ForegroundColor DarkGray }

# discovering every /images/... referenced by the scraped pages
$pages = Join-Path (Split-Path $Out -Parent) "pages"
if (Test-Path $pages) {
    $refs = New-Object System.Collections.Generic.HashSet[string]
    Get-ChildItem $pages -Filter *.html | ForEach-Object {
        $html = Get-Content $_.FullName -Raw
        foreach ($m in [regex]::Matches($html, '(?:src|href)="(/images/[^"]+)"')) {
            [void]$refs.Add($m.Groups[1].Value)
        }
    }
    foreach ($r in ($refs | Sort-Object)) {
        $res = Get-Asset -Rel $r
        if ($res -like "FAIL*") { Write-Host ("{0,-55} {1}" -f $r, $res) -ForegroundColor DarkRed }
    }
    Write-Host "referenced images: $($refs.Count)" -ForegroundColor DarkGray
}

# font files referenced by the font-awesome stylesheet
$fa = Join-Path $Out "css\font-awesome.min.css"
if (Test-Path $fa) {
    $css = Get-Content $fa -Raw
    foreach ($m in [regex]::Matches($css, 'url\(([^)]+\.(?:woff2?|ttf|eot|svg))\)')) {
        $p = $m.Groups[1].Value.Trim("'", '"')
        $rel = "css/$([System.IO.Path]::GetFileName($p))"
        $exists = Join-Path $Out ($rel -replace '/', '\')
        if (-not (Test-Path $exists)) {
            $candidates = @("font/$([System.IO.Path]::GetFileName($p))", "fonts/$([System.IO.Path]::GetFileName($p))", $rel, $p.TrimStart('/'))
            foreach ($c in $candidates) {
                $dest = Join-Path $Out ($c -replace '/', '\')
                if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) { Write-Host ("font hit: {0}" -f $c) -ForegroundColor DarkGray; break }
                $r = Get-Asset -Rel $c
                if ($r -notlike "FAIL*") { Write-Host ("font got: {0} -> {1}" -f $c, $r) -ForegroundColor DarkGray; break }
            }
        }
    }
}
Write-Host "ASSETS DONE" -ForegroundColor Green
