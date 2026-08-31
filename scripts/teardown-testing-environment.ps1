[CmdletBinding(SupportsShouldProcess)]
param(
  [switch]$RemoveVolumes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$composeFile = Join-Path $repositoryRoot "infra\docker-compose.yml"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker was not found on PATH. Reopen PowerShell after installing Docker Desktop and try again."
}

$arguments = @("compose", "-f", $composeFile, "down", "--remove-orphans")
if ($RemoveVolumes) {
  $arguments += "--volumes"
}

$target = if ($RemoveVolumes) { "Food Fight containers, network, and database volumes" } else { "Food Fight containers and network" }
if (-not $PSCmdlet.ShouldProcess($target, "Remove")) {
  Write-Host "Teardown skipped."
  return
}

Push-Location $repositoryRoot
try {
  & docker @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Docker Compose teardown failed."
  }
}
finally {
  Pop-Location
}

if ($RemoveVolumes) {
  Write-Host "Testing environment stopped and local database data removed."
}
else {
  Write-Host "Testing environment stopped. PostgreSQL and Redis data volumes were preserved."
}
