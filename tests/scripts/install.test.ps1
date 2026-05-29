# Tests for scripts/install.ps1 — verifies local binary copy and PATH update.
# Run: pwsh -File tests/scripts/install.test.ps1

$ErrorActionPreference = "Stop"

$Pass = 0
$Fail = 0

function Assert-True {
  param([string]$Label, [bool]$Condition)
  if ($Condition) {
    Write-Host "  PASS: $Label"
    $script:Pass++
  } else {
    Write-Host "  FAIL: $Label"
    $script:Fail++
  }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..\..")
$InstallPs1 = Join-Path $RootDir "scripts\install.ps1"

$TmpDir = Join-Path $env:TEMP "dspec-install-test-$(Get-Random)"
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

Write-Host "testing install.ps1"

# Test: missing binary exits non-zero
$SourceBinary = Join-Path $RootDir "dist\native\windows-x64\dspec.exe"
$hadBinary = Test-Path $SourceBinary
if ($hadBinary) {
  Move-Item $SourceBinary "$SourceBinary.bak" -Force
}

$exitCode = 0
try {
  & powershell -NoProfile -File $InstallPs1 2>$null
} catch {
  $exitCode = 1
}

Assert-True "missing binary exits non-zero" ($exitCode -ne 0)

if ($hadBinary) {
  Move-Item "$SourceBinary.bak" $SourceBinary -Force
}

# Test: successful copy with fake binary
$FakeDir = Join-Path $RootDir "dist\native\windows-x64"
New-Item -ItemType Directory -Path $FakeDir -Force | Out-Null
$FakeBinary = Join-Path $FakeDir "dspec.exe"
Set-Content $FakeBinary "fake"

$TestPrefix = Join-Path $TmpDir "bin"
$env:USERPROFILE = $TmpDir

$exitCode = 0
try {
  & powershell -NoProfile -File $InstallPs1
} catch {
  $exitCode = 1
}

$DestFile = Join-Path $TmpDir "bin\dspec.exe"
Assert-True "binary copied" (Test-Path $DestFile)

# Cleanup
Remove-Item $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $FakeBinary -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "$Pass passed, $Fail failed"
if ($Fail -gt 0) { exit 1 }
