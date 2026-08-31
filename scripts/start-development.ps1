[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$envFile = Join-Path $repositoryRoot ".env"
$nodeModules = Join-Path $repositoryRoot "node_modules"
$env:COREPACK_HOME = Join-Path $nodeModules ".corepack"

if (-not (Test-Path $envFile)) {
  throw "Missing .env. Run .\scripts\setup-testing-environment.ps1 first."
}

if (-not (Test-Path $nodeModules)) {
  throw "Missing dependencies. Run .\scripts\setup-testing-environment.ps1 first."
}

if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
  throw "Corepack was not found on PATH. Reopen PowerShell after installing Node.js and try again."
}

Write-Host "Starting Food Fight 26 development services..."
Write-Host "Web/lobby shell: http://localhost:5173"
Write-Host "Game client:    http://localhost:5174"
Write-Host "Press Ctrl+C in this window to stop the development servers."

Push-Location $repositoryRoot
try {
  & corepack pnpm dev
  if ($LASTEXITCODE -ne 0) {
    throw "Development servers stopped with exit code $LASTEXITCODE."
  }
}
finally {
  Pop-Location
}
