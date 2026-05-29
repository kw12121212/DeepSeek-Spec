# Install a locally built DeepSeek-Spec native binary to %USERPROFILE%\bin.
# Usage: scripts\install.ps1

$ErrorActionPreference = "Stop"

$Target = "windows-x64"
$BinaryName = "dspec.exe"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")
$SourceBinary = Join-Path $RootDir "dist\native\$Target\$BinaryName"

if (-not (Test-Path $SourceBinary)) {
  Write-Error "Native binary not found at $SourceBinary"
  Write-Host "Run 'bun run build:native --target $Target' first." -ForegroundColor Yellow
  exit 1
}

$DestDir = Join-Path $env:USERPROFILE "bin"
$DestPath = Join-Path $DestDir $BinaryName

if (-not (Test-Path $DestDir)) {
  New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
}

Copy-Item $SourceBinary $DestPath -Force

# Add to user PATH if not already present
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$DestDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$UserPath;$DestDir", "User")
  Write-Host "Added $DestDir to user PATH (restart your shell to apply)."
}

Write-Host "installed dspec to $DestPath"
