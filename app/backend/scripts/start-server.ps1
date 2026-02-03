$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Resolve-Path (Join-Path $scriptDir "..")

# Start using backend folder as working directory so tsx finds src/index.ts
Start-Process -FilePath "npx" -ArgumentList @('tsx','src/index.ts') -WorkingDirectory $backendDir -WindowStyle Hidden
Write-Output "Started backend detached from $backendDir"
