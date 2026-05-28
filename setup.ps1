# setup.ps1 — one-command bootstrap: install deps, build, link CLI.
# Usage: .\setup.ps1 [[-Prefix] <string>]
#   Defaults to %USERPROFILE%\bin

param(
  [string]$Prefix = "$env:USERPROFILE\bin"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path $ScriptDir
Set-Location $RootDir

function Step($msg)  { Write-Host "`n▸ $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "✓ $msg" -ForegroundColor Green }
function Die($msg)   { Write-Host "✗ $msg" -ForegroundColor Red; exit 1 }

# ── 1. Runtime check ─────────────────────────────────────────────────────────

Step "checking runtime"

$bun = Get-Command bun -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue

if ($bun) {
  $bunVersion = & bun --version
  Ok "bun $bunVersion at $($bun.Source)"
} elseif ($node) {
  $nodeVersion = & node --version
  $nodeMajor = $nodeVersion.TrimStart('v').Split('.')[0]
  if ($nodeMajor -lt 22) {
    Die "node $nodeVersion found, but >=22 required. Install bun (https://bun.sh) or upgrade node."
  }
  Ok "node $nodeVersion (bun not found, falling back)"
} else {
  Die "no bun or node found. Install bun: irm bun.sh/install.ps1 | iex"
}

# ── 2. Install root dependencies ─────────────────────────────────────────────

Step "installing root dependencies"
if ($bun) {
  try { & bun install --frozen-lockfile 2>$null } catch { & bun install }
} else {
  try { & npm ci 2>$null } catch { & npm install }
}
Ok "root dependencies installed"

# ── 3. Install workspace dependencies ────────────────────────────────────────

$workspaces = @("dashboard", "desktop", "packages/core-utils", "packages/dsnix", "packages/ink")
foreach ($ws in $workspaces) {
  if (Test-Path "$ws/package.json") {
    Step "installing $ws dependencies"
    if ($bun) {
      & bun install --cwd $ws 2>$null
    } else {
      Push-Location $ws
      try { & npm ci --ignore-scripts 2>$null } catch {}
      Pop-Location
    }
    Ok $ws
  }
}

# ── 4. Build ─────────────────────────────────────────────────────────────────

Step "building dashboard"
if ($bun) { & bun run build:dashboard } else { & npm run build:dashboard }
Ok "dashboard"

Step "bundling with tsup"
if ($bun) { & bun x tsup } else { & npx tsup }
Ok "tsup"

Step "copying vendor assets"
& node scripts/copy-dashboard-vendor-css.mjs
& node scripts/copy-tree-sitter-grammars.mjs
Ok "vendor assets"

# ── 5. Link CLI ──────────────────────────────────────────────────────────────

Step "linking CLI to $Prefix"

$CliSrc = Join-Path $RootDir "dist\cli\index.js"
if (-not (Test-Path $CliSrc)) {
  Die "built CLI not found at $CliSrc"
}

if (-not (Test-Path $Prefix)) {
  New-Item -ItemType Directory -Path $Prefix -Force | Out-Null
}

foreach ($name in @("deepseek-spec")) {
  $Dest = Join-Path $Prefix "$name.cmd"
  "@node %~dp0..\..\..`\\dist\cli\index.js %*" | Set-Content $Dest
}

# Add to user PATH if not already present
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$Prefix*") {
  [Environment]::SetEnvironmentVariable("Path", "$UserPath;$Prefix", "User")
  Ok "added $Prefix to user PATH (restart shell to apply)"
}

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "Run deepseek-spec to start." -ForegroundColor Cyan
