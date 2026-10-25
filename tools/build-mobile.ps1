param(
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "otoiro-mobile.html")
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$html = [System.IO.File]::ReadAllText((Join-Path $projectRoot "index.html"), [System.Text.Encoding]::UTF8)
$css = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/css/style.css"), [System.Text.Encoding]::UTF8)
$javascript = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/js/game.js"), [System.Text.Encoding]::UTF8)
$sharingJavascript = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/js/sharing.js"), [System.Text.Encoding]::UTF8)
$resultShareJavascript = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/js/result-share.js"), [System.Text.Encoding]::UTF8)
$songLibraryJavascript = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/js/song-library.js"), [System.Text.Encoding]::UTF8)
$freeVideoJavascript = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/js/free-video.js"), [System.Text.Encoding]::UTF8)
$javascript = $sharingJavascript + "`n" + $resultShareJavascript + "`n" + $songLibraryJavascript + "`n" + $freeVideoJavascript + "`n" + $javascript
$chartPack = [System.IO.File]::ReadAllText((Join-Path $projectRoot "assets/data/custom-charts.json"), [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$embeddedCharts = ConvertTo-Json -InputObject @{ songs = @($chartPack.songs) } -Depth 100 -Compress
$embeddedCharts = $embeddedCharts.Replace("<", "\u003c")
$javascript = $javascript -replace "(?i)</script", "<\/script"
$css = $css -replace "(?i)</style", "<\/style"

$html = [regex]::Replace($html, '(?is)<link\b(?=[^>]*\brel="(?:manifest|icon|apple-touch-icon|stylesheet)")[^>]*>\s*', "`n")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/game\.js"\s+defer></script>', {
  param($match)
  "<script>window.OTOIRO_PORTABLE_APP=true;window.OTOIRO_EMBEDDED_CHARTS=$embeddedCharts;`n$javascript</script>"
})
$html = [regex]::Replace($html, '(?is)<button[^>]*id="connectProjectButton"[^>]*>.*?</button>', "")
$html = [regex]::Replace($html, '(?is)<p\s+class="project-folder-help">.*?</p>', "")
$html = [regex]::Replace($html, '(?is)<details\b[^>]*class="beta-feedback"[^>]*>.*?</details>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/feedback\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/analytics\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/diagnostics\.js"></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/sharing\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/result-share\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/song-library\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<script\s+src="assets/js/free-video\.js"\s+defer></script>', "")
$html = [regex]::Replace($html, '(?is)<button[^>]*id="exportMobileAppButton"[^>]*>.*?</button>', "")
$html = [regex]::Replace($html, '(?is)\A\s*<!doctype html>\s*', "")
$html = $html -replace '(?is)</head>', "<style>`n$css`n</style>`n</head>"

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory -and -not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}
[System.IO.File]::WriteAllText($OutputPath, "<!doctype html>`n$html", [System.Text.UTF8Encoding]::new($false))
Write-Output "Portable mobile app created: $OutputPath"
