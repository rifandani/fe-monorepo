# Worktree bootstrap for SPA + web + expo + portless (`/wt` skill).
# Runs inside the new worktree. ROOT_WORKTREE_PATH = main checkout.
$ErrorActionPreference = 'Stop'

if (-not $env:ROOT_WORKTREE_PATH) {
  throw 'ROOT_WORKTREE_PATH is required'
}

$Root = $env:ROOT_WORKTREE_PATH
# Matches portless.json / `bun spa` / `bun web` (`portless run --name *.fe-monorepo`).
$SpaPortlessName = 'spa.fe-monorepo'
$WebPortlessName = 'web.fe-monorepo'

Write-Host '==> Installing workspace dependencies'
bun install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw "bun install failed ($LASTEXITCODE)" }

function Sync-AppEnvs {
  param(
    [Parameter(Mandatory = $true)][string]$AppDir,
    [Parameter(Mandatory = $true)][string[]]$Files
  )

  New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
  $copied = 0

  foreach ($f in $Files) {
    $src = Join-Path (Join-Path $Root $AppDir) $f
    if (Test-Path $src) {
      Copy-Item $src (Join-Path $AppDir $f) -Force
      Write-Host "    copied $AppDir/$f"
      $copied++
    }
  }

  foreach ($envName in @('dev', 'prod')) {
    $target = Join-Path $AppDir ".env.$envName"
    $example = Join-Path $AppDir ".env.$envName.example"
    if (-not (Test-Path $target) -and (Test-Path $example)) {
      Copy-Item $example $target -Force
      Write-Host "    seeded $AppDir/.env.$envName from example"
      $copied++
    }
  }

  $localTarget = Join-Path $AppDir '.env.local'
  $localExample = Join-Path $AppDir '.env.local.example'
  if (-not (Test-Path $localTarget) -and (Test-Path $localExample)) {
    Copy-Item $localExample $localTarget -Force
    Write-Host "    seeded $AppDir/.env.local from example"
    $copied++
  }

  if ($copied -eq 0) {
    Write-Host "    warning: no env files found in $Root/$AppDir (copy *.example manually)"
  }
}

Write-Host '==> Syncing app env files from main checkout'
Sync-AppEnvs -AppDir 'apps/spa' -Files @('.env.dev', '.env.prod', '.env.local')
Sync-AppEnvs -AppDir 'apps/web' -Files @('.env.dev', '.env.prod', '.env.local')
Sync-AppEnvs -AppDir 'apps/expo' -Files @('.env.local')

Write-Host '==> Checking portless (required for bun spa / bun web)'
if (-not (Get-Command portless -ErrorAction SilentlyContinue)) {
  Write-Host 'error: portless not on PATH. Install once on the machine:'
  Write-Host '  npm install -g portless'
  Write-Host '  # or: bun add -g portless'
  throw 'portless missing'
}

$spaUrl = $null
try { $spaUrl = (portless get $SpaPortlessName 2>$null | Select-Object -First 1).Trim() } catch {}
if (-not $spaUrl) { $spaUrl = "https://$SpaPortlessName.localhost" }

$webUrl = $null
try { $webUrl = (portless get $WebPortlessName 2>$null | Select-Object -First 1).Trim() } catch {}
if (-not $webUrl) { $webUrl = "https://$WebPortlessName.localhost" }

Write-Host ''
Write-Host 'Worktree setup complete.'
Write-Host "  SPA URL:  $spaUrl"
Write-Host "  Web URL:  $webUrl"
Write-Host '  Start:    bun spa   # or: bun web / bun expo'
Write-Host ''
