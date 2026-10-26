#Requires -Version 7.0
<#
.SYNOPSIS
    Execute the ordered seed .sql scripts against an Azure SQL database using Microsoft Entra
    authentication, running each script once and skipping scripts that already succeeded.

.DESCRIPTION
    History-aware variant of run-sql-scripts.ps1, for database/seed only. The original runner is
    unchanged and keeps serving the other script folders (for example database/validation).

    Same authentication and execution approach as the original: an access token from
    `az account get-access-token`, and Invoke-Sqlcmd (which understands GO batch separators).

    What it adds
      * Table dbo.SeedScriptHistory (created automatically on first use). One row per script that
        has completed successfully: file name, SHA-256 checksum of the normalised script text,
        UTC time, and the identity that applied it. It is unrelated to __EFMigrationsHistory.
      * A script with no history row is executed. The script and its history row are written in
        ONE transaction, so "succeeded" is never recorded for work that rolled back, and a failed
        script leaves no row and is simply retried on the next run.
      * A script whose history row has the same checksum is skipped.
      * A script whose history row has a DIFFERENT checksum stops the deployment before anything
        runs. An applied script is immutable: add a new, higher-numbered script instead.
      * Concurrent deployments are serialised by a SQL Server application lock taken inside each
        script's transaction. The waiting runner re-checks history after it gets the lock and
        skips a script the other runner has just applied.

    Checksum: SHA-256 over the script as UTF-8 text after removing a leading UTF-8 byte-order
    mark and converting CRLF/CR line endings to LF. Nothing else is normalised, so any real SQL
    change (including whitespace or comments) produces a different checksum. The normalised text
    is exactly what is sent to the server.

    Scripts are ordered by ordinal (character-code) file name, so 09_ runs before 09b_ and 10_.
    Every script must still be safe to run more than once (MERGE / insert-if-missing).

.PARAMETER Server
    Fully qualified SQL server name, e.g. sql-ar001164-aito-qa-eus2-01.database.windows.net

.PARAMETER Database
    Database name, e.g. sqldb-ar001164-aito-qa-01

.PARAMETER ScriptDirectory
    Folder containing the .sql files to run (database/seed).

.PARAMETER QueryTimeoutSeconds
    Per-batch timeout. Content merges over large tables can be slow.

.PARAMETER WhatIf
    Report which scripts would run and which would be skipped, without changing anything. It reads
    dbo.SeedScriptHistory when it can (read-only: no table is created, nothing is written). If the
    database cannot be reached it just lists the scripts, like the original runner.

.EXAMPLE
    ./run-seed-scripts.ps1 -Server sql-x.database.windows.net -Database db -ScriptDirectory ./database/seed
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)][string]$Server,
    [Parameter(Mandatory = $true)][string]$Database,
    [Parameter(Mandatory = $true)][string]$ScriptDirectory,
    [int]$QueryTimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'

$HistoryTable = 'dbo.SeedScriptHistory'
$LockResource = 'AITO.SeedScriptHistory'
$lockTimeoutMs = [Math]::Max(1000, ($QueryTimeoutSeconds - 10) * 1000)

# ---------------------------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------------------------
function Get-NormalizedScript {
    # Returns the script text as it will be executed, and its checksum.
    param([Parameter(Mandatory = $true)][string]$Path)

    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $offset = 0
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $offset = 3 }
    $strictUtf8 = [System.Text.UTF8Encoding]::new($false, $true)
    try {
        $text = $strictUtf8.GetString($bytes, $offset, $bytes.Length - $offset)
    }
    catch {
        throw "$Path is not valid UTF-8. Save it as UTF-8 (with or without BOM)."
    }
    $text = $text.Replace("`r`n", "`n").Replace("`r", "`n")
    $hash = [System.Security.Cryptography.SHA256]::HashData([System.Text.UTF8Encoding]::new($false).GetBytes($text))
    [pscustomobject]@{
        Text   = $text
        Sha256 = ([System.BitConverter]::ToString($hash) -replace '-', '').ToLowerInvariant()
    }
}

function Invoke-SeedSql {
    # One place for the connection settings, so every call authenticates the same way.
    [CmdletBinding()]
    param([Parameter(Mandatory = $true)][string]$Query)

    Invoke-Sqlcmd `
        -ServerInstance $Server `
        -Database $Database `
        -AccessToken $script:accessToken `
        -Query $Query `
        -QueryTimeout $QueryTimeoutSeconds `
        -DisableVariables `
        -AbortOnError `
        -ErrorAction Stop
}

function Get-SeedHistory {
    # Read-only. Returns $null when the history table does not exist yet.
    $exists = @(Invoke-SeedSql -Query "SELECT CASE WHEN OBJECT_ID(N'$HistoryTable', N'U') IS NULL THEN 0 ELSE 1 END AS TableExists;")
    if ($exists.Count -eq 0 -or [int]$exists[0].TableExists -eq 0) { return $null }

    $history = [System.Collections.Generic.Dictionary[string, string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($row in @(Invoke-SeedSql -Query "SELECT ScriptName, ChecksumSha256 FROM $HistoryTable;")) {
        $history[[string]$row.ScriptName] = ([string]$row.ChecksumSha256).Trim().ToLowerInvariant()
    }
    return , $history
}

function New-SeedPlan {
    # Compares every script with the history. $History may be $null (table does not exist yet).
    param($Files, $History)

    foreach ($file in $Files) {
        $normalized = Get-NormalizedScript -Path $file.FullName
        $action = 'RUN'
        if ($null -ne $History -and $History.ContainsKey($file.Name)) {
            $action = if ($History[$file.Name] -eq $normalized.Sha256) { 'SKIP' } else { 'MISMATCH' }
        }
        [pscustomobject]@{
            Name       = $file.Name
            Action     = $action
            Sha256     = $normalized.Sha256
            Text       = $normalized.Text
            AppliedSum = if ($null -ne $History -and $History.ContainsKey($file.Name)) { $History[$file.Name] } else { $null }
        }
    }
}

function Write-SeedPlan {
    param($Plan, $History, $Files)

    foreach ($item in $Plan) {
        switch ($item.Action) {
            'SKIP' { Write-Host "  [SKIP]     $($item.Name)  (already applied, checksum unchanged)" -ForegroundColor DarkGray }
            'RUN' { Write-Host "  [RUN]      $($item.Name)" -ForegroundColor Cyan }
            'MISMATCH' { Write-Host "  [MISMATCH] $($item.Name)  (applied checksum $($item.AppliedSum.Substring(0, 12))..., file checksum $($item.Sha256.Substring(0, 12))...)" -ForegroundColor Red }
        }
    }
    if ($null -ne $History) {
        $present = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
        foreach ($f in $Files) { [void]$present.Add($f.Name) }
        foreach ($name in $History.Keys) {
            if (-not $present.Contains($name)) {
                Write-Host "  [WARN]     $name is recorded as applied but is no longer in $ScriptDirectory" -ForegroundColor Yellow
            }
        }
    }
}

function Assert-NoMismatch {
    param($Plan)

    $bad = @($Plan | Where-Object { $_.Action -eq 'MISMATCH' })
    if ($bad.Count -gt 0) {
        $names = ($bad | ForEach-Object { $_.Name }) -join ', '
        throw ("Seed script(s) changed after they were applied: $names. " +
            "An applied script is immutable and is not re-run. Restore the original file and put the change in a new, " +
            "higher-numbered script, or follow the reviewed procedure for correcting applied seed data. Nothing was executed.")
    }
}

function New-SeedBatch {
    # The script plus its history row, as one transaction. Batches are separated with GO.
    param($Item)

    $name = $Item.Name.Replace("'", "''")
    $sum = $Item.Sha256
    $head = @"
SET XACT_ABORT ON;
GO
BEGIN TRANSACTION;
DECLARE @lock int;
EXEC @lock = sp_getapplock @Resource = N'$LockResource', @LockMode = N'Exclusive', @LockOwner = N'Transaction', @LockTimeout = $lockTimeoutMs;
IF @lock < 0 THROW 50001, N'SEED_LOCK_TIMEOUT: another seed deployment holds the lock.', 1;
DECLARE @applied char(64) = (SELECT ChecksumSha256 FROM $HistoryTable WHERE ScriptName = N'$name');
IF @applied = '$sum' THROW 50002, N'SEED_ALREADY_APPLIED: another deployment applied this script while this one waited.', 1;
IF @applied IS NOT NULL THROW 50003, N'SEED_CHECKSUM_MISMATCH: this script was applied earlier with different content.', 1;
GO

"@
    $tail = @"

GO
IF @@TRANCOUNT <> 1 THROW 50004, N'SEED_TRANSACTION_STATE: the script changed the transaction depth; success was not recorded.', 1;
INSERT $HistoryTable (ScriptName, ChecksumSha256) VALUES (N'$name', '$sum');
COMMIT TRANSACTION;
GO
"@
    return $head + $Item.Text + $tail
}

# ---------------------------------------------------------------------------------------------
# Find the scripts
# ---------------------------------------------------------------------------------------------
if (-not (Test-Path $ScriptDirectory)) {
    throw "Script directory not found: $ScriptDirectory"
}

# Ordinal order, independent of culture: 09_ runs before 09b_, which runs before 10_.
$fileList = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
foreach ($f in Get-ChildItem -Path $ScriptDirectory -Filter *.sql -File) { $fileList.Add($f) }
$fileList.Sort([System.Comparison[System.IO.FileInfo]] { param($a, $b) [string]::CompareOrdinal($a.Name, $b.Name) })
$files = @($fileList)

if ($files.Count -eq 0) {
    Write-Host "No .sql files found in $ScriptDirectory - nothing to do." -ForegroundColor Yellow
    return
}

foreach ($f in $files) {
    if ($f.Name -notmatch '^[A-Za-z0-9][A-Za-z0-9._ -]*\.sql$') {
        throw "Unexpected characters in script file name '$($f.Name)'. Use letters, digits, '.', '_', '-' and spaces only."
    }
}

# ---------------------------------------------------------------------------------------------
# WhatIf: report what would happen, change nothing
# ---------------------------------------------------------------------------------------------
if ($WhatIfPreference) {
    $history = $null
    $checked = $false
    try {
        if (-not (Get-Module -ListAvailable -Name SqlServer)) { throw "SqlServer module is not installed." }
        Import-Module SqlServer -ErrorAction Stop
        $script:accessToken = az account get-access-token --resource "https://database.windows.net/" --query accessToken -o tsv
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($script:accessToken)) { throw "No Azure SQL access token." }
        $history = Get-SeedHistory
        $checked = $true
    }
    catch {
        Write-Host "History could not be checked ($($_.Exception.Message)); listing every script." -ForegroundColor Yellow
    }

    $plan = @(New-SeedPlan -Files $files -History $history)
    Write-Host "Scripts in order$(if ($checked) { ' (history checked read-only)' }):" -ForegroundColor Cyan
    if ($checked -and $null -eq $history) {
        Write-Host "  $HistoryTable does not exist yet: it would be created and every script would run." -ForegroundColor Yellow
    }
    Write-SeedPlan -Plan $plan -History $history -Files $files
    Write-Host "WhatIf specified - no scripts were executed and nothing was written." -ForegroundColor Yellow
    Assert-NoMismatch -Plan $plan
    return
}

# ---------------------------------------------------------------------------------------------
# Authenticate (same approach as run-sql-scripts.ps1)
# ---------------------------------------------------------------------------------------------
# Invoke-Sqlcmd handles GO batch separators, which raw ADO.NET does not.
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Host "Installing SqlServer PowerShell module..." -ForegroundColor Cyan
    Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber -Repository PSGallery
}
Import-Module SqlServer -ErrorAction Stop

Write-Host "Acquiring Entra access token for Azure SQL..." -ForegroundColor Cyan
$script:accessToken = az account get-access-token --resource "https://database.windows.net/" --query accessToken -o tsv
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($script:accessToken)) {
    throw "Failed to acquire an access token for Azure SQL. Ensure the pipeline identity is signed in via AzureCLI."
}

# ---------------------------------------------------------------------------------------------
# Create the history table if needed, then decide what to run
# ---------------------------------------------------------------------------------------------
Write-Host "Ensuring $HistoryTable exists..." -ForegroundColor Cyan
Invoke-SeedSql -Query @"
BEGIN TRANSACTION;
DECLARE @lock int;
EXEC @lock = sp_getapplock @Resource = N'$LockResource', @LockMode = N'Exclusive', @LockOwner = N'Transaction', @LockTimeout = $lockTimeoutMs;
IF @lock < 0 THROW 50001, N'SEED_LOCK_TIMEOUT: another seed deployment holds the lock.', 1;
IF OBJECT_ID(N'$HistoryTable', N'U') IS NULL
BEGIN
    CREATE TABLE $HistoryTable
    (
        ScriptName     nvarchar(260) NOT NULL CONSTRAINT PK_SeedScriptHistory PRIMARY KEY,
        ChecksumSha256 char(64)      NOT NULL,
        AppliedAtUtc   datetime2(3)  NOT NULL CONSTRAINT DF_SeedScriptHistory_AppliedAtUtc DEFAULT (SYSUTCDATETIME()),
        AppliedBy      nvarchar(128) NOT NULL CONSTRAINT DF_SeedScriptHistory_AppliedBy DEFAULT (SUSER_SNAME())
    );
END;
COMMIT TRANSACTION;
"@ | Out-Null

$history = Get-SeedHistory
$plan = @(New-SeedPlan -Files $files -History $history)

Write-Host "Seed scripts (in order):" -ForegroundColor Cyan
Write-SeedPlan -Plan $plan -History $history -Files $files
Assert-NoMismatch -Plan $plan

# ---------------------------------------------------------------------------------------------
# Run what has not been applied, in order; stop at the first failure
# ---------------------------------------------------------------------------------------------
$ran = 0
$skipped = 0
$failed = $false

foreach ($item in $plan) {
    if ($item.Action -eq 'SKIP') {
        Write-Host "[SKIP] $($item.Name) - already applied" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    Write-Host ""
    Write-Host "=== Executing $($item.Name) ===" -ForegroundColor Cyan
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        Invoke-SeedSql -Query (New-SeedBatch -Item $item) -Verbose 4>&1 | Write-Host

        $stopwatch.Stop()
        Write-Host "[OK] $($item.Name) completed in $([math]::Round($stopwatch.Elapsed.TotalSeconds, 1))s and recorded in $HistoryTable" -ForegroundColor Green
        $ran++
    }
    catch {
        $stopwatch.Stop()
        $message = $_.Exception.Message
        if ($message -match 'SEED_ALREADY_APPLIED') {
            Write-Host "[SKIP] $($item.Name) - applied by another deployment while this one waited" -ForegroundColor DarkGray
            $skipped++
            continue
        }
        Write-Host "[FAILED] $($item.Name): $message" -ForegroundColor Red
        Write-Host "Nothing was recorded for $($item.Name); its changes were rolled back. Fix it and run again: it will be retried." -ForegroundColor Red
        $failed = $true
        break
    }
}

if ($failed) {
    throw "A seed script failed. See the log above. Later scripts were not run."
}

Write-Host ""
Write-Host "[OK] Seed complete: $ran executed, $skipped skipped, $($files.Count) total." -ForegroundColor Green
