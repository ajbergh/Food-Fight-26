[CmdletBinding()]
param(
  [switch]$SkipDependencies,
  [switch]$SkipBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-RequiredCommand {
  param(
    [Parameter(Mandatory)] [string]$Command,
    [Parameter(Mandatory)] [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $Command $($Arguments -join ' ')"
  }
}

function Require-Command {
  param([Parameter(Mandatory)] [string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found on PATH. Install it, reopen PowerShell, and run this script again."
  }
}

function Initialize-LocalCorepack {
  param([Parameter(Mandatory)] [string]$RepositoryRoot)

  $corepackHome = Join-Path $RepositoryRoot "node_modules\.corepack"
  $pnpmBin = Join-Path $RepositoryRoot "node_modules\.bin"
  $pnpmShim = Join-Path $pnpmBin "pnpm.cmd"

  New-Item -ItemType Directory -Force -Path $corepackHome, $pnpmBin | Out-Null
  $env:COREPACK_HOME = $corepackHome

  @'
@echo off
set "COREPACK_HOME=%~dp0..\.corepack"
call corepack pnpm %*
'@ | Set-Content -LiteralPath $pnpmShim -Encoding ascii
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composeFile = Join-Path $repositoryRoot "infra\docker-compose.yml"
$envFile = Join-Path $repositoryRoot ".env"
$envTemplate = Join-Path $repositoryRoot ".env.example"

Require-Command "node"
Require-Command "corepack"
Require-Command "docker"
Initialize-LocalCorepack -RepositoryRoot $repositoryRoot

$nodeVersion = [version]((& node --version).Trim().TrimStart("v"))
if ($nodeVersion.Major -lt 22) {
  throw "Node.js 22 or newer is required; found $nodeVersion."
}

if (-not (Test-Path $envFile)) {
  Copy-Item -LiteralPath $envTemplate -Destination $envFile
  Write-Host "Created .env from .env.example."
}

Push-Location $repositoryRoot
try {
  Invoke-RequiredCommand -Command "docker" -Arguments @("info", "--format", "Docker server {{.ServerVersion}} is reachable.")

  if (-not $SkipDependencies) {
    Invoke-RequiredCommand -Command "corepack" -Arguments @("pnpm", "install")
  }

  if (-not $SkipBrowser) {
    Invoke-RequiredCommand -Command "corepack" -Arguments @("pnpm", "exec", "playwright", "install", "chromium")
  }

  Invoke-RequiredCommand -Command "docker" -Arguments @("compose", "-f", $composeFile, "up", "--detach", "--wait")
  Invoke-RequiredCommand -Command "docker" -Arguments @("compose", "-f", $composeFile, "ps")
}
finally {
  Pop-Location
}

Write-Host "Testing environment is ready. Run 'corepack pnpm test:e2e' to execute browser tests."
