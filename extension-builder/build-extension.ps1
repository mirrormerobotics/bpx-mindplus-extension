[CmdletBinding()]
param(
    [string]$ExtensionPath,
    [string]$TemplatePath,
    [string]$OutputDirectory,
    [switch]$KeepWork
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($ExtensionPath)) {
    $ExtensionPath = Join-Path $PSScriptRoot 'source\extension'
}
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $PSScriptRoot 'dist'
}

$officialTemplateUrl = 'https://gitee.com/mind-plus/mindplus-ext2-builder/repository/archive/master.zip'
$bundledTemplate = Join-Path $PSScriptRoot 'official-template'
$sourceExtension = [IO.Path]::GetFullPath($ExtensionPath)
$workRoot = Join-Path $PSScriptRoot '.work'
$templateRoot = Join-Path $workRoot 'mindplus-ext2-builder'
$downloadPath = Join-Path $workRoot 'mindplus-ext2-builder.zip'

function Assert-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command: $Name. Install Node.js 18+ and try again."
    }
}

function Reset-SafeDirectory([string]$Path) {
    $fullPath = [IO.Path]::GetFullPath($Path)
    $builderRoot = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
    if (-not $fullPath.StartsWith($builderRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a directory outside extension-builder: $fullPath"
    }
    if (Test-Path -LiteralPath $fullPath) {
        Remove-Item -LiteralPath $fullPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $fullPath | Out-Null
}

function Copy-Template([string]$Source, [string]$Destination) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Destination -Recurse -Force
    }
}

function Test-ZipFile([string]$Path) {
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $archive = [IO.Compression.ZipFile]::OpenRead($Path)
        $hasEntries = $archive.Entries.Count -gt 0
        $archive.Dispose()
        return $hasEntries
    } catch {
        return $false
    }
}

Assert-Command 'node'
$npmCommand = if (Get-Command 'npm.cmd' -ErrorAction SilentlyContinue) {
    'npm.cmd'
} else {
    'npm'
}
Assert-Command $npmCommand
if (-not (Test-Path -LiteralPath $sourceExtension -PathType Container)) {
    throw "ExtensionPath does not exist: $sourceExtension"
}

$configPath = Join-Path $sourceExtension 'public\config.json'
foreach ($requiredSourceFile in @('index.js', 'func.js', 'public\config.json', 'public\cover.png')) {
    if (-not (Test-Path -LiteralPath (Join-Path $sourceExtension $requiredSourceFile))) {
        throw "Extension source is missing $requiredSourceFile"
    }
}

try {
    $config = Get-Content -Raw -Encoding UTF8 -LiteralPath $configPath | ConvertFrom-Json
} catch {
    throw "Invalid JSON in $configPath`: $($_.Exception.Message)"
}

foreach ($field in @('id', 'author', 'version', 'mode')) {
    if (-not $config.PSObject.Properties.Name.Contains($field) -or [string]::IsNullOrWhiteSpace([string]$config.$field)) {
        throw "config.json is missing required field: $field"
    }
}
if ($config.id -notmatch '^[A-Za-z0-9._-]+$') {
    throw 'config.json id may contain only English letters, numbers, dot, underscore, and hyphen.'
}
if ($config.author -notmatch '^[A-Za-z0-9._-]+$') {
    throw 'config.json author may contain only English letters, numbers, dot, underscore, and hyphen.'
}
if ($config.version -notmatch '^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$') {
    throw 'config.json version must use semantic versioning, for example 1.0.0.'
}

Reset-SafeDirectory $workRoot

if ($TemplatePath) {
    $resolvedTemplate = (Resolve-Path -LiteralPath $TemplatePath).Path
    if (-not (Test-Path -LiteralPath (Join-Path $resolvedTemplate 'package.json'))) {
        throw "TemplatePath does not contain package.json: $resolvedTemplate"
    }
    Copy-Template $resolvedTemplate $templateRoot
} elseif (Test-Path -LiteralPath (Join-Path $bundledTemplate 'package.json')) {
    Write-Host 'Using the bundled official Mind+ V2 template snapshot...'
    Copy-Template $bundledTemplate $templateRoot
} else {
    Write-Host "Downloading the official Mind+ V2 template..."
    $curl = Get-Command 'curl.exe' -ErrorAction SilentlyContinue
    if ($curl) {
        & $curl.Source -fL --retry 3 --connect-timeout 20 -A 'Mozilla/5.0' -o $downloadPath $officialTemplateUrl
        if ($LASTEXITCODE -ne 0) {
            throw "Unable to download the official Mind+ template (curl exit code $LASTEXITCODE)."
        }
    } else {
        Invoke-WebRequest -UseBasicParsing -Headers @{'User-Agent' = 'Mozilla/5.0'} -Uri $officialTemplateUrl -OutFile $downloadPath
    }
    if (-not (Test-ZipFile $downloadPath)) {
        throw "The official template download is not a valid ZIP. Download it manually from https://gitee.com/mind-plus/mindplus-ext2-builder and pass its directory with -TemplatePath."
    }
    $extractRoot = Join-Path $workRoot 'downloaded-template'
    Expand-Archive -LiteralPath $downloadPath -DestinationPath $extractRoot
    $packageFile = Get-ChildItem -LiteralPath $extractRoot -Filter package.json -Recurse |
        Where-Object { (Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName) -match 'mindplus-extension-builder' } |
        Select-Object -First 1
    if (-not $packageFile) {
        throw 'The downloaded archive is not a recognized Mind+ V2 extension template.'
    }
    Copy-Template $packageFile.DirectoryName $templateRoot
}

$templateExtension = Join-Path $templateRoot 'extension'
if (Test-Path -LiteralPath $templateExtension) {
    Remove-Item -LiteralPath $templateExtension -Recurse -Force
}
Copy-Item -LiteralPath $sourceExtension -Destination $templateExtension -Recurse

Push-Location $templateRoot
try {
    Write-Host 'Installing template dependencies...'
    & $npmCommand ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

    Write-Host 'Compiling the BPX Mind+ extension...'
    & $npmCommand run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed with exit code $LASTEXITCODE" }
} finally {
    Pop-Location
}

$expectedName = "ext-$($config.author)-$($config.id)@$($config.version)"
$builtExtension = Join-Path (Join-Path $templateRoot 'build') $expectedName
if (-not (Test-Path -LiteralPath $builtExtension)) {
    $available = (Get-ChildItem -LiteralPath (Join-Path $templateRoot 'build') -Directory | Select-Object -ExpandProperty Name) -join ', '
    throw "Expected build output '$expectedName' was not found. Available: $available"
}

foreach ($requiredFile in @('config.json', 'main.js', 'cover.png')) {
    if (-not (Test-Path -LiteralPath (Join-Path $builtExtension $requiredFile))) {
        throw "Build output is missing $requiredFile"
    }
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$zipName = "MindPlus-extension-$($config.author)-$($config.id)-v$($config.version).zip"
$zipPath = Join-Path $OutputDirectory $zipName
if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}
Compress-Archive -LiteralPath $builtExtension -DestinationPath $zipPath -CompressionLevel Optimal

$hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Host ''
Write-Host "Package created: $zipPath"
Write-Host "SHA256: $hash"

if (-not $KeepWork) {
    Remove-Item -LiteralPath $workRoot -Recurse -Force
}
