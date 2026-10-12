$ErrorActionPreference = 'Stop'
$planningRoot = Split-Path -Parent $PSScriptRoot
$checkedRules = 0

function Read-PlanningFile([string]$RelativePath) {
    $target = Join-Path $planningRoot $RelativePath
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
        throw "Missing planning file: $RelativePath"
    }
    return Get-Content -LiteralPath $target -Raw -Encoding UTF8
}

function Assert-Rule([string]$RelativePath, [string]$Pattern, [string]$Description) {
    $content = Read-PlanningFile $RelativePath
    if (-not [regex]::IsMatch($content, $Pattern, 'IgnoreCase, Singleline')) {
        throw "$Description failed in $RelativePath"
    }
    $script:checkedRules += 1
}

Assert-Rule 'ROADMAP.md' 'Light as the default.*new and existing installs' 'B1 roadmap default'
Assert-Rule 'THEME-INTEGRATION.md' 'Light stays the default for new and existing installs' 'B1 theme default'
Assert-Rule 'THEME-INTEGRATION.md' 'Missing, invalid or migrated legacy preferences resolve to Light' 'B1 migration default'
Assert-Rule 'DESIGN-SYSTEM.md' 'optional exception.*Light stays the default' 'B1 design exception'
Assert-Rule 'DECISIONS.md' '\| D21 \|[^\r\n]*optional exception[^\r\n]*Optional dark/matching theme' 'B1 decision rationale'
Assert-Rule 'phases/03-page-matched-dark-mode.md' 'Fresh install and existing-install migration.*remain Light' 'B1 acceptance'

foreach ($relativePath in @('ROADMAP.md', 'EXPLANATION-SPEC.md', 'phases/04-guided-tutoring-and-debugging.md')) {
    Assert-Rule $relativePath 'Start Question still returns the full solution by default' 'B2 full-answer default'
    Assert-Rule $relativePath 'idea \+ complete code \+ line-by-line' 'B2 answer sections'
}
Assert-Rule 'phases/04-guided-tutoring-and-debugging.md' 'Tests and acceptance.*Start Question on a new problem.*unchanged from v1' 'B2 regression acceptance'

Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' '50 free-model requests/day per account, shared by all free models' 'B3 shared budget'
Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' 'Cache every validated model-backed result in that problem file' 'B3 canonical cache'
Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' 'providerDispatchCalls === 0' 'B3 zero-dispatch test'
Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' 'Each phase SUMMARY must include a Requests per action table' 'B3 phase evidence'
Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' '51st baseline request is blocked' 'B3 exhaustion test'
Assert-Rule 'IMPLEMENTATION-CONTRACTS.md' 'Uses up to 2 free requests' 'B3 repair disclosure'

$phaseFiles = @(Get-ChildItem -LiteralPath (Join-Path $planningRoot 'phases') -File |
    Where-Object { $_.Name -match '^0[1-8]-.*\.md$' })
if ($phaseFiles.Count -ne 8) { throw 'Expected all eight phase plans' }
foreach ($phaseFile in $phaseFiles) {
    $relativePath = 'phases/' + $phaseFile.Name
    Assert-Rule $relativePath '## Requests per action' 'Per-phase cost specification'
    Assert-Rule $relativePath 'SUMMARY' 'Per-phase evidence requirement'
    if ($phaseFile.Name -notmatch '^03-') {
        Assert-Rule $relativePath 'problem file|problem-file' 'Per-phase cache location'
    } else {
        Assert-Rule $relativePath 'Every theme action costs \*\*0 model requests\*\*' 'Local-only theme cost'
    }
    if ($phaseFile.Name -match '^0[4-8]-') {
        Assert-Rule $relativePath 'Provider-spy.*0 calls|Provider-spy count is 0' 'B3 per-feature zero-dispatch test'
    }
    if ($phaseFile.Name -match '^0[6-8]-') {
        Assert-Rule $relativePath 'Status: \*\*deferred / not approved / not started\*\*' 'Deferred phase gate'
    }
}

Assert-Rule 'PARTNER-REVIEW.md' 'Decision: REQUEST CHANGES' 'Original reviewer decision'
Assert-Rule 'PARTNER-REVIEW.md' 'This revision does not change the reviewer decision to APPROVE PLAN' 'No self-approval'
Assert-Rule 'ROADMAP.md' 'Do not merge this planning branch before that approval' 'Merge gate'

# Historical reviewer findings describe the old proposal; do not rewrite them.
$currentDocs = @('README.md', 'ROADMAP.md', 'THEME-INTEGRATION.md', 'DESIGN-SYSTEM.md', 'DECISIONS.md')
$forbiddenDefaults = '(?:new installs default to Match this page|match-page.{0,35}as the new default|explicit user request for a page-integrated dark experience|replaces the extension''s light-only restriction)'
foreach ($relativePath in $currentDocs) {
    if ([regex]::IsMatch((Read-PlanningFile $relativePath), $forbiddenDefaults, 'IgnoreCase')) {
        throw "Outdated B1 wording remains in $relativePath"
    }
    $checkedRules += 1
}

$linkCount = 0
foreach ($document in Get-ChildItem -LiteralPath $planningRoot -Recurse -File -Filter '*.md') {
    $content = Get-Content -LiteralPath $document.FullName -Raw -Encoding UTF8
    if (([regex]::Matches($content, '(?m)^```').Count % 2) -ne 0) {
        throw "Unbalanced code fence: $($document.Name)"
    }
    foreach ($match in [regex]::Matches($content, '\]\(([^)]+)\)')) {
        $link = $match.Groups[1].Value.Split('#')[0]
        if (-not $link -or $link -match '^(https?://|mailto:|/)' -or $link -notmatch '\.md$') { continue }
        if (-not (Test-Path -LiteralPath (Join-Path $document.DirectoryName $link) -PathType Leaf)) {
            throw "Broken local link in $($document.Name): $link"
        }
        $linkCount += 1
    }
}

Write-Output "Planning validation passed: $checkedRules rules, $linkCount local links, eight phases."
Write-Output 'Runtime acceptance tests remain planned; reviewer approval is still pending.'
