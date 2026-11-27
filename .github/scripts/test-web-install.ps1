# Runs tm.txt for real on a Windows runner against a local copy of this site (http://127.0.0.1:8765):
# wrong SHA256 installs nothing, a good package is installed and locked, a locked install is only
# opened, an install users could change is reinstalled. Opening the app is replaced by a marker.
$ErrorActionPreference = 'Stop'
$checks = 0
function Assert($c, $m) { if (-not $c) { throw "FAIL: $m" }; $script:checks++ }
$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$target = Join-Path $env:SystemDrive 'TechMaster-Deploy'
$latest = Get-Content -Raw (Join-Path $repo 'downloads/latest.json') | ConvertFrom-Json
$code = [IO.File]::ReadAllText((Join-Path $repo 'tm.txt'))
$code = $code.Replace("`$site = 'https://dangvien-dev.github.io'", "`$site = 'http://127.0.0.1:8765'")
$opened = 'Start-Process -FilePath $exe -WorkingDirectory $target | Out-Null'
Assert (([regex]::Matches($code, [regex]::Escape($opened))).Count -eq 2 -and $code.Contains("'http://127.0.0.1:8765'")) 'The test copy points at the local site and never opens the app'
$code = $code.Replace($opened, '$global:TechMasterOpened = $exe')
function Invoke-WebInstall([string]$Root) {
    $server = Start-Process python -ArgumentList '-m', 'http.server', '8765', '--bind', '127.0.0.1', '--directory', $Root -PassThru -WindowStyle Hidden
    try {
        for ($i = 0; $i -lt 40; $i++) { try { Invoke-WebRequest 'http://127.0.0.1:8765/downloads/latest.json' -UseBasicParsing | Out-Null; break } catch { Start-Sleep -Milliseconds 250 } }
        $global:TechMasterOpened = $null
        $output = & { Invoke-Expression $code } 6>&1 | Out-String
        Write-Host $output
        return $output
    } finally { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
}
function Test-Locked([string]$Path) {
    $acl = [IO.DirectoryInfo]::new($Path).GetAccessControl()
    $writers = @($acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier]) | Where-Object { $_.AccessControlType -eq 'Allow' -and $_.IdentityReference.Value -notin 'S-1-5-18', 'S-1-5-32-544' -and ([int]$_.FileSystemRights -band 0x50156) })
    return ($acl.AreAccessRulesProtected -and $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -eq 'S-1-5-32-544' -and $writers.Count -eq 0)
}
if (Test-Path $target) { Remove-Item -LiteralPath $target -Recurse -Force }

# 1. A package whose hash differs from latest.json is refused before anything is written.
$bad = Join-Path $env:RUNNER_TEMP 'site-bad'
New-Item -ItemType Directory -Path (Join-Path $bad 'downloads') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $repo ('downloads/' + $latest.zip)) -Destination (Join-Path $bad 'downloads')
$wrong = $latest.PSObject.Copy(); $wrong.sha256 = ('0' * 64)
[IO.File]::WriteAllText((Join-Path $bad 'downloads/latest.json'), ($wrong | ConvertTo-Json))
$out = Invoke-WebInstall $bad
Assert ($out -match 'SHA256 cua goi tai ve khong khop' -and -not (Test-Path (Join-Path $target 'TechMaster Deploy.exe')) -and -not $global:TechMasterOpened) 'Wrong SHA256: nothing installed or opened'

# 2. The published package is installed, locked and opened.
$out = Invoke-WebInstall $repo
Assert ($out -match 'Da kiem tra SHA256' -and $out -match ('Da cai TechMaster Deploy ' + [regex]::Escape($latest.version)) -and $out -notmatch 'Loi:') 'The published package is checked and installed'
Assert ((Test-Path (Join-Path $target 'App\TechMaster-Deploy.ps1')) -and ([IO.File]::ReadAllText((Join-Path $target 'version.txt')).Trim() -ceq $latest.version) -and $global:TechMasterOpened -eq (Join-Path $target 'TechMaster Deploy.exe')) 'Program files are in C:\TechMaster-Deploy and the app is opened'
Assert (Test-Locked $target) 'C:\TechMaster-Deploy: owner Administrators, no inherited entries, only Administrators / SYSTEM can write'
Assert (@(Get-ChildItem -LiteralPath $target -Recurse -Filter '*.tm-new').Count -eq 0) 'No temporary file is left behind'

# 3. A locked install is only opened.
$stamp = (Get-Item (Join-Path $target 'App\TechMaster-Deploy.ps1')).LastWriteTimeUtc
$out = Invoke-WebInstall $repo
Assert ($out -match 'Da co TechMaster Deploy' -and $global:TechMasterOpened -and (Get-Item (Join-Path $target 'App\TechMaster-Deploy.ps1')).LastWriteTimeUtc -eq $stamp) 'A locked install is opened without downloading again'

# 4. An install that users could change is not trusted: it is reinstalled and locked again.
& icacls.exe $target '/grant' '*S-1-5-32-545:(OI)(CI)M' '*S-1-1-0:(OI)(CI)M' | Out-Null
& icacls.exe (Join-Path $target 'App\TechMaster-Deploy.ps1') '/grant' '*S-1-1-0:M' | Out-Null
[IO.File]::WriteAllText((Join-Path $target 'App\TechMaster-Deploy.ps1'), 'planted')
$out = Invoke-WebInstall $repo
Assert ($out -match 'Da cai TechMaster Deploy' -and (Test-Locked $target) -and [IO.File]::ReadAllText((Join-Path $target 'App\TechMaster-Deploy.ps1')) -cne 'planted') 'An unlocked install is replaced by the checked package and locked again'
$sddl = [IO.DirectoryInfo]::new($target).GetAccessControl().GetSecurityDescriptorSddlForm('Access')
$fileRules = @([IO.File]::GetAccessControl((Join-Path $target 'App\TechMaster-Deploy.ps1')).GetAccessRules($true, $false, [Security.Principal.SecurityIdentifier]))
Assert ($sddl -notmatch ';WD\)' -and $fileRules.Count -eq 0) "Explicit entries of other accounts (Everyone) are removed from the folder and its files ($sddl)"
Write-Host "PASS: $checks web install assertions; SHA256 refusal, install, folder lock, reopen and reinstall of an unlocked copy."
