$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Resolve-Path (Join-Path $scriptDir "..")
$port = if ($env:PORT) { [int]$env:PORT } else { 3001 }

# Avoid duplicate detached backend instances
$inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
  $ownerPids = @($inUse | Select-Object -ExpandProperty OwningProcess -Unique)
  foreach ($ownerPid in $ownerPids) {
    try {
      Stop-Process -Id $ownerPid -Force -ErrorAction Stop
      Write-Output "Stopped existing process on port $port (PID $ownerPid)."
    } catch {
      Write-Output "Failed to stop existing process on port $port (PID $ownerPid): $($_.Exception.Message)"
      exit 1
    }
  }
  Start-Sleep -Milliseconds 700
}

$tsxCli = Join-Path $backendDir "node_modules\tsx\dist\cli.mjs"

# Start using backend folder as working directory so tsx finds src/index.ts
if (Test-Path $tsxCli) {
  Start-Process -FilePath "node" -ArgumentList @($tsxCli,'src/index.ts') -WorkingDirectory $backendDir -WindowStyle Hidden
} else {
  Start-Process -FilePath "npx" -ArgumentList @('tsx','src/index.ts') -WorkingDirectory $backendDir -WindowStyle Hidden
}
Write-Output "Started backend detached from $backendDir on port $port"
