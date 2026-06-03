# Run after: npx vercel login
# Deploys DreamStore to Vercel with env vars from .env

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  Write-Error ".env not found in project root"
}

Get-Content ".env" | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

Write-Host "Linking project (first time may prompt)..."
npx vercel link --yes 2>&1 | Out-Host

$vars = @("DATABASE_URI", "STRIPE_SECRET_KEY", "NEXT_PUBLIC_BASE_URL", "ADMIN_EMAIL")
foreach ($name in $vars) {
  $val = [Environment]::GetEnvironmentVariable($name, "Process")
  if (-not $val) { continue }
  Write-Host "Setting env: $name"
  $val | npx vercel env add $name production --force 2>&1 | Out-Host
}

# Production URL used for Stripe redirects and client API calls
$productionUrl = "https://dreamstore-inky.vercel.app"
Write-Host "Setting NEXT_PUBLIC_BASE_URL=$productionUrl"
$productionUrl | npx vercel env add NEXT_PUBLIC_BASE_URL production --force 2>&1 | Out-Host

Write-Host "Deploying to production..."
npx vercel deploy --prod --yes 2>&1 | Out-Host

Write-Host "Ensuring site is publicly accessible (no Vercel SSO gate)..."
npx vercel project protection disable dreamstore --sso 2>&1 | Out-Host

$deployUrl = (npx vercel ls --prod 2>&1 | Select-String "https://dreamstore-\S+\.vercel\.app" | Select-Object -First 1).ToString().Trim()
if ($deployUrl) {
  Write-Host "Pointing aliases to $deployUrl"
  npx vercel alias set $deployUrl dreamstore-inky.vercel.app 2>&1 | Out-Host
  npx vercel alias set $deployUrl database-inky.vercel.app 2>&1 | Out-Host
}

Write-Host ""
Write-Host "DreamStore is live at:"
Write-Host "  $productionUrl"
Write-Host "  https://database-inky.vercel.app"
