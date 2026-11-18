[CmdletBinding()]
param(
    [string]$ExtensionPath,
    [string]$TemplatePath,
    [string]$OutputDirectory,
    [switch]$KeepWork
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repositoryRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($ExtensionPath)) {
    $ExtensionPath = Join-Path $repositoryRoot 'extension'
}
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $PSScriptRoot 'dist'
}

$sourceExtension = [IO.Path]::GetFullPath($ExtensionPath)
$workRoot = Join-Path $PSScriptRoot '.work'
$templateRoot = Join-Path $workRoot 'mindplus-ext2-builder'

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
} else {
    Write-Host 'Using the Mind+ V2 build files from the repository root...'
    New-Item -ItemType Directory -Path $templateRoot | Out-Null
    foreach ($item in @('.babelrc', 'package.json', 'package-lock.json', 'webpack.config.js', 'scripts', 'utils')) {
        Copy-Item -LiteralPath (Join-Path $repositoryRoot $item) -Destination $templateRoot -Recurse
    }
}

$templateExtension = Join-Path $templateRoot 'extension'
if (Test-Path -LiteralPath $templateExtension) {
    Remove-Item -LiteralPath $templateExtension -Recurse -Force
}
Copy-Item -LiteralPath $sourceExtension -Destination $templateExtension -Recurse

Push-Location $templateRoot
$previousNodeOptions = $env:NODE_OPTIONS
try {
    Write-Host 'Installing template dependencies...'
    & $npmCommand ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

    # The official template uses webpack 4, which requires this with Node.js 18+.
    if ($env:NODE_OPTIONS -notmatch '--openssl-legacy-provider') {
        $env:NODE_OPTIONS = "$previousNodeOptions --openssl-legacy-provider".Trim()
    }
    Write-Host 'Compiling the Mind+ extension...'
    & $npmCommand run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed with exit code $LASTEXITCODE" }
} finally {
    $env:NODE_OPTIONS = $previousNodeOptions
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
